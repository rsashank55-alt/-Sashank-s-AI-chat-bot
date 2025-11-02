// API Configuration
const API_CONFIG = {
    url: "https://api.euron.one/api/v1/euri/chat/completions",
    apiKey: "euri-d0c00732524b1b5ae66443fd154d33e118a6d7c22f2ce04a823f9bf58a3125df",
    defaultModel: "gpt-4.1-nano",
    defaultMaxTokens: 1000,
    defaultTemperature: 0.7
};

// DOM Elements
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    menuToggle: document.getElementById('menuToggle'),
    newChatBtn: document.getElementById('newChatBtn'),
    newChatBtnMobile: document.getElementById('newChatBtnMobile'),
    mainContent: document.getElementById('mainContent'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageInput: document.getElementById('messageInput'),
    inputContainer: document.getElementById('inputContainer'),
    sendBtn: document.getElementById('sendBtn'),
    stopBtn: document.getElementById('stopBtn'),
    typingIndicator: document.getElementById('typingIndicator'),
    charCount: document.getElementById('charCount'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    temperature: document.getElementById('temperature'),
    temperatureValue: document.getElementById('temperatureValue'),
    maxTokens: document.getElementById('maxTokens'),
    clearChatBtn: document.getElementById('clearChatBtn'),
    attachBtn: document.getElementById('attachBtn'),
    messageMenu: document.getElementById('messageMenu'),
    copyMessageBtn: document.getElementById('copyMessageBtn'),
    editMessageBtn: document.getElementById('editMessageBtn'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    deleteMessageBtn: document.getElementById('deleteMessageBtn'),
    conversationsList: document.getElementById('conversationsList'),
    debugPanel: document.getElementById('debugPanel'),
    closeDebug: document.getElementById('closeDebug'),
    debugRequest: document.getElementById('debugRequest'),
    debugResponse: document.getElementById('debugResponse'),
    debugError: document.getElementById('debugError')
};

// State Management
const state = {
    messages: [],
    isLoading: false,
    isGenerating: false,
    currentConversationId: null,
    conversations: JSON.parse(localStorage.getItem('conversations')) || [],
    temperature: parseFloat(localStorage.getItem('temperature')) || API_CONFIG.defaultTemperature,
    maxTokens: parseInt(localStorage.getItem('maxTokens')) || API_CONFIG.defaultMaxTokens,
    userName: 'Sashank',
    selectedMessageId: null,
    abortController: null
};

// Initialize
function init() {
    loadSettings();
    setupEventListeners();
    updateCharCount();
    loadConversations();
    setupTextareaResize();
    
    // Hide welcome screen if messages exist
    if (state.messages.length > 0) {
        hideWelcomeScreen();
    }
    
    // Test API connection on load
    testAPIConnection();
}

// Setup Textarea Auto-resize
function setupTextareaResize() {
    if (elements.messageInput) {
        elements.messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
            updateCharCount();
        });
    }
}

// Toggle Sidebar
function toggleSidebar() {
    elements.sidebar?.classList.toggle('hidden');
    elements.mainContent?.classList.toggle('sidebar-hidden');
    
    if (window.innerWidth <= 768) {
        elements.sidebar?.classList.toggle('active');
    }
}

// New Chat
function newChat() {
    state.messages = [];
    state.currentConversationId = null;
    elements.messagesContainer.innerHTML = '';
    showWelcomeScreen();
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    updateCharCount();
    elements.messageInput.focus();
}

// Show/Hide Welcome Screen
function showWelcomeScreen() {
    elements.welcomeScreen?.classList.remove('hidden');
}

function hideWelcomeScreen() {
    elements.welcomeScreen?.classList.add('hidden');
}

