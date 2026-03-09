// backend/handlers/confirmSignup.js
const {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { ok, err, parseBody } = require('../utils/response');

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok({});

  const { email, code } = parseBody(event);

  if (!email || !code) {
    return err(400, 'email and code are required');
  }

  try {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
      })
    );

    console.log('ConfirmSignUp success for:', email);
    return ok({ message: 'Email verified! You can now sign in.' });
  } catch (e) {
    console.error('ConfirmSignUp error:', e);
    if (e.name === 'CodeMismatchException') {
      return err(400, 'Invalid verification code. Please try again.');
    }
    if (e.name === 'ExpiredCodeException') {
      return err(400, 'Verification code expired. Request a new one.');
    }
    return err(500, e.message || 'Confirmation failed');
  }
};
