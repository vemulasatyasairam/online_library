/**
 * AI Chatbot Widget for Online Library
 * Helps students with doubts and explanations
 */

(function() {
  'use strict';

  // Create chatbot HTML structure
  const chatbotHTML = `
    <div id="chatbot-container">
      <!-- Floating Chat Button -->
      <button id="chatbot-toggle" aria-label="Open chatbot" title="Ask me anything!">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <!-- Chat Window -->
      <div id="chatbot-window" style="display:none;">
        <div id="chatbot-header">
          <div>
            <h3>📚 Library Assistant</h3>
            <p>Ask me about any subject!</p>
          </div>
          <button id="chatbot-close" aria-label="Close chat">✕</button>
        </div>
        
        <div id="chatbot-messages"></div>
        
        <div id="chatbot-input-area">
          <input 
            type="text" 
            id="chatbot-input" 
            placeholder="Type your question here..."
            aria-label="Chat input"
          />
          <button id="chatbot-send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        
        <div id="chatbot-suggestions">
          <button class="suggestion-btn" data-question="Explain this topic in simple terms">Explain simply</button>
          <button class="suggestion-btn" data-question="Give me practice problems">Practice problems</button>
          <button class="suggestion-btn" data-question="What are the key concepts?">Key concepts</button>
        </div>
      </div>
    </div>
  `;

  // Inject chatbot HTML
  function injectChatbot() {
    const container = document.createElement('div');
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container.firstElementChild);
    initializeChatbot();
  }

  // Initialize chatbot functionality
  function initializeChatbot() {
    const toggle = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const chatWindow = document.getElementById('chatbot-window');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const messagesContainer = document.getElementById('chatbot-messages');
    const suggestions = document.querySelectorAll('.suggestion-btn');
    const HISTORY_KEY = 'library_chat_history';

    if (!toggle || !closeBtn || !chatWindow || !input || !sendBtn || !messagesContainer) {
      console.error('Chatbot elements not found');
      return;
    }

    function lockBodyScroll(lock) {
      if (lock) {
        document.body.dataset.chatScrollLock = 'true';
        document.body.style.overflow = 'hidden';
      } else {
        document.body.removeAttribute('data-chat-scroll-lock');
        document.body.style.overflow = '';
      }
    }

    // Allow natural scrolling inside the messages list

    // Restore previous chat history
    const existingHistory = loadHistory();
    if (existingHistory.length) {
      existingHistory.forEach(item => {
        renderMessage(item.type, item.text);
      });
      scrollToBottom();
    }

    // Toggle chat window
    toggle.addEventListener('click', () => {
      const isVisible = chatWindow.style.display === 'block';
      chatWindow.style.display = isVisible ? 'none' : 'block';
      toggle.style.display = isVisible ? 'flex' : 'none';
      if (!isVisible) {
        lockBodyScroll(true);
        input.focus();
        if (messagesContainer.children.length === 0) {
          addMessage('bot', 'Hello! I\'m your Library Assistant. Ask me anything about your studies! 📖');
        }
        scrollToBottom();
      } else {
        lockBodyScroll(false);
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      toggle.style.display = 'flex';
      lockBodyScroll(false);
    });

    // Send message
    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      addMessage('user', text);
      input.value = '';
      
      // Show typing indicator
      showTyping();
      
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        hideTyping();
        const response = generateResponse(text);
        addMessage('bot', response);
      }, 1000 + Math.random() * 1000);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Suggestion buttons
    suggestions.forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.getAttribute('data-question');
        sendMessage();
      });
    });

    // Add message to chat
    function renderMessage(type, text) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chatbot-message ${type}-message`;

      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = type === 'bot' ? '🤖' : '👤';

      const content = document.createElement('div');
      content.className = 'message-content';
      content.textContent = text;

      msgDiv.appendChild(avatar);
      msgDiv.appendChild(content);
      messagesContainer.appendChild(msgDiv);
    }

    function addMessage(type, text) {
      renderMessage(type, text);
      persistMessage(type, text);
      scrollToBottom();
    }

    function scrollToBottom() {
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }

    function loadHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (err) {
        return [];
      }
    }

    function persistMessage(type, text) {
      const history = loadHistory();
      history.push({ type, text, ts: Date.now() });
      const trimmed = history.slice(-100);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      } catch (err) {
        // ignore storage errors
      }
    }

    // Typing indicator
    function showTyping() {
      const typing = document.createElement('div');
      typing.id = 'typing-indicator';
      typing.className = 'chatbot-message bot-message';
      typing.innerHTML = '<div class="message-avatar">🤖</div><div class="message-content typing-dots"><span></span><span></span><span></span></div>';
      messagesContainer.appendChild(typing);
      scrollToBottom();
    }

    function hideTyping() {
      const typing = document.getElementById('typing-indicator');
      if (typing) typing.remove();
    }

    // Generate AI response (basic pattern matching - replace with actual AI API)
    function generateResponse(question) {
      const q = question.toLowerCase();
      
      // Subject-specific responses
      if (q.includes('physics') || q.includes('mechanics') || q.includes('force')) {
        return 'Physics is all about understanding how things move and interact! Let me help you break down this concept. Which specific topic are you studying? (e.g., Newton\'s Laws, Thermodynamics, Optics)';
      }
      
      if (q.includes('chemistry') || q.includes('chemical') || q.includes('reaction')) {
        return 'Chemistry can be tricky! Are you studying Organic Chemistry, Inorganic Chemistry, or Physical Chemistry? Let me know the specific topic and I\'ll explain it step by step.';
      }
      
      if (q.includes('math') || q.includes('calculus') || q.includes('algebra')) {
        return 'Math is logical and beautiful once you understand the patterns! Which topic are you working on? (Calculus, Algebra, Trigonometry, Statistics)';
      }
      
      if (q.includes('biology') || q.includes('cell') || q.includes('genetics')) {
        return 'Biology is fascinating! Are you studying Cell Biology, Genetics, Ecology, or Human Anatomy? I can help explain concepts and provide examples.';
      }
      
      if (q.includes('computer') || q.includes('programming') || q.includes('code')) {
        return 'Computer Science opens so many doors! What are you learning? (Programming basics, Data Structures, Algorithms, Databases)';
      }
      
      // Study help
      if (q.includes('how to study') || q.includes('tips') || q.includes('prepare')) {
        return 'Great question! Here are some study tips:\n1. Break topics into smaller chunks\n2. Practice regularly with problems\n3. Teach concepts to others\n4. Use diagrams and visual aids\n5. Take short breaks\n\nWhat subject are you preparing for?';
      }
      
      if (q.includes('explain') || q.includes('understand')) {
        return 'I\'d love to help you understand this better! Can you tell me:\n1. Which subject/topic?\n2. What part is confusing?\n3. What have you tried so far?\n\nThe more details you give, the better I can help! 😊';
      }
      
      if (q.includes('practice') || q.includes('problem') || q.includes('exercise')) {
        return 'Practice is key to mastery! Which subject do you want to practice? I can suggest:\n• Conceptual questions\n• Numerical problems\n• Previous exam patterns\n• Real-world applications';
      }
      
      // General help
      if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        return 'Hello! 👋 I\'m here to help with your studies. Ask me about any subject - Physics, Chemistry, Math, Biology, Computer Science, or study tips!';
      }
      
      if (q.includes('thank') || q.includes('thanks')) {
        return 'You\'re welcome! 😊 Keep up the great work. Let me know if you have more questions!';
      }
      
      // Default response
      return 'I\'m here to help you understand any topic better! Could you please:\n\n1. Specify the subject (Physics, Chemistry, Math, etc.)\n2. Tell me the specific topic you\'re studying\n3. Describe what you\'re confused about\n\nFor example: "Explain Newton\'s Second Law in simple terms" or "Help me with quadratic equations"';
    }
  }

  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbot);
  } else {
    injectChatbot();
  }
})();