// Test API Connection
async function testAPIConnection() {
    console.log('Testing API connection...');
    const testPayload = {
        messages: [
            {
                role: "user",
                content: "Say 'API connection successful' if you can read this."
            }
        ],
        model: API_CONFIG.defaultModel,
        max_tokens: 50,
        temperature: 0.7
    };

    try {
        const response = await fetch(API_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify(testPayload)
        });

        console.log('Test API Response Status:', response.status);
        const responseText = await response.text();
        console.log('Test API Response:', responseText);

        if (response.ok) {
            console.log('✅ API connection test successful');
            updateStatus('Online', '#10b981');
        } else {
            console.error('❌ API connection test failed:', response.status);
            updateStatus('API Error', '#ef4444');
            showNotification('API test failed. Check console for details.');
        }
    } catch (error) {
        console.error('❌ API connection test error:', error);
        updateStatus('Connection Error', '#ef4444');
        showNotification('Cannot connect to API. Check console for details.');
    }
}

// Update Status
function updateStatus(text, color) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.style.color = color;
        
        // Update the dot color by modifying the ::before pseudo-element via CSS
        const style = document.createElement('style');
        style.id = 'status-style';
        const existingStyle = document.getElementById('status-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        style.textContent = `#status::before { background: ${color} !important; }`;
        document.head.appendChild(style);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    elements.sidebarToggle?.addEventListener('click', toggleSidebar);
    elements.menuToggle?.addEventListener('click', toggleSidebar);
    
    // New chat buttons
    elements.newChatBtn?.addEventListener('click', newChat);
    elements.newChatBtnMobile?.addEventListener('click', newChat);
    
    // Suggested prompts
    document.querySelectorAll('.prompt-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.dataset.prompt;
            if (prompt) {
                elements.messageInput.value = prompt;
                elements.messageInput.style.height = 'auto';
                updateCharCount();
                hideWelcomeScreen();
                sendMessage();
            }
        });
    });
    
    // Send message
    elements.sendBtn?.addEventListener('click', sendMessage);
    elements.messageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Stop generating
    elements.stopBtn?.addEventListener('click', stopGenerating);

    // Character count and send button state
    elements.messageInput?.addEventListener('input', () => {
        updateCharCount();
        updateSendButton();
    });

    // Settings modal
    elements.settingsBtn?.addEventListener('click', () => {
        elements.settingsModal?.classList.add('active');
    });

    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.classList.remove('active');
    });

    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.remove('active');
        }
    });

    // Settings controls
    elements.temperature.addEventListener('input', (e) => {
        state.temperature = parseFloat(e.target.value);
        elements.temperatureValue.textContent = state.temperature.toFixed(1);
        saveSettings();
    });

    elements.maxTokens.addEventListener('input', (e) => {
        state.maxTokens = parseInt(e.target.value);
        saveSettings();
    });

    elements.clearChatBtn.addEventListener('click', clearChatHistory);

    // Debug panel
    if (elements.closeDebug) {
        elements.closeDebug.addEventListener('click', () => {
            elements.debugPanel?.classList.remove('active');
        });
    }

    // Toggle debug panel with Ctrl+D or Cmd+D
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (elements.debugPanel) {
                elements.debugPanel.classList.toggle('active');
            }
        }
    });

    // Attachment button (placeholder for future feature)
    elements.attachmentBtn.addEventListener('click', () => {
        showNotification('File attachment feature coming soon!');
    });

    // Emoji button (placeholder for future feature)
    elements.emojiBtn.addEventListener('click', () => {
        showNotification('Emoji picker coming soon!');
    });

    // Auto-scroll on new messages
    const observer = new MutationObserver(() => {
        scrollToBottom();
    });
    observer.observe(elements.messagesContainer, { childList: true });
}

