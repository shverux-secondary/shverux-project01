
document.addEventListener('DOMContentLoaded', function() {
    // API base URL - change this to your FastAPI server URL
    const API_BASE_URL = 'http://localhost:8000';

    // Debug helpers
    console.log("Script loaded");

    // Elements selection with error checking
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    const signInForm = document.querySelector(".sign-in-form");
    const signUpForm = document.querySelector(".sign-up-form");

    // Debug log for elements
    console.log("Sign in button:", sign_in_btn);
    console.log("Sign up button:", sign_up_btn);
    console.log("Container:", container);
    console.log("Sign in form:", signInForm);
    console.log("Sign up form:", signUpForm);

    // Panel toggle functionality
    if(sign_in_btn && sign_up_btn && container) {
        console.log("Setting up panel toggle buttons");

        sign_up_btn.addEventListener("click", () => {
            console.log("Sign up button clicked");
            container.classList.add("sign-up-mode");
        });

        sign_in_btn.addEventListener("click", () => {
            console.log("Sign in button clicked");
            container.classList.remove("sign-up-mode");
        });
    } else {
        console.error("One or more panel toggle elements are missing in the DOM.");
    }

    // Form validation - Sign In
    if(signInForm) {
        console.log("Setting up sign in form validation");

        signInForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("Sign in form submitted");

            // Check if input elements exist
            const usernameInput = this.querySelector('input[type="text"]');
            const passwordInput = this.querySelector('input[type="password"]');

            if (!usernameInput || !passwordInput) {
                console.error("Could not find username or password input in sign in form");
                return;
            }

            const username = usernameInput.value;
            const password = passwordInput.value;

            console.log("Username:", username);
            console.log("Password length:", password.length);

            if(validateSignIn(username, password)) {
                // Show loading message
                showMessage(signInForm, 'Signing in...', 'info');

                try {
                    // Make API call to FastAPI backend
                    const response = await fetch(`${API_BASE_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        console.log('Login successful!', data);
                        showMessage(signInForm, `Welcome back, ${data.user.username}!`, 'success');

                        // Store user info (in a real app, you'd use proper session management)
                        localStorage.setItem('user', JSON.stringify(data.user));

                        // Clear form
                        usernameInput.value = '';
                        passwordInput.value = '';

                    } else {
                        console.error('Login failed:', data);
                        showMessage(signInForm, data.message || 'Login failed', 'error');
                    }

                } catch (error) {
                    console.error('Network error:', error);
                    showMessage(signInForm, 'Network error. Please check if the server is running.', 'error');
                }
            }
        });
    } else {
        console.error("Sign in form not found");
    }

    // Form validation - Sign Up
    if(signUpForm) {
        console.log("Setting up sign up form validation");

        signUpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log("Sign up form submitted");

            // Check if input elements exist
            const usernameInput = this.querySelector('input[type="text"]');
            const emailInput = this.querySelector('input[type="email"]');
            const passwordInput = this.querySelector('input[type="password"]');

            if (!usernameInput || !emailInput || !passwordInput) {
                console.error("Could not find required inputs in sign up form");
                return;
            }

            const username = usernameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;

            console.log("Username:", username);
            console.log("Email:", email);
            console.log("Password length:", password.length);

            if(validateSignUp(username, email, password)) {
                // Show loading message
                showMessage(signUpForm, 'Creating account...', 'info');

                try {
                    // Make API call to FastAPI backend
                    const response = await fetch(`${API_BASE_URL}/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: username,
                            email: email,
                            password: password
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        console.log('Registration successful!', data);
                        showMessage(signUpForm, `Welcome ${data.username}! Account created successfully.`, 'success');

                        // Clear form
                        usernameInput.value = '';
                        emailInput.value = '';
                        passwordInput.value = '';

                        // Switch to sign in form after successful registration
                        setTimeout(() => {
                            container.classList.remove("sign-up-mode");
                        }, 2000);

                    } else {
                        console.error('Registration failed:', data);
                        showMessage(signUpForm, data.message || 'Registration failed', 'error');
                    }

                } catch (error) {
                    console.error('Network error:', error);
                    showMessage(signUpForm, 'Network error. Please check if the server is running.', 'error');
                }
            }
        });
    } else {
        console.error("Sign up form not found");
    }

    // Validation functions
    function validateSignIn(username, password) {
        if(username.trim() === '') {
            showMessage(signInForm, 'Username cannot be empty', 'error');
            return false;
        }

        if(password.length < 6) {
            showMessage(signInForm, 'Password must be at least 6 characters', 'error');
            return false;
        }

        return true;
    }

    function validateSignUp(username, email, password) {
        if(username.trim() === '') {
            showMessage(signUpForm, 'Username cannot be empty', 'error');
            return false;
        }

        if(username.length < 3) {
            showMessage(signUpForm, 'Username must be at least 3 characters long', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            showMessage(signUpForm, 'Please enter a valid email address', 'error');
            return false;
        }

        if(password.length < 6) {
            showMessage(signUpForm, 'Password must be at least 6 characters', 'error');
            return false;
        }

        return true;
    }

    // Helper function to show messages with error handling
    function showMessage(form, message, type) {
        if (!form) {
            console.error("Cannot show message: form element is null");
            return;
        }

        try {
            // Remove any existing message
            const existingMessage = form.querySelector('.message');
            if(existingMessage) {
                existingMessage.remove();
            }

            // Create new message element
            const messageElement = document.createElement('p');
            messageElement.className = `message ${type}`;
            messageElement.textContent = message;
            messageElement.style.marginTop = '10px';
            messageElement.style.padding = '8px';
            messageElement.style.borderRadius = '4px';

            if(type === 'error') {
                messageElement.style.backgroundColor = '#ffebee';
                messageElement.style.color = '#c62828';
            } else if(type === 'success') {
                messageElement.style.backgroundColor = '#e8f5e9';
                messageElement.style.color = '#2e7d32';
            } else if(type === 'info') {
                messageElement.style.backgroundColor = '#e3f2fd';
                messageElement.style.color = '#1976d2';
            }

            // Add message after the submit button
            const submitButton = form.querySelector('input[type="submit"]');
            if (submitButton) {
                submitButton.insertAdjacentElement('afterend', messageElement);
            } else {
                // Fallback if submit button not found
                form.appendChild(messageElement);
                console.warn("Submit button not found, appending message to form");
            }

            // Remove message after 5 seconds for success/info, 8 seconds for errors
            const timeout = type === 'error' ? 8000 : 5000;
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, timeout);
        } catch (error) {
            console.error("Error showing message:", error);
        }
    }

    // Add focus effects for better UX
    const inputFields = document.querySelectorAll('.input-field input');

    console.log("Found", inputFields.length, "input fields for focus effects");

    inputFields.forEach(input => {
        input.addEventListener('focus', () => {
            const icon = input.parentElement.querySelector('i');
            if (icon) {
                icon.style.color = '#00cc88';
            }
        });

        input.addEventListener('blur', () => {
            const icon = input.parentElement.querySelector('i');
            if (icon) {
                icon.style.color = '#acacac';
            }
        });
    });

    // Function to check if user is logged in
    function isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    // Function to get current user
    function getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Function to logout user
    function logout() {
        localStorage.removeItem('user');
        console.log('User logged out');
    }

    // Test server connection on page load
    async function testServerConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/`);
            const data = await response.json();
            console.log('Server connection successful:', data);
        } catch (error) {
            console.warn('Could not connect to server:', error.message);
            console.warn('Make sure your FastAPI server is running on', API_BASE_URL);
        }
    }

    // Test server connection
    testServerConnection();
});
