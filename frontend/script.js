const apiBaseUrl = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login');
  const registerForm = document.getElementById('register');
  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');
  const loginFormDiv = document.getElementById('login-form');
  const registerFormDiv = document.getElementById('register-form');

  showRegisterBtn.addEventListener('click', () => {
    loginFormDiv.style.display = 'none';
    registerFormDiv.style.display = 'block';
  });

  showLoginBtn.addEventListener('click', () => {
    registerFormDiv.style.display = 'none';
    loginFormDiv.style.display = 'block';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.accessToken);
        alert('Login successful! You can now access the dashboard.');
        // Redirect to dashboard or load dashboard UI here
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Error logging in');
      console.error(error);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful! Please login.');
        registerFormDiv.style.display = 'none';
        loginFormDiv.style.display = 'block';
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Error registering');
      console.error(error);
    }
  });
});
