// frontend/src/pages/DeveloperLogin.js
import React, { useState } from 'react';
import { useDeveloperAuth } from '../context/DeveloperAuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DeveloperLogin = () => {
    const [password, setPassword] = useState('');
    const { authenticateDev } = useDeveloperAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = authenticateDev(password);
        if (success) {
            toast.success('Developer access granted.');
            navigate('/developer-panel');
        } else {
            toast.error('Incorrect developer password.');
        }
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-sm p-8 space-y-6 rounded-2xl glass-card">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-secondary">Developer Access</h1>
                    <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Please enter the developer password to continue.
                    </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="Developer Password"
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="w-full flex justify-center items-center space-x-2 bg-secondary hover:bg-secondary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                        <FiLogIn />
                        <span>Unlock Panel</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DeveloperLogin;