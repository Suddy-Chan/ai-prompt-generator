# AI Prompt Generator

A web application that generates creative AI prompts for any topic using Google's Gemini API.

## Features

- Generate 1-10 creative prompts for any topic
- Categorized prompts (creative, educational, professional, entertainment)
- One-click copy functionality
- Clean, responsive interface
- Secure API key handling

## Demo

[Live Demo](https://ai-prompt-generator-2025.netlify.app/)

## Setup and Installation

### Prerequisites

- A Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-prompt-generator.git
   cd ai-prompt-generator
   ```

2. Open `index.html` in your browser.

3. When you first run the application locally, you'll be prompted to enter your Gemini API key. This key will be stored in your browser's localStorage for convenience during development.

4. To reset your API key at any time, click the "Reset API Key" link in the footer.

## How It Works

1. Enter a topic in the input field
2. Select the number of prompts you want to generate (1-10)
3. Click "Generate Prompts"
4. The application will use the Gemini API to generate creative prompts
5. Copy any prompt you like with the "Copy" button

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Google Gemini API
- Netlify for hosting and serverless functions

## Privacy

This application does not store your topics or generated prompts on any server. When running locally, your API key is stored in your browser's localStorage for convenience. When deployed to Netlify, your API key is securely stored as an environment variable and never exposed to the client.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
