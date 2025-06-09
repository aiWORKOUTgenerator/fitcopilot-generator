/**
 * Base FormFieldCard Component
 * 
 * Reusable card wrapper for all workout generator form fields
 */
import React, { useEffect, useState } from 'react';
import { CardVariant } from '../types';
import './FormFieldCard.scss';

interface FormFieldCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: CardVariant;
  profileSection?: React.ReactNode;
}

export const FormFieldCard: React.FC<FormFieldCardProps> = ({
  title,
  description,
  children,
  delay = 0,
  className = '',
  variant = 'standard',
  profileSection
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`form-field-card ${isVisible ? 'visible' : ''} ${
        variant === 'complex' ? 'form-field-card--complex' : ''
      } ${className}`}
    >
      <div className="form-field-card-inner">
        {/* Header Section */}
        <div className="field-header">
          <div className="field-title">{title}</div>
          {description && (
            <div className="field-description">{description}</div>
          )}
        </div>

        {/* Content Area */}
        <div className="field-content">
          {variant === 'complex' && (
            <div className="card-structure">
              {/* Profile Section Header */}
              {profileSection && (
                <div className="card-header">
                  {profileSection}
                </div>
              )}
              
              {/* Main Content Body */}
              <div className="card-body">
                {children}
              </div>
            </div>
          )}
          
          {variant === 'standard' && children}
        </div>
      </div>
    </div>
  );
}; 