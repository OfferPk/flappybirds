import React, { useState } from 'react';
import './LoginScreen.css'; // To be created

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://5000-ii8sb21ssjs1l8ex1b5sw-f15d55f7.manusvm.computer'; // Ensure your backend runs on port 5000 or configure as needed

const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState(''); // For registration
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegistering ? `${API_BASE_URL}/api/v1/auth/register` : `${API_BASE_URL}/api/v1/auth/login`;
    const payload = isRegistering ? { username, email, password } : { identifier: email, password }; // Assuming login uses email as identifier

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        if (isRegistering) {
          console.log('Registration successful:', data);
          // Optionally switch to login form or show success message
          setIsRegistering(false);
          setError('Registration successful! Please login.');
        } else {
          console.log('Login successful:', data);
          // Store token and user info (e.g., in localStorage or context)
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('refreshToken', data.refresh_token);
          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('username', data.username);
          if (onLoginSuccess) {
            onLoginSuccess({ userId: data.user_id, username: data.username });
          }
        }
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to connect to the server. Please check your connection.');
      console.error('API call failed:', err);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-form-container">
        <h2>{isRegistering ? 'Create Account' : 'Welcome Back!'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="toggle-form-btn" disabled={loading}>
          {isRegistering ? 'Already have an account? Login' : 'New user? Create Account'}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;

