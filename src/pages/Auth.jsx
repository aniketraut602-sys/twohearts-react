import { useState } from 'react';
import { saveToken, saveUser } from '../lib/storage';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Use relative path for API to avoid CORS and environment issues
    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.token) {
        saveToken(data.token);
        // Fetch user data after login
        try {
          const userResponse = await fetch('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${data.token}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await userResponse.json();
          saveUser(userData);
          navigate('/browse');
        } catch (userErr) {
          setError('Login successful but failed to load user data. Please try again.');
          console.error('User fetch error:', userErr);
        }
      } else {
        // Registration successful, switch to login
        setIsLogin(true);
        setSuccess('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      console.error('Authentication error:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="alert alert-success">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="btn-link"
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;