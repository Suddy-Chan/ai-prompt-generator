const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { topic, count } = requestBody;
    
    // Validate inputs
    if (!topic || !count) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }
    
    // API URL for Gemini
    const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
    
    // Make the request to Gemini API
    const response = await fetch(`${apiUrl}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate EXACTLY ${count} creative and diverse prompt${count > 1 ? 's' : ''} about "${topic}". 
                ${count > 1 ? 'Include a mix of creative, educational, professional, and entertainment prompts.' : ''}
                Format each prompt on a new line with the category in [BRACKETS] at the beginning.
                Make each prompt detailed and specific.
                IMPORTANT: You must generate EXACTLY ${count} prompt${count > 1 ? 's' : ''}, no more and no less.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 800
        }
      })
    });
    
    const data = await response.json();
    
    // Return the response
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 