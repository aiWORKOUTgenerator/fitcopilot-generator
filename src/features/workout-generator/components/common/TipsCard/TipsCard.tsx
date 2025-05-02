/**
 * Tips Card Component
 * 
 * This component displays helpful tips for creating better workouts.
 */
import React, { useState, CSSProperties } from 'react';
import './TipsCard.scss';

/**
 * List of helpful workout tips to show users
 */
const workoutTips = [
  'Be specific about your goals (strength, cardio, flexibility).',
  'Mention time constraints if you\'re short on time.',
  'Specify focus areas such as "upper body" or "core."',
  'Include intensity preferences like "challenging" or "moderate."',
  'List equipment you want to use or avoid.',
];

// Direct inline styles to match Edit Request button 
const headerStyle: CSSProperties = {
  backgroundColor: '#1a1f2e',
  color: '#bef264',
  border: '1px solid #2a3342',
  borderRadius: '0.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '0.75rem 1.25rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left' as const,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#bef264',
};

const iconStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  fontWeight: 'bold',
  height: '24px',
  width: '24px',
  color: '#bef264',
};

/**
 * TipsCard displays a collapsible card with workout tips
 */
export const TipsCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="tips-card-container">
      <div className="tips-card">
        <button 
          style={headerStyle}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <h3 style={titleStyle}>Tips for Great Workouts</h3>
          <span 
            style={iconStyle}
            aria-hidden="true"
          >
            {isOpen ? '−' : '+'}
          </span>
        </button>
        
        {isOpen && (
          <ul className="tips-list">
            {workoutTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TipsCard; 