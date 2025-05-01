import React from 'react';
import Button from '../components/ui/Button/Button';
import { CardThemeTest } from '../components/ui/Card';
import { ArrowRight, Play, Zap } from 'lucide-react';
import './ColorSystemDemo.scss';

/**
 * ColorSystemDemo showcases the FitCopilot color system.
 * This component demonstrates how to use the various color tokens and functions.
 * 
 * @returns {JSX.Element} The ColorSystemDemo component
 */
const ColorSystemDemo: React.FC = () => {
  return (
    <div className="color-system-demo">
      <h2>FitCopilot Color System</h2>
      
      <section className="demo-section">
        <h3>Card Component</h3>
        <div className="card-demo-container">
          <CardThemeTest />
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Semantic Colors</h3>
        <div className="color-grid">
          <div className="color-item primary">Primary</div>
          <div className="color-item primary-light">Primary Light</div>
          <div className="color-item primary-dark">Primary Dark</div>
          
          <div className="color-item secondary">Secondary</div>
          <div className="color-item secondary-light">Secondary Light</div>
          <div className="color-item secondary-dark">Secondary Dark</div>
          
          <div className="color-item background">Background</div>
          <div className="color-item background-light">Background Light</div>
          <div className="color-item background-dark">Background Dark</div>
          <div className="color-item background-card">Background Card</div>
          
          <div className="color-item text">Text</div>
          <div className="color-item text-muted">Text Muted</div>
          <div className="color-item text-light">Text Light</div>
          <div className="color-item text-dark">Text Dark</div>
          
          <div className="color-item border">Border</div>
          <div className="color-item border-light">Border Light</div>
          <div className="color-item border-dark">Border Dark</div>
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Status Colors</h3>
        <div className="color-grid">
          <div className="color-item success">Success</div>
          <div className="color-item error">Error</div>
          <div className="color-item warning">Warning</div>
          <div className="color-item info">Info</div>
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Feature Colors</h3>
        <div className="color-grid">
          <div className="color-item feature-virtual-bg">Virtual BG</div>
          <div className="color-item feature-virtual-accent">Virtual Accent</div>
          
          <div className="color-item feature-schedule-bg">Schedule BG</div>
          <div className="color-item feature-schedule-accent">Schedule Accent</div>
          
          <div className="color-item feature-progress-bg">Progress BG</div>
          <div className="color-item feature-progress-accent">Progress Accent</div>
          
          <div className="color-item feature-support-bg">Support BG</div>
          <div className="color-item feature-support-accent">Support Accent</div>
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Gradients</h3>
        <div className="color-grid">
          <div className="color-item gradient-lime">Lime</div>
          <div className="color-item gradient-cyan">Cyan</div>
          <div className="color-item gradient-violet">Violet</div>
          <div className="color-item gradient-amber">Amber</div>
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Gradient Buttons</h3>
        <div className="button-grid">
          <div className="button-section">
            <h4>Green Gradient Buttons</h4>
            <div className="button-row">
              <Button variant="gradient" size="sm">Small</Button>
              <Button variant="gradient">Medium</Button>
              <Button variant="gradient" size="lg">Large</Button>
            </div>
            <div className="button-row">
              <Button variant="gradient" startIcon={<ArrowRight size={18} />}>
                Start Icon
              </Button>
              <Button variant="gradient" endIcon={<Play size={18} />}>
                End Icon
              </Button>
              <Button variant="gradient-secondary">Secondary</Button>
            </div>
          </div>
          
          <div className="button-section">
            <h4>Violet Gradient Buttons</h4>
            <div className="button-row">
              <Button variant="gradient-violet" size="sm">Small</Button>
              <Button variant="gradient-violet">Medium</Button>
              <Button variant="gradient-violet" size="lg">Large</Button>
            </div>
            <div className="button-row">
              <Button variant="gradient-violet" startIcon={<Zap size={18} />}>
                Start Icon
              </Button>
              <Button variant="gradient-violet" endIcon={<ArrowRight size={18} />}>
                End Icon
              </Button>
              <Button variant="gradient-violet-secondary">Secondary</Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Overlays</h3>
        <div className="color-grid">
          <div className="color-item overlay-dark">Dark</div>
          <div className="color-item overlay-light">Light</div>
          <div className="color-item overlay-custom">Custom (50%)</div>
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Alpha Transparency</h3>
        <div className="color-grid">
          <div className="color-item primary-alpha-20">Primary 20%</div>
          <div className="color-item primary-alpha-50">Primary 50%</div>
          <div className="color-item primary-alpha-80">Primary 80%</div>
          
          <div className="color-item text-alpha-20">Text 20%</div>
          <div className="color-item text-alpha-50">Text 50%</div>
          <div className="color-item text-alpha-80">Text 80%</div>
        </div>
      </section>
      
      <section className="demo-section">
        <h3>Direct CSS Variables Usage</h3>
        <div className="css-variables-demo">
          <div style={{ 
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text)',
            padding: '1rem',
            marginBottom: '0.5rem'
          }}>
            Using CSS variables directly
          </div>
          
          <div style={{ 
            backgroundColor: `rgba(var(--color-primary-rgb), 0.2)`,
            color: 'var(--color-text)',
            padding: '1rem'
          }}>
            Using RGB variables for opacity
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorSystemDemo; 