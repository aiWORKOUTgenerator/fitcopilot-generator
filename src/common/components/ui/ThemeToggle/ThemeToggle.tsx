import React, { useState, useEffect } from 'react';
import './ThemeToggle.scss';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): 'light' | 'dark' => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme());

  // Apply theme to document when it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      className={`theme-toggle ${className} ${theme === 'dark' ? 'theme-toggle--dark' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <svg className="theme-toggle__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3a1 1 0 0 0 1-1V1a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1Z" />
          <path d="M12 21a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1Z" />
          <path d="M23 11h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z" />
          <path d="M1 11a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2H1Z" />
          <path d="M6.22 4.81a1 1 0 0 0 1.41 0 1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 1.41l.71.71Z" />
          <path d="M17.78 19.19a1 1 0 0 0-1.41 0 1 1 0 0 0 0 1.41l.71.71a1 1 0 0 0 1.41-1.41l-.71-.71Z" />
          <path d="M19.19 6.22a1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 1.41l.71.71a1 1 0 0 0 1.41 0Z" />
          <path d="M4.81 17.78a1 1 0 0 0 0 1.41l.71.71a1 1 0 0 0 1.41-1.41l-.71-.71a1 1 0 0 0-1.41 0Z" />
          <path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
        </svg>
      ) : (
        <svg className="theme-toggle__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.1 22c-5.5 0-10-4.5-10-10 0-4.8 3.4-8.9 8.1-9.8.8-.1 1.5.5 1.5 1.3 0 .5-.3 1-.7 1.1-3 1.1-4.9 4-4.9 7.4 0 4.1 3.4 7.5 7.5 7.5 3.4 0 6.3-2.2 7.4-5.2.1-.5.5-.8 1-.8.8 0 1.4.7 1.3 1.5-1.1 4.3-5 7-11.2 7z" />
        </svg>
      )}
      <span className="theme-toggle__text">
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
