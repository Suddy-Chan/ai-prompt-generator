// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

exports.handler = async function(event, context) {
  // You can add additional security checks here if needed
  // For example, check for a specific header or referrer
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      apiKey: process.env.GEMINI_API_KEY
    })
  };
};
