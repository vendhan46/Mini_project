import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { isLoggedIn, setSession } from '../../utils/auth';
import './AuthPage.css';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email, password } : { name, email, password };

      const response = await api.post(endpoint, payload);
      setSession(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (submitError) {
      const message = submitError?.response?.data?.error || 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-page'>
      <form className='auth-card' onSubmit={handleSubmit}>
        <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>

        {mode === 'register' && (
          <input
            type='text'
            placeholder='Name'
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}

        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />

        {error && <p className='auth-error'>{error}</p>}

        <button type='submit' disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>

        <p className='auth-switch'>
          {mode === 'login' ? 'No account?' : 'Already have an account?'}{' '}
          <span onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Register here' : 'Login here'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
