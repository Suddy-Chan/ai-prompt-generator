document.addEventListener('DOMContentLoaded', async function() {
    const topicInput = document.getElementById('topic-input');
    const generateBtn = document.getElementById('generate-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsSection = document.getElementById('results-section');
    const promptsContainer = document.getElementById('prompts-container');
    const promptCount = document.getElementById('prompt-count');

    // Variable to store the API key
    let geminiApiKey;

    // Function to get the API key
    async function getApiKey() {
        // Check if we're running locally
        const isLocalDevelopment = window.location.hostname === 'localhost' || 
                                  window.location.hostname === '127.0.0.1' ||
                                  window.location.protocol === 'file:';
        
        if (isLocalDevelopment) {
            // For local development, prompt the user for their API key
            // and store it in localStorage
            let localKey = localStorage.getItem('geminiApiKey');
            
            if (!localKey) {
                localKey = prompt('Please enter your Gemini API key for local development:');
                if (localKey) {
                    localStorage.setItem('geminiApiKey', localKey);
                }
            }
            
            return localKey;
        } else {
            // In production, use the Netlify function with the correct path
            try {
                console.log("Fetching API key from Netlify function...");
                // Use the correct path format for Netlify functions
                const response = await fetch('/.netlify/functions/get-api-key');
                
                // Log the response status to help with debugging
                console.log("Function response status:", response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error response from function:", errorData);
                    throw new Error(errorData.error || 'Failed to fetch API key from server');
                }
                
                const data = await response.json();
                
                // Validate that we actually got an API key
                if (!data.apiKey) {
                    console.error("No API key in response:", data);
                    throw new Error('API key not provided by server');
                }
                
                console.log("Successfully retrieved API key from function");
                return data.apiKey;
            } catch (error) {
                console.error('Error fetching API key:', error);
                
                // If we can't get the API key from the function, fall back to localStorage
                const localKey = localStorage.getItem('geminiApiKey');
                if (localKey) {
                    console.log("Using API key from localStorage as fallback");
                    return localKey;
                }
                
                // If no key in localStorage either, return null
                return null;
            }
        }
    }

    // Get the API key when the page loads
    try {
        geminiApiKey = await getApiKey();
        if (!geminiApiKey) {
            throw new Error('API key not available');
        }
    } catch (error) {
        console.error('Error initializing API key:', error);
        alert('Please provide a valid API key to use this application.');
    }

    // Main function to generate prompts
    function generatePrompts(topic) {
        // Clear previous results
        promptsContainer.innerHTML = '';
        
        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        resultsSection.style.display = 'none';
        
        // Use Gemini API
        generatePromptsWithGemini(topic);
    }

    // Function to generate prompts using Gemini API
    async function generatePromptsWithGemini(topic) {
        try {
            // First try to use the proxy function if available
            const count = parseInt(promptCount.value);
            
            // Check if we should use direct API call or proxy function
            if (useProxyFunction) {
                try {
                    // Use the correct path format for Netlify functions
                    const response = await fetch('/.netlify/functions/generate-prompts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            topic: topic,
                            count: count
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to generate prompts');
                    }
                    
                    const data = await response.json();
                    // Process the response...
                    
                } catch (proxyError) {
                    console.error('Error using proxy function, falling back to direct API call:', proxyError);
                    // Fall back to direct API call
                    await directApiCall();
                }
            } else {
                // Use direct API call
                await directApiCall();
            }
            
            // Function for direct API call
            async function directApiCall() {
                // Check if API key is available
                if (!geminiApiKey) {
                    // Try to get the API key again
                    geminiApiKey = await getApiKey();
                    if (!geminiApiKey) {
                        throw new Error('API key not available');
                    }
                }

                // Updated API URL with gemini-2.0-flash model
                const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';
                
                const requestOptions = {
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
                };
                
                // Make the API request
                const response = await fetch(`${apiUrl}?key=${geminiApiKey}`, requestOptions);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'Failed to generate prompts');
                }
                
                const data = await response.json();
                
                // Extract the generated text
                const generatedText = data.candidates[0].content.parts[0].text;
                
                // Parse the response and create prompt cards
                const promptLines = generatedText.split('\n').filter(line => line.trim() !== '');
                
                // Process only the requested number of prompts
                let processedCount = 0;
                
                for (const line of promptLines) {
                    // Extract category and prompt text using regex
                    const categoryMatch = line.match(/^\[([^\]]+)\]/);
                    if (!categoryMatch) continue;
                    
                    const category = categoryMatch[1].toLowerCase();
                    const prompt = line.substring(categoryMatch[0].length).trim();
                    
                    // Create prompt card
                    const promptCard = document.createElement('div');
                    promptCard.className = 'prompt-card';
                    
                    promptCard.innerHTML = `
                        <p class="prompt-text">${prompt}</p>
                        <p class="prompt-category">Category: ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
                        <button class="copy-btn" onclick="copyToClipboard(this)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                            </svg>
                            Copy
                        </button>
                    `;
                    
                    promptsContainer.appendChild(promptCard);
                    
                    processedCount++;
                    if (processedCount >= count) break; // Stop after processing the requested number of prompts
                }
                
                // If we didn't get enough prompts, show an error
                if (processedCount < count) {
                    const errorCard = document.createElement('div');
                    errorCard.className = 'prompt-card error-card';
                    errorCard.innerHTML = `
                        <p>We were only able to generate ${processedCount} prompt${processedCount !== 1 ? 's' : ''} instead of the requested ${count}.</p>
                        <p>Please try again or try a different topic.</p>
                    `;
                    promptsContainer.appendChild(errorCard);
                }
                
            }
            
        } catch (error) {
            console.error('Error generating prompts with AI:', error);
            
            // Show error message
            const errorCard = document.createElement('div');
            errorCard.className = 'prompt-card error-card';
            errorCard.innerHTML = `
                <p>Sorry, there was an error generating prompts.</p>
                <p class="error-details">${error.message}</p>
                <p>Please try again later or try a different topic.</p>
            `;
            promptsContainer.appendChild(errorCard);
        } finally {
            // Hide loading spinner and show results
            loadingSpinner.style.display = 'none';
            resultsSection.style.display = 'block';
        }
    }

    // Event listener for generate button
    generateBtn.addEventListener('click', function() {
        const topic = topicInput.value.trim();
        
        if (topic) {
            generatePrompts(topic);
        } else {
            alert('Please enter a topic first!');
        }
    });

    // Event listener for Enter key
    topicInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const topic = topicInput.value.trim();
            
            if (topic) {
                generatePrompts(topic);
            } else {
                alert('Please enter a topic first!');
            }
        }
    });

    // Add a button to clear the API key from localStorage (for development)
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.protocol === 'file:';
    
    if (isLocalDevelopment) {
        const footer = document.querySelector('footer');
        const clearKeyLink = document.createElement('a');
        clearKeyLink.href = '#';
        clearKeyLink.textContent = ' | Reset API Key';
        clearKeyLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('geminiApiKey');
            alert('API key has been cleared. Refresh the page to enter a new key.');
        });
        footer.appendChild(clearKeyLink);
    }
});

// Function to copy prompt to clipboard
window.copyToClipboard = function(button) {
    const promptText = button.parentElement.querySelector('.prompt-text').textContent;
    
    navigator.clipboard.writeText(promptText).then(() => {
        // Change button text temporarily
        button.innerHTML = 'Copied!';
        
        setTimeout(() => {
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
                Copy
            `;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};