// Send Message
async function sendMessage() {
    const messageText = elements.messageInput.value.trim();
    
    if (!messageText || state.isLoading) {
        return;
    }

    // Hide welcome screen
    hideWelcomeScreen();
    
    // Create conversation if new
    if (!state.currentConversationId) {
        state.currentConversationId = Date.now().toString();
        addConversationToList(state.currentConversationId, messageText.substring(0, 50));
    }

    // Add user message
    const userMessageId = addMessage('user', messageText);
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    updateCharCount();
    updateSendButton();

    // Show typing indicator
    showTypingIndicator();
    showStopButton();

    // Get AI response
    try {
        state.isLoading = true;
        state.isGenerating = true;
        const response = await getAIResponse(messageText);
        hideTypingIndicator();
        hideStopButton();
        const aiMessageId = addMessage('ai', response);
        updateConversationTitle(state.currentConversationId, messageText);
        state.isLoading = false;
        state.isGenerating = false;
    } catch (error) {
        hideTypingIndicator();
        hideStopButton();
        console.error('Error:', error);
        
        // Show detailed error message to user
        const errorMessage = error.message || 'Sorry, I encountered an error. Please try again.';
        addMessage('ai', `❌ Error: ${errorMessage}`);
        
        state.isLoading = false;
        state.isGenerating = false;
    }
}

// Stop Generating
function stopGenerating() {
    if (state.abortController) {
        state.abortController.abort();
        state.abortController = null;
    }
    hideTypingIndicator();
    hideStopButton();
    state.isLoading = false;
    state.isGenerating = false;
}

function showStopButton() {
    if (elements.stopBtn) {
        elements.stopBtn.style.display = 'flex';
    }
}

function hideStopButton() {
    if (elements.stopBtn) {
        elements.stopBtn.style.display = 'none';
    }
}

function updateSendButton() {
    const hasText = elements.messageInput.value.trim().length > 0;
    if (elements.sendBtn) {
        elements.sendBtn.disabled = !hasText || state.isLoading;
    }
}

