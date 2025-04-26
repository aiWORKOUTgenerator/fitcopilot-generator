import React from 'react';
import './Button.scss';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = props => (
  <button className="btn" {...props}>{props.children}</button>
); 