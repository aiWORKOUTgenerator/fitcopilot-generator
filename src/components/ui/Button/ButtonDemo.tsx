/**
 * Button Demo Component
 * 
 * Showcases the button component with variations matching the screenshot.
 */
import React from 'react';
import Button from './Button';

// Simple icon components for demo purposes
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const LightningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
);

const ButtonDemo = () => {
  return (
    <div style={{ background: '#1a1f2b', padding: '24px', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Gradient Variant</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Small</p>
        <Button variant="gradient" size="sm">Small Button</Button>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Medium</p>
        <Button variant="gradient" size="md">Medium Button</Button>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Large</p>
        <Button variant="gradient" size="lg">Large Button</Button>
      </div>
      
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>With Icons</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Arrow Icon</p>
        <Button variant="gradient" endIcon={<ArrowIcon />}>
          Schedule Session
        </Button>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Play Icon</p>
        <Button variant="gradient" endIcon={<PlayIcon />}>
          Watch Demo
        </Button>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Lightning Icon</p>
        <Button variant="gradient" endIcon={<LightningIcon />}>
          Get Started
        </Button>
      </div>
      
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Secondary Variant</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Default</p>
        <Button variant="secondary">Secondary Button</Button>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>With Icon</p>
        <Button variant="secondary" endIcon={<ArrowIcon />}>
          Learn More
        </Button>
      </div>
      
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>Full Width</h2>
      
      <div style={{ marginBottom: '24px', background: '#2a303c', padding: '24px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Gradient Full Width</p>
        <Button variant="gradient" fullWidth endIcon={<ArrowIcon />}>
          Schedule Session
        </Button>
      </div>
      
      <div style={{ marginBottom: '24px', background: '#2a303c', padding: '24px' }}>
        <p style={{ marginBottom: '8px', opacity: 0.7 }}>Secondary Full Width</p>
        <Button variant="secondary" fullWidth endIcon={<ArrowIcon />}>
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default ButtonDemo; 