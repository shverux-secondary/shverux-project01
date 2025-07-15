/**
 * AI Customer Support Chatbot Application
 * Modern JavaScript implementation with ES6+ features, accessibility, and performance optimizations
 */

// Application Configuration
const CONFIG = {
  TYPING_DELAY: 1000,
  MESSAGE_ANIMATION_DELAY: 300,
  CHAR_LIMIT: 500,
  STORAGE_KEY: 'ai_chatbot_theme',
  API_ENDPOINTS: {
    // Placeholder for future API integration
    chat: '/api/chat',
    feedback: '/api/feedback'
  }
};

// Utility Functions
const Utils = {
  /**
   * Debounce function to limit function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Sanitize HTML to prevent XSS attacks
   */
  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  /**
   * Format timestamp for messages
   */
  formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  /**
   * Generate unique ID for messages
   */
  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Check if string is empty or only whitespace
   */
  isEmpty(str) {
    return !str || str.trim().length === 0;
  }
};

// Theme Management System
const themeManager = {
  currentTheme: 'dark',
  container: null,
  themeIcon: null,

  init() {
    this.container = document.getElementById('themeContainer');
    this.themeIcon = document.getElementById('themeIcon');
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEY) || 'dark';
    this.setTheme(savedTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(CONFIG.STORAGE_KEY)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  },

  setTheme(theme) {
    if (!this.container) return;
    
    this.currentTheme = theme;
    this.container.className = `container ${theme}-theme`;
    
    // Update icon
    this.updateIcon(theme);
    
    // Save preference
    localStorage.setItem(CONFIG.STORAGE_KEY, theme);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }));
  },

  updateIcon(theme) {
    if (!this.themeIcon) return;
    
    const icons = {
      dark: `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`,
      light: `<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>`
    };
    
    this.themeIcon.innerHTML = icons[theme];
  },

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
};

// Chat System
class ChatSystem {
  constructor() {
    this.chatWindow = null;
    this.chatForm = null;
    this.userInput = null;
    this.charCount = null;
    this.quickActions = null;
    this.clearChatBtn = null;
    this.messages = [];
    this.isTyping = false;
    
    this.botResponses = [
      "Thank you for your message! I'm here to help you with any questions.",
      "I understand your concern. Let me assist you with that right away.",
      "That's a great question! Here's what I can tell you about that.",
      "I'd be happy to help you resolve this issue. Let me check that for you.",
      "Thanks for reaching out! I'm processing your request now.",
      "I see what you're asking about. Here's the information you need.",
      "Let me help you with that. I'll provide you with the best solution.",
      "I appreciate your patience. Here's what I found for you."
    ];
  }

  init() {
    this.chatWindow = document.getElementById('chatWindow');
    this.chatForm = document.getElementById('chatForm');
    this.userInput = document.getElementById('userInput');
    this.charCount = document.getElementById('char-count');
    this.quickActions = document.getElementById('quickActions');
    this.clearChatBtn = document.getElementById('clearChat');

    if (this.chatForm && this.chatWindow) {
      this.setupEventListeners();
      this.setupQuickActions();
      this.setupCharacterCounter();
    }
  }