// Get AI Response
async function getAIResponse(userMessage) {
    // Add user message to conversation history
    state.messages.push({
        role: 'user',
        content: userMessage
    });
    
    // Create abort controller for cancellation
    state.abortController = new AbortController();

    // Add system message to ensure proper formatting
    const messagesWithSystem = [
        {
            role: 'system',
            content: 'You are a helpful AI assistant. When writing mathematical formulas, always use LaTeX format: wrap display formulas (block equations) with \\[...\\] or $$...$$, and inline formulas with $...$. For example: "The formula is $$SI = \\frac{P \\times R \\times T}{100}$$" Use emojis appropriately to make responses more engaging and visually appealing when suitable.'
        },
        ...state.messages
    ];
    
    const payload = {
        messages: messagesWithSystem,
        model: API_CONFIG.defaultModel,
        max_tokens: state.maxTokens,
        temperature: state.temperature
    };

    // Update debug panel
    updateDebugPanel('request', {
        url: API_CONFIG.url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.apiKey.substring(0, 20)}...`
        },
        payload: payload
    });

    console.log('Sending request to API:', {
        url: API_CONFIG.url,
        payload: payload
    });

    try {
        const response = await fetch(API_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify(payload),
            signal: state.abortController.signal
        });

        console.log('API Response Status:', response.status, response.statusText);

        // Get response text first to see what we're working with
        const responseText = await response.text();
        console.log('API Response Text:', responseText);
        
        // Update debug panel with response
        updateDebugPanel('response', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText
        });

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            throw new Error(`Invalid JSON response from API: ${responseText.substring(0, 200)}`);
        }

        if (!response.ok) {
            const errorMessage = data.error?.message || 
                                data.message || 
                                data.error ||
                                `HTTP ${response.status}: ${response.statusText}`;
            console.error('API Error:', data);
            throw new Error(errorMessage);
        }

        // Try multiple possible response formats
        let aiMessage = null;
        
        // Format 1: OpenAI-style (choices[0].message.content)
        if (data.choices && data.choices[0] && data.choices[0].message) {
            aiMessage = data.choices[0].message.content;
        }
        // Format 2: Direct content field
        else if (data.content) {
            aiMessage = data.content;
        }
        // Format 3: Message field
        else if (data.message) {
            aiMessage = data.message;
        }
        // Format 4: Text field
        else if (data.text) {
            aiMessage = data.text;
        }
        // Format 5: Response field
        else if (data.response) {
            aiMessage = data.response;
        }
        // Format 6: Check if response is directly in data
        else if (typeof data === 'string') {
            aiMessage = data;
        }
        // Format 7: Check for nested structures
        else if (data.data && data.data.content) {
            aiMessage = data.data.content;
        }
        else {
            console.warn('Unexpected response format:', data);
            aiMessage = `Received response in unexpected format. Raw data: ${JSON.stringify(data).substring(0, 200)}`;
        }

        if (!aiMessage || aiMessage.trim() === '') {
            throw new Error('Empty response from API');
        }

        // Add AI message to conversation history
        state.messages.push({
            role: 'assistant',
            content: aiMessage
        });

        // Save chat history
        saveChatHistory();

        return aiMessage;
        
    } catch (error) {
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Update debug panel with error
        updateDebugPanel('error', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Remove the user message from state if API call failed
        state.messages.pop();
        
        // Re-throw with more context
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Network error: Please check your internet connection and try again.');
        } else if (error.message.includes('CORS')) {
            throw new Error('CORS error: The API may not allow requests from this origin.');
        } else {
            throw error;
        }
    }
}

// Process text to render math equations and format text
function processMathText(text) {
    // Store placeholders for special content
    const placeholders = {
        mathBlocks: [],
        codeBlocks: [],
        blockIndex: 0
    };

    // Step 0: Handle emojis first (before HTML escaping)
    // Convert common emoji codes to actual emojis
    const emojiMap = {
        ':money:': '💰',
        ':calculator:': '🧮',
        ':chart:': '📊',
        ':check:': '✅',
        ':star:': '⭐',
        ':rocket:': '🚀',
        ':lightbulb:': '💡',
        ':book:': '📚',
        ':key:': '🔑',
        ':arrow_right:': '→',
        ':arrow_left:': '←',
        ':equals:': '=',
    };
    
    let processed = text;
    
    // Replace emoji codes
    Object.keys(emojiMap).forEach(code => {
        processed = processed.replace(new RegExp(code, 'g'), emojiMap[code]);
    });
    
    // Preserve actual emojis (they should already be in the text)
    // Now escape HTML to prevent XSS
    processed = processed
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Step 0.5: Handle MATHBLOCK placeholders from AI responses
    // Pattern: __MATHBLOCK0__, MATHBLOCK1, _MATHBLOCK2_, etc. - remove them as they're just markers
    // Match any number of underscores before and after MATHBLOCK followed by digits
    processed = processed.replace(/_{0,3}MATHBLOCK\d+_{0,3}/gi, '');
    
    // Also handle variations with underscores that might have spaces
    processed = processed.replace(/\s*_{0,3}MATHBLOCK\d+_{0,3}\s*/gi, ' ');
    
    // Step 0.6: Convert common interest formulas to LaTeX format
    // Simple Interest: SI = P * R * T / 100 or SI = (P × R × T) / 100
    processed = processed.replace(/\bSI\s*=\s*(?:\(|)(?:P|Principal)\s*[×*]\s*(?:R|Rate)\s*[×*]\s*(?:T|Time)(?:\)|)\s*[/÷]\s*100/gi, (match) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: 'SI = \\frac{P \\times R \\times T}{100}', type: 'display' });
        placeholders.blockIndex++;
        return placeholder;
    });
    
    // Simple Interest alternative: SI = (P × R × T) / 100
    processed = processed.replace(/\bSI\s*=\s*\(\s*P\s*[×*]\s*R\s*[×*]\s*T\s*\)\s*[/÷]\s*100/gi, (match) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: 'SI = \\frac{P \\times R \\times T}{100}', type: 'display' });
        placeholders.blockIndex++;
        return placeholder;
    });
    
    // Total Amount with SI: A = P + SI or A = P + (P × R × T) / 100
    processed = processed.replace(/\bA\s*=\s*P\s*\+\s*SI/gi, (match) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: 'A = P + SI = P + \\frac{P \\times R \\times T}{100}', type: 'display' });
        placeholders.blockIndex++;
        return placeholder;
    });
    
    // Compound Interest: A = P(1 + R/100)^T or A = P(1 + R/100)^T
    processed = processed.replace(/\bA\s*=\s*P\s*\(\s*1\s*\+\s*R\s*[/÷]\s*100\s*\)\s*\^\s*T/gi, (match) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: 'A = P \\left(1 + \\frac{R}{100}\\right)^T', type: 'display' });
        placeholders.blockIndex++;
        return placeholder;
    });
    
    // Compound Interest: CI = A - P
    processed = processed.replace(/\bCI\s*=\s*A\s*-\s*P/gi, (match) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: 'CI = A - P = P \\left(1 + \\frac{R}{100}\\right)^T - P', type: 'display' });
        placeholders.blockIndex++;
        return placeholder;
    });
    
    // Step 1: Handle block math \[...\] (LaTeX display mode)
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, content) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: content.trim(), type: 'display' });
        placeholders.blockIndex++;
        return placeholder;
    });

    // Step 2: Handle block math $$...$$ (double dollar signs)
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, content) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: content.trim(), type: 'display' });
        placeholders.blockIndex++;
        return placeholder;
    });
    
    // Step 2.5: Handle other math formulas in common formats
    // Match standalone formulas that contain math operators
    processed = processed.replace(/\b([A-Z][A-Za-z]*)\s*=\s*([^\n\.]{5,50}?)(?=[\.\,\n]|$)/g, (match, varName, formula) => {
        // Check if it looks like a math formula (contains math operators and isn't just text)
        if (formula && /[\+\-\*\/\^\(\)×÷]/.test(formula) && !formula.includes(' ') || /[\+\-\*\/\^\(\)×÷]/.test(formula)) {
            // Convert common symbols to LaTeX
            let latexFormula = formula
                .replace(/×/g, '\\times')
                .replace(/÷/g, '\\div')
                .replace(/\^/g, '^')
                .replace(/\s*\/\s*/g, ' \\frac{}{}') // Simple fraction attempt
                .replace(/\s*\*\s*/g, ' \\times ');
            
            const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
            placeholders.mathBlocks.push({ placeholder, content: `${varName} = ${latexFormula}`, type: 'display' });
            placeholders.blockIndex++;
            return placeholder;
        }
        return match;
    });

    // Step 3: Handle inline math $...$ (single dollar signs, but not $$)
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, content, offset, string) => {
        const before = string.substring(Math.max(0, offset - 1), offset);
        const after = string.substring(offset + match.length, offset + match.length + 1);
        
        if (before === '$' || after === '$') {
            return match;
        }
        if (content.includes('__MATH_BLOCK_')) {
            return match;
        }
        return `<span class="math-inline">${content.trim()}</span>`;
    });

    // Step 4: Handle \boxed{} for answers
    processed = processed.replace(/\\boxed\{([\s\S]*?)\}/g, (match, content) => {
        const placeholder = `__MATH_BLOCK_${placeholders.blockIndex}__`;
        placeholders.mathBlocks.push({ placeholder, content: content.trim(), type: 'boxed' });
        placeholders.blockIndex++;
        return placeholder;
    });

    // Step 5: Format markdown-style text
    // Bold text **text** or __text__ (must do before italic to avoid conflicts)
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Only match __text__ if it's not a math block placeholder
    processed = processed.replace(/__(?!MATH_BLOCK_)([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic text *text* or _text_ (avoid matching inside bold by checking context)
    processed = processed.replace(/([^*]|^)\*([^*]+?)\*([^*]|$)/g, '$1<em>$2</em>$3');
    // Only match _text_ if it's not part of a math placeholder
    processed = processed.replace(/([^_]|^)_(?!MATH_BLOCK_)([^_]+?)_([^_]|$)/g, '$1<em>$2</em>$3');
    
    // Code inline `code`
    processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Step 6: Handle numbered lists (1., 2., etc.)
    processed = processed.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="list-item numbered">$1. $2</div>');

    // Step 7: Handle bullet points (-, *, •)
    processed = processed.replace(/^[-•*]\s+(.+)$/gm, '<div class="list-item bulleted">• $1</div>');

    // Step 8: Handle paragraphs (double line breaks) - do this carefully
    // First, split by double line breaks
    const paragraphs = processed.split(/\n\n+/);
    processed = paragraphs
        .filter(p => p.trim())
        .map(p => `<p class="paragraph">${p.trim()}</p>`)
        .join('');

    // Step 8.5: Clean up any remaining MATH_PLACEHOLDER markers and MATHBLOCK patterns
    processed = processed.replace(/\[MATH_PLACEHOLDER_\d+\]/g, '');
    
    // Final cleanup: Remove any remaining MATHBLOCK patterns that might have been missed
    processed = processed.replace(/\s*_{0,5}MATHBLOCK\d+_{0,5}\s*/gi, ' ');
    
    // Clean up multiple spaces that might result from removals
    processed = processed.replace(/\s{2,}/g, ' ');
    
    // Step 9: Replace math block placeholders with actual divs
    placeholders.mathBlocks.forEach(({ placeholder, content, type }) => {
        if (type === 'boxed') {
            processed = processed.replace(placeholder, `<div class="math-block boxed">${content}</div>`);
        } else {
            processed = processed.replace(placeholder, `<div class="math-block">${content}</div>`);
        }
    });

    // Step 10: Convert remaining single line breaks to <br> (avoid breaking HTML tags)
    // Replace newlines that aren't already handled
    processed = processed.split('\n').map((line, index, array) => {
        const trimmed = line.trim();
        // Skip if it's already HTML or empty
        if (trimmed.startsWith('<') || trimmed === '' || index === 0) {
            return line;
        }
        // Add <br> before non-HTML lines that follow non-empty lines
        if (array[index - 1] && array[index - 1].trim() !== '' && !trimmed.startsWith('<')) {
            return '<br>' + line;
        }
        return line;
    }).join('\n');
    
    // Final cleanup: remove any remaining newlines (they should all be converted now)
    processed = processed.replace(/\n/g, '');

    // Step 11: Clean up nested empty tags
    processed = processed.replace(/<p class="paragraph">\s*<\/p>/g, '');

    return processed;
}

// Render math in an element
function renderMathInElement(element) {
    // Check if KaTeX is loaded
    if (typeof window !== 'undefined' && window.katex && typeof window.katex.render === 'function') {
        try {
            // Render block math
            const mathBlocks = element.querySelectorAll('.math-block:not(.katex-rendered)');
            mathBlocks.forEach(block => {
                try {
                    // Skip if already rendered
                    if (block.classList.contains('katex-rendered')) return;
                    
                    const mathContent = block.textContent || block.innerText;
                    if (!mathContent || !mathContent.trim()) return;
                    
                    // Clear the block first
                    const originalContent = mathContent;
                    block.textContent = '';
                    
                    // Render with KaTeX
                    window.katex.render(originalContent.trim(), block, {
                        displayMode: true,
                        throwOnError: false,
                        errorColor: '#ef4444',
                        strict: false
                    });
                    
                    // Mark as rendered
                    block.classList.add('katex-rendered');
                } catch (e) {
                    console.error('KaTeX block render error:', e, 'Content:', block.textContent || block.innerText);
                    // Restore original text if rendering fails
                    if (block.textContent === '') {
                        block.textContent = block.innerText || originalContent || 'Math rendering error';
                    }
                }
            });

            // Render inline math
            const mathInlines = element.querySelectorAll('.math-inline:not(.katex-rendered)');
            mathInlines.forEach(inline => {
                try {
                    // Skip if already rendered
                    if (inline.classList.contains('katex-rendered')) return;
                    
                    const mathContent = inline.textContent || inline.innerText;
                    if (!mathContent || !mathContent.trim()) return;
                    
                    // Clear the inline first
                    const originalContent = mathContent;
                    inline.textContent = '';
                    
                    // Render with KaTeX
                    window.katex.render(originalContent.trim(), inline, {
                        displayMode: false,
                        throwOnError: false,
                        errorColor: '#ef4444',
                        strict: false
                    });
                    
                    // Mark as rendered
                    inline.classList.add('katex-rendered');
                } catch (e) {
                    console.error('KaTeX inline render error:', e, 'Content:', inline.textContent || inline.innerText);
                    // Restore original text if rendering fails
                    if (inline.textContent === '') {
                        inline.textContent = inline.innerText || originalContent || 'Math rendering error';
                    }
                }
            });
        } catch (e) {
            console.error('KaTeX render error:', e);
        }
    } else {
        // KaTeX not loaded yet, try again after a short delay (max 15 attempts)
        const attempts = parseInt(element.dataset.renderAttempts || '0');
        if (attempts < 15) {
            element.dataset.renderAttempts = String(attempts + 1);
            setTimeout(() => renderMathInElement(element), 300);
        } else {
            console.warn('KaTeX failed to load after multiple attempts. Math formulas may not render correctly.');
        }
    }
}

// Add Message to UI
function addMessage(role, text) {
    const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.dataset.messageId = messageId;

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'S' : 'AI';

    // Content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';

    // Message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    // Process text for math rendering
    const processedText = processMathText(text);
    messageText.innerHTML = processedText;

    // Message actions
    const messageActions = document.createElement('div');
    messageActions.className = 'message-actions';
    
    if (role === 'user') {
        messageActions.innerHTML = `
            <button class="action-btn" onclick="editMessage('${messageId}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
            </button>
            <button class="action-btn" onclick="deleteMessage('${messageId}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
            </button>
        `;
    } else {
        messageActions.innerHTML = `
            <button class="action-btn" onclick="copyMessage('${messageId}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
            </button>
            <button class="action-btn" onclick="regenerateResponse('${messageId}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Regenerate
            </button>
        `;
    }

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageActions);
    contentWrapper.appendChild(messageContent);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentWrapper);
    elements.messagesContainer.appendChild(messageDiv);
    
    // Render math equations after adding to DOM
    // Use requestAnimationFrame to ensure DOM is fully ready
    requestAnimationFrame(() => {
        renderMathInElement(messageText);
    });
    
    // Also try rendering after a short delay to catch any late-loading issues
    setTimeout(() => {
        renderMathInElement(messageText);
    }, 100);
    
    scrollToBottom();
    saveChatHistory();

    return messageId;
}

// Show Typing Indicator
function showTypingIndicator() {
    elements.typingIndicator.classList.add('active');
    scrollToBottom();
}

// Hide Typing Indicator
function hideTypingIndicator() {
    elements.typingIndicator.classList.remove('active');
}

// Scroll to Bottom
function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// Update Character Count
function updateCharCount() {
    if (!elements.messageInput || !elements.charCount) return;
    const count = elements.messageInput.value.length;
    elements.charCount.textContent = `${count} / 4000`;
    updateSendButton();
    
    if (count > 3600) {
        elements.charCount.style.color = '#ef4444';
    } else if (count > 3000) {
        elements.charCount.style.color = '#f59e0b';
    } else {
        elements.charCount.style.color = '#8e8ea0';
    }
}

// Conversation Management
function addConversationToList(id, title) {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.dataset.conversationId = id;
    item.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="conversation-title">${title}</span>
    `;
    item.addEventListener('click', () => loadConversation(id));
    elements.conversationsList?.insertBefore(item, elements.conversationsList.firstChild);
    state.conversations.unshift({ id, title, messages: [] });
    saveConversations();
}

function updateConversationTitle(id, title) {
    const item = document.querySelector(`[data-conversation-id="${id}"]`);
    if (item) {
        item.querySelector('.conversation-title').textContent = title.substring(0, 50);
        const conv = state.conversations.find(c => c.id === id);
        if (conv) conv.title = title.substring(0, 50);
        saveConversations();
    }
}

function loadConversations() {
    state.conversations.forEach(conv => {
        addConversationToList(conv.id, conv.title);
    });
}

function loadConversation(id) {
    const conv = state.conversations.find(c => c.id === id);
    if (conv) {
        state.currentConversationId = id;
        state.messages = conv.messages || [];
        elements.messagesContainer.innerHTML = '';
        if (state.messages.length > 0) {
            hideWelcomeScreen();
            state.messages.forEach(msg => {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    addMessageToUI(msg.role, msg.content);
                }
            });
            // Re-render all math after loading all messages
            setTimeout(() => {
                const allMessageTexts = document.querySelectorAll('.message-text');
                allMessageTexts.forEach(msgText => {
                    renderMathInElement(msgText);
                });
            }, 200);
        } else {
            showWelcomeScreen();
        }
        // Update active state
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.toggle('active', item.dataset.conversationId === id);
        });
    }
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(state.conversations));
}

