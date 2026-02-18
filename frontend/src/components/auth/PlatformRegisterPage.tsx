/**
 * Platform Register Page
 * Form that posts to auth-microservice (platform auth).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AUTH_URL = import.meta.env.VITE_PLATFORM_AUTH_URL || import.meta.env.VITE_AUTH_SERVICE_URL || 'https://auth.alfares.cz';

export function PlatformRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }
      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="w-full max-w-md p-6 rounded-2xl bg-base border border-borderLight shadow-lg">
        <h1 className="text-xl font-heading font-semibold text-dark mb-2">Platform Register</h1>
        <p className="text-sm text-soft mb-6">Create a platform account (auth-microservice)</p>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 rounded-button bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-dark mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-button border border-borderLight bg-base text-dark"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 rounded-button border border-borderLight bg-base text-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 rounded-button border border-borderLight bg-base text-dark"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-dark mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 rounded-button border border-borderLight bg-base text-dark"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-dark mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 rounded-button border border-borderLight bg-base text-dark"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-soft">
          Already have an account? <Link to="/platform-login" className="text-accent hover:underline">Login</Link>
        </p>
        <p className="mt-2 text-center text-sm text-soft">
          <Link to="/" className="text-accent hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
