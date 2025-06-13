/**
 * Base FormFieldCard Component
 * 
 * Reusable card wrapper for all workout generator form fields
 */
import React from 'react';
import './FormFieldCard.scss';

interface FormFieldCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: 'standard' | 'complex';
  profileSection?: React.ReactNode;
}

/**
 * Shared form field card component with content-first architecture
 * Extracted from WorkoutGeneratorGrid for reusability across all cards
 */
export const FormFieldCard: React.FC<FormFieldCardProps> = ({
  title,
  description,
  children,
  delay = 0,
  className = '',
  variant = 'standard',
  profileSection
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`form-field-card ${isVisible ? 'visible' : ''} ${variant === 'complex' ? 'form-field-card--complex' : ''} ${className}`}
    >
      <div className="form-field-card-inner">
        {/* Profile Section (if provided) */}
        {profileSection}
        
        {/* Compact Header */}
        <div className="field-header">
          <div className="field-title">{title}</div>
          {description && (
            <div className="field-description">{description}</div>
          )}
        </div>

        {/* Content Area - Gets majority of space */}
        <div className="field-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormFieldCard; 