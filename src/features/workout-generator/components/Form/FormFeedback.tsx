/**
 * FormFeedback Component
 * 
 * A presentational component for displaying feedback messages to users, such as
 * success confirmations or error notifications. The component uses appropriate
 * colors, icons, and ARIA attributes based on the feedback type.
 * 
 * @example
 * // Error message
 * <FormFeedback 
 *   type="error" 
 *   message="There was a problem submitting the form." 
 * />
 * 
 * @example
 * // Success message
 * <FormFeedback 
 *   type="success" 
 *   message="Your workout has been created successfully!" 
 * />
 */

import React from 'react';

export interface FormFeedbackProps {
  /** 
   * Type of feedback that determines the visual style
   * - error: Red styling with X icon (used for errors and problems)
   * - success: Green styling with checkmark icon (used for confirmations)
   */
  type: 'error' | 'success';
  
  /** 
   * Feedback message to display to the user
   * Should be clear, concise, and actionable when possible
   */
  message: string;
}

/**
 * Displays user feedback messages with appropriate visual styling and accessibility attributes.
 * 
 * The component automatically sets the correct:
 * - Background, text, and border colors based on the type
 * - Icon (checkmark for success, X for errors)
 * - ARIA role (alert for errors, status for success messages)
 * 
 * This component is designed to be used within forms to provide immediate feedback
 * about form submissions, validation errors, or successful actions.
 * 
 * @param {FormFeedbackProps} props - Component properties
 * @returns {JSX.Element} Rendered feedback component
 */
const FormFeedback: React.FC<FormFeedbackProps> = ({ type, message }) => {
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const borderColor = type === 'error' ? 'border-red-300' : 'border-green-300';
  const iconColor = type === 'error' ? 'text-red-400' : 'text-green-400';
  
  const icon = type === 'error' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
  
  return (
    <div 
      className={`${bgColor} ${borderColor} border p-4 rounded-md`} 
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-3">
          <p className={`${textColor} text-sm font-medium`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export { FormFeedback };
export default FormFeedback; 