function addMessageToUI(role, text) {
    const messageId = addMessage(role, text);
    return messageId;
}

// Save Settings
function saveSettings() {
    localStorage.setItem('temperature', state.temperature.toString());
    localStorage.setItem('maxTokens', state.maxTokens.toString());
}

// Load Settings
function loadSettings() {
    const savedTemp = localStorage.getItem('temperature');
    const savedTokens = localStorage.getItem('maxTokens');
    
    if (savedTemp) {
        state.temperature = parseFloat(savedTemp);
        elements.temperature.value = state.temperature;
        elements.temperatureValue.textContent = state.temperature.toFixed(1);
    }
    
    if (savedTokens) {
        state.maxTokens = parseInt(savedTokens);
        elements.maxTokens.value = state.maxTokens;
    }
}

// Save Chat History
function saveChatHistory() {
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify({
        messages: state.messages,
        timestamp: Date.now()
    }));
    
    // Update current conversation
    if (state.currentConversationId) {
        const conv = state.conversations.find(c => c.id === state.currentConversationId);
        if (conv) {
            conv.messages = state.messages;
            saveConversations();
        }
    }
}

// Load Chat History
function loadChatHistory() {
    // This is handled by loadConversation now
    // Keeping for backwards compatibility
    const saved = localStorage.getItem('chatHistory');
    if (saved && state.conversations.length === 0) {
        try {
            const data = JSON.parse(saved);
            state.messages = data.messages || [];
            
            // Restore messages to UI (skip welcome message)
            if (state.messages.length > 0) {
                hideWelcomeScreen();
                state.messages.forEach(msg => {
                    if (msg.role === 'user' || msg.role === 'assistant') {
                        addMessageToUI(msg.role, msg.content);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
}

// Clear Chat History
function clearChatHistory() {
    if (confirm('Are you sure you want to clear all chat history?')) {
        state.messages = [];
        elements.messagesContainer.innerHTML = '';
        localStorage.removeItem('chatHistory');
        if (elements.welcomeMessage) {
            elements.welcomeMessage.style.display = 'block';
        }
        elements.settingsModal.classList.remove('active');
        showNotification('Chat history cleared!');
    }
}

// Update Debug Panel
function updateDebugPanel(type, data) {
    if (!elements.debugPanel) return;
    
    try {
        const formattedData = JSON.stringify(data, null, 2);
        
        switch(type) {
            case 'request':
                if (elements.debugRequest) {
                    elements.debugRequest.textContent = formattedData;
                }
                break;
            case 'response':
                if (elements.debugResponse) {
                    elements.debugResponse.textContent = formattedData;
                }
                break;
            case 'error':
                if (elements.debugError) {
                    elements.debugError.textContent = formattedData;
                }
                // Auto-show debug panel on error
                if (elements.debugPanel) {
                    elements.debugPanel.classList.add('active');
                }
                break;
        }
    } catch (error) {
        console.error('Error updating debug panel:', error);
    }
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        animation: slideUp 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

