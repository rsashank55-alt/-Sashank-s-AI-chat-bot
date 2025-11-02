# Sashank's AI Chat Bot 💬

A premium, full-featured AI chatbot with a beautiful dark theme UI, inspired by ChatGPT, featuring advanced math rendering, conversation management, and a polished user experience.

## ✨ Features

### 🎨 Premium UI/UX
- **Modern Dark Theme** - Professional dark interface with carefully crafted color scheme
- **ChatGPT-like Layout** - Full-screen interface with sidebar for conversation history
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Polished transitions and micro-interactions
- **Glassmorphism Effects** - Modern frosted glass styling

### 🧮 Advanced Features
- **Math Rendering** - Beautiful LaTeX equation rendering using KaTeX
  - Supports block math: `\[...\]` or $$...$$`
  - Supports inline math: `$...$`
  - Automatic formula detection and conversion
- **Emoji Support** - Native emoji rendering
- **Markdown Formatting** - Bold, italic, code blocks, lists
- **Text Formatting** - Proper paragraph spacing and typography

### 💬 Chat Features
- **Conversation Management** - Create, save, and switch between conversations
- **Message Actions** - Copy, edit, regenerate, delete messages
- **Typing Indicator** - Visual feedback during AI responses
- **Stop Generation** - Cancel ongoing AI responses
- **Auto-scroll** - Smooth scrolling to latest messages
- **Welcome Screen** - Suggested prompts for quick start

### ⚙️ Settings & Customization
- **Model Selection** - Choose AI model
- **Temperature Control** - Adjust response creativity
- **Token Limits** - Set maximum response length
- **API Configuration** - Easy API key management

### 🔧 Technical Features
- **Local Storage** - Persist conversations and settings
- **Error Handling** - Robust error messages and recovery
- **Debug Panel** - Development tools (Ctrl+D / Cmd+D)
- **Keyboard Shortcuts** - Efficient navigation

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An API key from [Euron AI](https://api.euron.one)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rsashank55-alt/-Sashank-s-AI-chat-bot.git
   cd -Sashank-s-AI-chat-bot
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Configure API**
   - The API endpoint and key are pre-configured
   - You can modify them in `script.js` under `API_CONFIG`

## 📁 Project Structure

```
.
├── index.html      # Main HTML structure
├── styles.css      # All styling and theme
├── script.js       # Core functionality and logic
├── .gitignore      # Git ignore rules
└── README.md       # This file
```

## 🎯 Usage

### Basic Chat
1. Type your message in the input field at the bottom
2. Press Enter or click the send button
3. Wait for the AI response

### Math Formulas
- **Display math**: Use `\[formula\]` or `$$formula$$`
  ```
  \[SI = \frac{P \times R \times T}{100}\]
  ```
- **Inline math**: Use `$formula$`
  ```
  The value is $x = 5$
  ```

### Conversation Management
- Click "New chat" to start a fresh conversation
- Click on conversation items in the sidebar to switch
- Conversations are automatically saved

### Message Actions
- **Hover over messages** to see action buttons
- **Copy**: Copy message text to clipboard
- **Edit**: Edit and resend your message
- **Regenerate**: Get a new AI response
- **Delete**: Remove a message

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #10a37f;
    --bg-main: #212121;
    --text-primary: #ffffff;
    /* ... more variables */
}
```

### API Configuration
Modify in `script.js`:
```javascript
const API_CONFIG = {
    url: 'https://api.euron.one/api/v1/euri/chat/completions',
    apiKey: 'your-api-key',
    defaultModel: 'gpt-4.1-nano'
};
```

## 🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with modern features
- **JavaScript (ES6+)** - Core functionality
- **KaTeX** - Math rendering
- **LocalStorage API** - Data persistence

## 📝 License

This project is open source and available for personal use.

## 👤 Author

**Sashank**
- GitHub: [@rsashank55-alt](https://github.com/rsashank55-alt)

## 🙏 Acknowledgments

- Inspired by ChatGPT's design
- KaTeX for beautiful math rendering
- Inter font family for typography

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

⭐ **Star this repo if you found it helpful!**

