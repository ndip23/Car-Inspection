// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiUserCheck, FiChevronLeft, FiEye, FiEyeOff } from 'react-icons/fi'; // Import eye icons

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password); // Pass only 3 arguments
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-light-bg dark:bg-dark-bg">
        <div className="w-full max-w-md p-8 space-y-6 rounded-2xl glass-card relative">
            <Link to="/login" className="absolute top-4 left-4 p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-colors">
                <FiChevronLeft className="text-light-text-secondary dark:text-dark-text-secondary"/>
            </Link>

            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">Create Account</h1>
                <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">Join the Harmony Inspection Platform</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Full Name" />
                </div>
                <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Email Address" />
                </div>
                {/* MODIFIED: Password input with visibility toggle */}
                <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-10 py-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Password" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </div>
                </div>
                {/* MODIFIED: Confirm Password input with visibility toggle */}
                <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-10 py-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Confirm Password" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-light-text-secondary dark:text-dark-text-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </div>
                </div>
                
                {/* REMOVED: The Role selector dropdown is gone */}

                {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full flex justify-center items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                        <FiUserCheck/>
                        <span>{loading ? 'Registering...' : 'Create Account'}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default Register;