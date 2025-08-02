// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogIn, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // The login function now returns the user data upon success
      const loggedInUser = await login(email, password); 

      // --- THIS IS THE NEW REDIRECT LOGIC ---
      if (loggedInUser.email === process.env.REACT_APP_DEV_EMAIL) {
        // If the logged-in user is the developer, go straight to the dev panel
        navigate('/developer-panel');
      } else {
        // Otherwise, go to the regular inspector/admin dashboard
        navigate('/');
      }
      // ------------------------------------

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-light-bg dark:bg-dark-bg">
        <div className="w-full max-w-md p-8 space-y-8 rounded-2xl glass-card">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary">VisuTech</h1>
                <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">Car Inspection Management</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Email Address" />
                </div>
                <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Password"/>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                        <FiLogIn/>
                        <span>{loading ? 'Logging in...' : 'Secure Login'}</span>
                    </button>
                </div>
            </form>
            {/*<p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary hover:underline">
                    Register here
                </Link>
            </p>*/}
        </div>
    </div>
  );
};

export default Login;