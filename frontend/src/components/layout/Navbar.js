// frontend/src/components/layout/Navbar.js
import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Popover, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fetchNotifications, sendNotificationEmail, acknowledgeNotification } from '../../services/api';
import toast from 'react-hot-toast';
import { 
    FiLogOut, 
    FiUser, 
    FiSun, 
    FiMoon, 
    FiSettings, 
    FiBell, 
    FiSend, 
    FiCheckCircle,
    FiShield // New icon for Admin Panel
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  // ... (useEffect and other handler functions remain the same)
  useEffect(() => {
    if(user) {
      const getNotifications = async () => {
          try {
              const res = await fetchNotifications();
              setNotifications(res.data);
          } catch (err) {
              console.error("Could not fetch notifications", err);
          }
      };
      getNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

  const handleSend = async (id) => {
    const toastId = toast.loading('Sending reminder...');
    try {
        await sendNotificationEmail(id);
        toast.success('Reminder sent!', { id: toastId });
        setNotifications(prev => prev.map(n => n._id === id ? {...n, status: 'sent', sentAt: new Date()} : n));
    } catch (error) {
        toast.error('Failed to send reminder.', { id: toastId });
    }
  };

  const handleAcknowledge = async (id) => {
    try {
        await acknowledgeNotification(id);
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success('Notification acknowledged.');
    } catch (error) {
        toast.error('Failed to acknowledge.');
    }
  };


  return (
    <header className="sticky top-0 z-50 glass-card">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary tracking-wider">
          VisuTech
        </Link>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* --- NEW: Conditional Admin Panel Button --- */}
          {user && user.role === 'admin' && (
            <Link 
              to="/admin" 
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary/20 text-secondary hover:bg-secondary/30 rounded-lg transition-colors font-semibold"
            >
              <FiShield size={16} />
              Admin Panel
            </Link>
          )}
          {/* ------------------------------------------- */}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-colors">
            {theme === 'light' ? <FiMoon className="text-secondary" /> : <FiSun className="text-secondary" />}
          </button>

          {/* Notifications Popover */}
          <Popover className="relative">
            {/* ... (Popover code remains exactly the same) ... */}
            <Popover.Button className="relative p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border transition-colors focus:outline-none">
                <FiBell className="text-light-text-secondary dark:text-dark-text-secondary" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                            {notifications.length}
                        </span>
                    </span>
                )}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 max-h-[70vh] overflow-y-auto origin-top-right rounded-xl bg-light-card dark:bg-dark-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                    <div className="p-2 font-bold border-b border-light-border dark:border-dark-border">Notifications</div>
                    <div className="flow-root">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif._id} className="p-2 my-1 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg">
                                    <p className="text-sm">{notif.message}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                        <span>Status: <span className={`font-semibold ${notif.status === 'sent' ? 'text-primary' : 'text-secondary'}`}>{capitalize(notif.status)}</span></span>
                                        <div className='flex items-center gap-2'>
                                            <button onClick={() => handleSend(notif._id)} title="Send/Re-send" className="p-1 hover:text-primary"><FiSend /></button>
                                            <button onClick={() => handleAcknowledge(notif._id)} title="Acknowledge/Dismiss" className="p-1 hover:text-green-500"><FiCheckCircle/></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">No new notifications.</p>
                        )}
                    </div>
                </Popover.Panel>
            </Transition>
          </Popover>

          {/* User Dropdown Menu */}
          <Menu as="div" className="relative">
            {/* ... (Menu code remains exactly the same) ... */}
            <div>
              <Menu.Button className="flex items-center space-x-2 p-1.5 pr-3 rounded-lg bg-light-card/80 dark:bg-dark-card/80 hover:bg-light-border dark:hover:bg-dark-border transition-colors">
                <span className="w-8 h-8 flex items-center justify-center bg-light-border dark:bg-dark-border rounded-md overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  )}
                </span>
                <span className="font-semibold text-sm">{user.name}</span>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-light-border dark:divide-dark-border rounded-xl bg-light-card dark:bg-dark-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3">
                  <p className="text-sm">Signed in as</p>
                  <p className="truncate text-md font-bold">{user.name}</p>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{capitalize(user.role)} Role</p>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link to="/profile" className={`${active ? 'bg-light-bg dark:bg-dark-bg' : ''} group flex w-full items-center rounded-md px-4 py-2 text-sm`}>
                        <FiUser className="mr-2 h-5 w-5" aria-hidden="true" /> My Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link to="/settings" className={`${active ? 'bg-light-bg dark:bg-dark-bg' : ''} group flex w-full items-center rounded-md px-4 py-2 text-sm`}>
                        <FiSettings className="mr-2 h-5 w-5" aria-hidden="true" /> App Settings
                      </Link>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${active ? 'bg-light-bg dark:bg-dark-bg' : ''} group flex w-full items-center rounded-md px-4 py-2 text-sm text-red-500`}
                      >
                        <FiLogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;