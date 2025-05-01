import React, { useState } from 'react';
import Card from './Card';
import '../../../styles/theme/index.scss';

/**
 * Card Component Theme Test
 * 
 * This component renders Card variations in both light and dark themes
 * for visual testing and verification.
 */
const CardThemeTest: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
        minHeight: '100vh',
        color: theme === 'dark' ? '#ffffff' : '#333333'
      }}>
        <h1>Card Component Theme Test</h1>
        
        <div style={{ marginBottom: '1rem' }}>
          <button 
            onClick={toggleTheme}
            style={{
              padding: '0.5rem 1rem',
              marginBottom: '2rem',
              backgroundColor: theme === 'dark' ? '#333' : '#ddd',
              color: theme === 'dark' ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {/* Basic Card */}
          <Card>
            <h3>Basic Card</h3>
            <p>This is a basic card with default styling.</p>
          </Card>
          
          {/* Bordered Card */}
          <Card bordered>
            <h3>Bordered Card</h3>
            <p>This card has a visible border.</p>
          </Card>
          
          {/* Elevated Card */}
          <Card elevated>
            <h3>Elevated Card</h3>
            <p>This card has elevation (shadow).</p>
          </Card>
          
          {/* Hoverable Card */}
          <Card hoverable>
            <h3>Hoverable Card</h3>
            <p>Hover over this card to see the effect.</p>
          </Card>
          
          {/* Elevated & Hoverable Card */}
          <Card elevated hoverable>
            <h3>Elevated & Hoverable</h3>
            <p>This card has both elevation and hover effects.</p>
          </Card>
          
          {/* Small Padding Card */}
          <Card padding="small">
            <h3>Small Padding</h3>
            <p>This card has small padding.</p>
          </Card>
          
          {/* Large Padding Card */}
          <Card padding="large">
            <h3>Large Padding</h3>
            <p>This card has large padding.</p>
          </Card>
          
          {/* Clickable Card */}
          <Card 
            hoverable 
            onClick={() => alert('Card clicked!')}
          >
            <h3>Clickable Card</h3>
            <p>Click this card to trigger an action.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CardThemeTest; 