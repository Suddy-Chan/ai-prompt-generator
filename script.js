document.addEventListener('DOMContentLoaded', function() {
    const topicInput = document.getElementById('topic-input');
    const generateBtn = document.getElementById('generate-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsSection = document.getElementById('results-section');
    const promptsContainer = document.getElementById('prompts-container');

    // Get API key from config file
    const geminiApiKey = config.apiKey;

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
                                    text: `Generate 8 creative and diverse prompts about "${topic}". 
                                    Include a mix of creative, educational, professional, and entertainment prompts. 
                                    Format each prompt on a new line with the category in [BRACKETS] at the beginning.
                                    Make each prompt detailed and specific.`
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
            
            promptLines.forEach(line => {
                // Extract category and prompt text using regex
                const categoryMatch = line.match(/^\[([^\]]+)\]/);
                if (!categoryMatch) return;
                
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
            });
            
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
});
