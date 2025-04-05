// netlify/functions/save-score.js (Temporary Test Code)
exports.handler = async (event, context) => {
  console.log("Simple save-score function invoked!"); // Log to check invocation

  // Basic CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Just return a simple success message
  return {
    statusCode: 200, // OK
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: "Hello from simplified save-score!" }),
  };
};