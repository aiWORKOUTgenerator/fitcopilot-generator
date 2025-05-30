/**
 * Button Test Component
 * 
 * Showcases all button variants, sizes, and states for testing purposes.
 */
import React, { useState } from 'react';
import Button, { ButtonVariant, ButtonSize } from './Button';

// Icon components for demonstration
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.0001 14.0001L11.1001 11.1001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.33334 8.00008H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 3.33325L12.6667 7.99992L8 12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ButtonTest: React.FC = () => {
  const variants: ButtonVariant[] = ['gradient', 'primary', 'secondary', 'outline', 'text'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  
  // State for loading buttons
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
  
  const handleLoadingClick = (id: string) => {
    setLoadingButton(id);
    setTimeout(() => setLoadingButton(null), 2000);
  };
  
  return (
    <div className="button-test-page">
      <style>{`
        .button-test-page {
          padding: 2rem;
          font-family: system-ui, sans-serif;
        }
        
        h1 {
          margin-bottom: 2rem;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        h2 {
          margin: 2rem 0 1rem;
          font-size: 1.25rem;
          font-weight: 500;
        }
        
        h3 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1rem;
          font-weight: 500;
          color: #666;
        }
        
        .section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
        }
        
        .dark-section {
          background-color: #1a1a1a;
          color: white;
        }
        
        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .button-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          align-items: center;
        }
        
        .button-row > * {
          min-width: 120px;
        }
        
        .full-width-container {
          max-width: 500px;
          margin-bottom: 1rem;
        }
        
        .label {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
      `}</style>
      
      <h1>Button Component Test Page</h1>
      
      <section className="section">
        <h2>Button Variants</h2>
        <div className="button-row">
          {variants.map(variant => (
            <Button key={variant} variant={variant}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Button>
          ))}
        </div>
      </section>
      
      <section className="section">
        <h2>Button Sizes</h2>
        {sizes.map(size => (
          <div className="button-row" key={size}>
            <div className="label">{size.toUpperCase()}</div>
            <Button size={size}>Button</Button>
          </div>
        ))}
      </section>
      
      <section className="section">
        <h2>Icons</h2>
        <div className="button-row">
          <Button startIcon={<SearchIcon />}>Search</Button>
          <Button endIcon={<ArrowRightIcon />}>Next</Button>
          <Button 
            startIcon={<SearchIcon />}
            endIcon={<ArrowRightIcon />}
          >
            Both Icons
          </Button>
        </div>
      </section>
      
      <section className="section">
        <h2>States</h2>
        
        <h3>Loading</h3>
        <div className="button-row">
          {variants.map(variant => (
            <Button 
              key={`loading-${variant}`}
              variant={variant}
              isLoading={loadingButton === `loading-${variant}`}
              onClick={() => handleLoadingClick(`loading-${variant}`)}
            >
              {loadingButton === `loading-${variant}` ? 'Loading...' : 'Click to Load'}
            </Button>
          ))}
        </div>
        
        <h3>Disabled</h3>
        <div className="button-row">
          {variants.map(variant => (
            <Button 
              key={`disabled-${variant}`}
              variant={variant}
              disabled
            >
              Disabled
            </Button>
          ))}
        </div>
      </section>
      
      <section className="section">
        <h2>Full Width</h2>
        <div className="full-width-container">
          <Button fullWidth variant="gradient">Full Width Button</Button>
        </div>
        <div className="full-width-container">
          <Button 
            fullWidth 
            variant="secondary"
            startIcon={<SearchIcon />}
          >
            Full Width with Icon
          </Button>
        </div>
      </section>
      
      <section className="section dark-section">
        <h2>Dark Theme</h2>
        <div className="dark-theme">
          <div className="button-row">
            {variants.map(variant => (
              <Button key={`dark-${variant}`} variant={variant}>
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            ))}
          </div>
          
          <h3>With Icons</h3>
          <div className="button-row">
            <Button 
              variant="gradient"
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
            <Button 
              variant="outline"
              endIcon={<ArrowRightIcon />}
            >
              Continue
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ButtonTest; 