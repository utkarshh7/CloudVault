// backend/handlers/login.js
const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { ok, err, parseBody } = require('../utils/response');

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const { email, password } = parseBody(event);

  if (!email || !password) {
    return err(400, 'email and password are required');
  }

  try {
    const res = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      })
    );

    const { AuthenticationResult } = res;
    console.log('Login success for:', email);

    // Decode sub from ID token (JWT payload)
    const payload = JSON.parse(
      Buffer.from(AuthenticationResult.IdToken.split('.')[1], 'base64').toString()
    );

    return ok({
      idToken: AuthenticationResult.IdToken,
      accessToken: AuthenticationResult.AccessToken,
      refreshToken: AuthenticationResult.RefreshToken,
      expiresIn: AuthenticationResult.ExpiresIn,
      sub: payload.sub,
    });
  } catch (e) {
    console.error('Login error:', e.name, e.message);
    if (e.name === 'NotAuthorizedException') {
      return err(401, 'Invalid email or password.');
    }
    if (e.name === 'UserNotConfirmedException') {
      return err(403, 'Please verify your email before signing in.');
    }
    if (e.name === 'UserNotFoundException') {
      return err(401, 'Invalid email or password.');
    }
    return err(500, e.message || 'Login failed');
  }
};
