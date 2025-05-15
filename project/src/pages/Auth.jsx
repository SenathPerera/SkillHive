import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '../store/authStore';
import { Share2 } from 'lucide-react';
import { SocialLogin } from '../components/SocialLogin';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, error: authError, clearError } = useAuthStore();
  const { user: auth0User, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  useEffect(() => {
    const handleSocialLogin = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();
          const response = await signIn(auth0User.email, token, true);
          if (response) navigate('/', { replace: true });
        } catch (error) {
          console.error('Social login error:', error);
          setError('Failed to complete social login');
        }
      }
    };
    handleSocialLogin();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, signIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      if (isSignUp) {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('First name and last name are required');
        }
        if (!birthday) {
          throw new Error('Birthday is required');
        }

        await signUp({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          address: address.trim(),
          birthday,
        });
      } else {
        await signIn(email.trim(), password);
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setAddress('');
    setBirthday('');
    clearError();
  };

  const handleSocialLoginSuccess = () => setError('');
  const handleSocialLoginError = (error) =>
    setError(error.message || 'Social login failed');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Share2 className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isSignUp ? 'Join SkillHive' : 'Welcome back to SkillHive'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                    Birthday
                  </label>
                  <input
                    id="birthday"
                    type="date"
                    required
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <SocialLogin onSuccess={handleSocialLoginSuccess} onError={handleSocialLoginError} />

          <div className="mt-6 text-center">
            <button
              onClick={handleToggleMode}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