  setupEventListeners() {
    // Form submission
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserMessage();
    });

    // Input events
    this.userInput.addEventListener('input', () => {
      this.updateCharCount();
      this.adjustInputHeight();
    });

    this.userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserMessage();
      }
    });

    // Clear chat functionality
    if (this.clearChatBtn) {
      this.clearChatBtn.addEventListener('click', () => {
        this.clearChat();
      });
    }
  }

  setupQuickActions() {
    if (!this.quickActions) return;

    const actionButtons = this.quickActions.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const message = btn.dataset.message;
        if (message) {
          this.userInput.value = message;
          this.handleUserMessage();
        }
      });
    });
  }

  setupCharacterCounter() {
    if (this.charCount) {
      this.updateCharCount();
    }
  }

  updateCharCount() {
    if (!this.charCount || !this.userInput) return;
    
    const currentLength = this.userInput.value.length;
    this.charCount.textContent = `${currentLength}/${CONFIG.CHAR_LIMIT}`;
    
    // Visual feedback for character limit
    if (currentLength > CONFIG.CHAR_LIMIT * 0.9) {
      this.charCount.style.color = 'var(--warning-500)';
    } else if (currentLength >= CONFIG.CHAR_LIMIT) {
      this.charCount.style.color = 'var(--error-500)';
    } else {
      this.charCount.style.color = 'var(--text-tertiary)';
    }
  }

  adjustInputHeight() {
    if (!this.userInput) return;
    
    this.userInput.style.height = 'auto';
    this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
  }

  async handleUserMessage() {
    const message = this.userInput.value.trim();
    
    if (Utils.isEmpty(message) || message.length > CONFIG.CHAR_LIMIT || this.isTyping) {
      return;
    }

    // Add user message
    this.addMessage(message, 'user');
    
    // Clear input
    this.userInput.value = '';
    this.updateCharCount();
    this.adjustInputHeight();
    
    // Hide quick actions after first message
    if (this.quickActions && this.messages.length === 1) {
      this.quickActions.style.display = 'none';
    }

    // Show typing indicator and generate response
    this.showTypingIndicator();
    
    try {
      await this.generateBotResponse(message);
    } catch (error) {
      console.error('Error generating bot response:', error);
      this.addMessage('I apologize, but I encountered an error. Please try again.', 'bot');
    } finally {
      this.hideTypingIndicator();
    }
  }

  addMessage(content, sender, timestamp = new Date()) {
    if (!this.chatWindow) return;

    const messageId = Utils.generateId();
    const sanitizedContent = Utils.sanitizeHTML(content);
    
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    messageElement.setAttribute('role', 'article');
    messageElement.setAttribute('data-message-id', messageId);
    
    const avatarClass = sender === 'user' ? 'user-avatar' : 'bot-avatar';
    const bubbleClass = sender === 'user' ? 'user-bubble' : 'bot-bubble';
    const avatarText = sender === 'user' ? 'U' : 'AI';
    
    messageElement.innerHTML = `
      <div class="avatar ${avatarClass}" aria-hidden="true">
        <span>${avatarText}</span>
      </div>
      <div class="message-content">
        <div class="message-bubble ${bubbleClass}">
          ${sanitizedContent}
        </div>
        <time class="message-time" datetime="${timestamp.toISOString()}">
          ${Utils.formatTime(timestamp)}
        </time>
      </div>
    `;

    this.chatWindow.appendChild(messageElement);
    this.scrollToBottom();
    
    // Store message
    this.messages.push({
      id: messageId,
      content,
      sender,
      timestamp
    });

    // Announce to screen readers
    this.announceMessage(content, sender);
  }

  showTypingIndicator() {
    if (this.isTyping) return;
    
    this.isTyping = true;
    const typingElement = document.createElement('div');
    typingElement.className = 'chat-message bot typing-indicator';
    typingElement.setAttribute('data-typing', 'true');
    
    typingElement.innerHTML = `
      <div class="avatar bot-avatar" aria-hidden="true">
        <span>AI</span>
      </div>
      <div class="message-content">
        <div class="message-bubble bot-bubble">
          <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    
    this.chatWindow.appendChild(typingElement);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator = this.chatWindow.querySelector('[data-typing="true"]');
    if (typingIndicator) {
      typingIndicator.remove();
    }
    this.isTyping = false;
  }

  async generateBotResponse(userMessage) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, CONFIG.TYPING_DELAY));
    
    // Simple response generation (replace with actual API call)
    const response = this.getBotResponse(userMessage);
    this.addMessage(response, 'bot');
  }

  getBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based responses
    if (message.includes('order') || message.includes('track')) {
      return "I can help you track your order! Please provide your order number, and I'll check the status for you right away.";
    }
    
    if (message.includes('return') || message.includes('refund')) {
      return "I understand you'd like to process a return. You can initiate returns within 30 days of purchase through your account dashboard, or I can help guide you through the process.";
    }
    
    if (message.includes('product') || message.includes('item')) {
      return "I'd be happy to help you with product information! Could you please specify which product you're interested in learning more about?";
    }
    
    if (message.includes('technical') || message.includes('support') || message.includes('problem')) {
      return "I'm here to help with technical issues! Please describe the problem you're experiencing, and I'll provide step-by-step assistance.";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! Welcome to our AI customer support. I'm here to assist you with any questions or concerns you might have. How can I help you today?";
    }
    
    // Default responses
    return this.botResponses[Math.floor(Math.random() * this.botResponses.length)];
  }

  scrollToBottom() {
    if (this.chatWindow) {
      this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }
  }

  announceMessage(content, sender) {
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `${sender === 'user' ? 'You said' : 'AI responded'}: ${content}`;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  clearChat() {
    if (!confirm('Are you sure you want to clear the chat history?')) {
      return;
    }
    
    // Remove all messages except welcome message
    const messages = this.chatWindow.querySelectorAll('.chat-message:not(.welcome-message)');
    messages.forEach(msg => msg.remove());
    
    // Reset state
    this.messages = [];
    this.isTyping = false;
    
    // Show quick actions again
    if (this.quickActions) {
      this.quickActions.style.display = 'block';
    }
    
    // Add confirmation message
    setTimeout(() => {
      this.addMessage('Chat history cleared. How can I help you today?', 'bot');
    }, 300);
  }
}

// FAQ System
class FAQSystem {
  constructor() {
    this.faqItems = [];
  }

  init() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach((question, index) => {
      const faqItem = question.parentElement;
      const answer = faqItem.querySelector('.faq-answer');
      
      if (answer) {
        // Set up ARIA attributes
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;
        
        question.setAttribute('id', questionId);
        question.setAttribute('aria-controls', answerId);
        answer.setAttribute('id', answerId);
        answer.setAttribute('aria-labelledby', questionId);
        
        // Add click handler
        question.addEventListener('click', () => {
          this.toggleFAQ(faqItem, question, answer);
        });
        
        // Add keyboard support
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleFAQ(faqItem, question, answer);
          }
        });
        
        this.faqItems.push({ item: faqItem, question, answer });
      }
    });
  }

  toggleFAQ(faqItem, question, answer) {
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQs
    this.faqItems.forEach(({ item, question: q }) => {
      if (item !== faqItem) {
        item.classList.remove('active');
        q.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Toggle current FAQ
    if (isActive) {
      faqItem.classList.remove('active');
      question.setAttribute('aria-expanded', 'false');
    } else {
      faqItem.classList.add('active');
      question.setAttribute('aria-expanded', 'true');
    }
  }
}

// Form Validation System
class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.fields = {};
    this.errors = {};
  }

  init() {
    if (!this.form) return;
    
    // Get all form fields
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      this.fields[input.name] = input;
      
      // Add real-time validation
      input.addEventListener('blur', () => {
        this.validateField(input.name);
      });
      
      input.addEventListener('input', Utils.debounce(() => {
        if (this.errors[input.name]) {
          this.validateField(input.name);
        }
      }, 300));
    });
    
    // Handle form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return true;
    
    const value = field.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && Utils.isEmpty(value)) {
      isValid = false;
      errorMessage = `${this.getFieldLabel(field)} is required.`;
    }
    
    // Email validation
    if (isValid && field.type === 'email' && !Utils.isEmpty(value)) {
      if (!Utils.isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }
    
    // Update UI
    if (isValid) {
      delete this.errors[fieldName];
      field.classList.remove('error');
      if (errorElement) errorElement.textContent = '';
    } else {
      this.errors[fieldName] = errorMessage;
      field.classList.add('error');
      if (errorElement) errorElement.textContent = errorMessage;
    }
    
    return isValid;
  }

  validateAll() {
    let isValid = true;
    
    Object.keys(this.fields).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  getFieldLabel(field) {
    const label = this.form.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name;
  }

  async handleSubmit() {
    if (!this.validateAll()) {
      // Focus first error field
      const firstErrorField = Object.keys(this.errors)[0];
      if (firstErrorField && this.fields[firstErrorField]) {
        this.fields[firstErrorField].focus();
      }
      return;
    }
    
    // Show loading state
    const submitBtn = this.form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      this.showSuccessMessage();
      this.form.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage('Failed to send message. Please try again.');
    } finally {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = 'Thank you for your message! We\'ll get back to you soon.';
    message.setAttribute('role', 'alert');
    
    this.form.insertBefore(message, this.form.firstChild);
    
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }

  showErrorMessage(text) {
    const message = document.createElement('div');
    message.className = 'error-message';
    message.textContent = text;
    message.setAttribute('role', 'alert');
    
    this.form.insertBefore(message, this.form.firstChild);
    
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }
}

// Performance Monitor
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  init() {
    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.recordPageLoadMetrics();
        }, 0);
      });
    }
    
    // Monitor user interactions
    this.setupInteractionTracking();
  }

  recordPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.pageLoad = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
      
      console.log('Page Load Metrics:', this.metrics.pageLoad);
    }
  }

  setupInteractionTracking() {
    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, .btn')) {
        this.recordInteraction('click', e.target.textContent.trim());
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.recordInteraction('form_submit', e.target.id || 'unknown_form');
    });
  }

  recordInteraction(type, target) {
    const timestamp = performance.now();
    
    if (!this.metrics.interactions) {
      this.metrics.interactions = [];
    }
    
    this.metrics.interactions.push({
      type,
      target,
      timestamp
    });
    
    // Keep only last 50 interactions
    if (this.metrics.interactions.length > 50) {
      this.metrics.interactions = this.metrics.interactions.slice(-50);
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

// Application Initialization
class App {
  constructor() {
    this.chatSystem = new ChatSystem();
    this.faqSystem = new FAQSystem();
    this.performanceMonitor = new PerformanceMonitor();
    this.formValidator = null;
  }

  init() {
    // Initialize core systems
    themeManager.init();
    this.chatSystem.init();
    this.faqSystem.init();
    this.performanceMonitor.init();
    
    // Initialize contact form if present
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      this.formValidator = new FormValidator(contactForm);
      this.formValidator.init();
    }
    
    // Set up global error handling
    this.setupErrorHandling();
    
    // Initialize accessibility features
    this.setupAccessibility();
    
    console.log('AI Customer Support App initialized successfully');
  }

  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      // In production, send to error tracking service
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      // In production, send to error tracking service
    });
  }

  setupAccessibility() {
    // Skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only';
    skipLink.addEventListener('focus', () => {
      skipLink.classList.remove('sr-only');
    });
    skipLink.addEventListener('blur', () => {
      skipLink.classList.add('sr-only');
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Announce page changes to screen readers
    const mainContent = document.querySelector('main, [role="main"]');
    if (mainContent) {
      mainContent.setAttribute('id', 'main-content');
    }
  }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
} else {
  const app = new App();
  app.init();
}

// Export for global access (for inline event handlers)
window.themeManager = themeManager;
window.toggleTheme = function() {
  themeManager.toggle();
};

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment when service worker is implemented
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => console.log('SW registered'))
    //   .catch(error => console.log('SW registration failed'));
  });
}