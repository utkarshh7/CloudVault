// backend/utils/response.js
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

exports.ok = (body) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  body: JSON.stringify(body),
});

exports.err = (statusCode, message) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  body: JSON.stringify({ error: message }),
});

exports.getUserSub = (event) => {
  // Injected by Cognito Authorizer
  return event.requestContext?.authorizer?.claims?.sub;
};

exports.parseBody = (event) => {
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
  } catch {
    return {};
  }
};
