/**
 * Tips Card Component
 * 
 * This component displays helpful tips for creating better workouts.
 */
import React, { useState } from 'react';
import Card from '../../../../components/ui/Card';

/**
 * List of helpful workout tips to show users
 */
const workoutTips = [
  'Be specific about your goals (strength, cardio, flexibility).',
  'Mention time constraints if you're short on time.',
  'Specify focus areas such as "upper body" or "core."',
  'Include intensity preferences like "challenging" or "moderate."',
  'List equipment you want to use or avoid.',
];

/**
 * TipsCard displays a collapsible card with workout tips
 */
export const TipsCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="tips-card-container">
      <Card 
        className="tips-card" 
        bordered 
        elevated
      >
        <div className="tips-card-header" onClick={() => setIsOpen(!isOpen)}>
          <h3>Tips for Great Workouts</h3>
          <button 
            className="collapse-button"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse tips' : 'Expand tips'}
          >
            {isOpen ? '−' : '+'}
          </button>
        </div>
        
        {isOpen && (
          <ul className="tips-list">
            {workoutTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default TipsCard; 