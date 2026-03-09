// backend/handlers/signup.js
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
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

  if (password.length < 8) {
    return err(400, 'Password must be at least 8 characters');
  }

  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: email }],
    });

    const res = await cognito.send(command);
    console.log('SignUp success:', res.UserSub);

    return ok({
      message: 'Signup successful. Check your email for a verification code.',
      userSub: res.UserSub,
    });
  } catch (e) {
    console.error('SignUp error:', e);
    if (e.name === 'UsernameExistsException') {
      return err(409, 'An account with this email already exists.');
    }
    if (e.name === 'InvalidPasswordException') {
      return err(400, 'Password does not meet requirements: min 8 chars, uppercase, lowercase, number, symbol.');
    }
    return err(500, e.message || 'Signup failed');
  }
};
