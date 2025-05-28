/**
 * Profile Step Card Component
 * 
 * Displays individual step information with completion status and fitness-themed icons
 */

import React from 'react';
import { Card } from '../../../../components/ui';
import { StepCardData } from '../../types/step-cards';
import { 
  User, 
  Activity, 
  Dumbbell, 
  Heart, 
  Target,
  CheckCircle,
  Circle
} from 'lucide-react';

interface ProfileStepCardProps {
  stepData: StepCardData;
  onClick?: () => void;
  className?: string;
}

/**
 * Get fitness-themed icon for step
 */
const getStepIcon = (stepNumber: number, isComplete: boolean) => {
  const iconProps = {
    size: 24,
    className: `step-icon ${isComplete ? 'step-icon--complete' : 'step-icon--incomplete'}`
  };

  switch (stepNumber) {
    case 1:
      return <User {...iconProps} />;
    case 2:
      return <Activity {...iconProps} />;
    case 3:
      return <Dumbbell {...iconProps} />;
    case 4:
      return <Heart {...iconProps} />;
    case 5:
      return <Target {...iconProps} />;
    default:
      return <Circle {...iconProps} />;
  }
};

/**
 * Profile Step Card Component
 */
const ProfileStepCard: React.FC<ProfileStepCardProps> = ({
  stepData,
  onClick,
  className = ''
}) => {
  const {
    stepNumber,
    title,
    description,
    isComplete,
    completionText,
    summary,
    displayData
  } = stepData;

  return (
    <Card
      className={`profile-step-card ${isComplete ? 'profile-step-card--complete' : 'profile-step-card--incomplete'} ${className}`}
      hoverable={!!onClick}
      bordered
      primary={isComplete}
      onClick={onClick}
      padding="medium"
    >
      <div className="profile-step-card__header">
        <div className="profile-step-card__icon-container">
          {getStepIcon(stepNumber, isComplete)}
          <div className="profile-step-card__completion-indicator">
            {isComplete ? (
              <CheckCircle size={16} className="completion-check" />
            ) : (
              <Circle size={16} className="completion-pending" />
            )}
          </div>
        </div>
        
        <div className="profile-step-card__title-section">
          <h3 className="profile-step-card__title">{title}</h3>
          <p className="profile-step-card__description">{description}</p>
        </div>
      </div>

      <div className="profile-step-card__content">
        <div className="profile-step-card__summary">
          {summary}
        </div>
        
        <div className="profile-step-card__status">
          <span className={`status-badge ${isComplete ? 'status-badge--complete' : 'status-badge--incomplete'}`}>
            {completionText}
          </span>
        </div>
      </div>

      {/* Optional: Show key field data for completed steps */}
      {isComplete && displayData.length > 0 && (
        <div className="profile-step-card__details">
          {displayData.slice(0, 2).map((field, index) => (
            <div key={field.fieldKey} className="profile-step-card__field">
              <span className="field-label">{field.label}:</span>
              <span className="field-value">{field.value}</span>
            </div>
          ))}
          {displayData.length > 2 && (
            <div className="profile-step-card__more">
              +{displayData.length - 2} more
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProfileStepCard; 