import React from 'react';
import Button from './Button';
import { ArrowRight, Play, Zap } from 'lucide-react';

/**
 * GradientButtonExample
 * 
 * This component demonstrates the gradient button variants available in the Button component.
 * It shows both lime-green and violet gradient versions in various configurations.
 */
const GradientButtonExample: React.FC = () => {
  return (
    <div className="gradient-button-examples p-6 space-y-10">
      <div className="example-section">
        <h2 className="text-xl font-semibold mb-6">Green Gradient Buttons</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Primary Variant</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Small</label>
              <Button variant="gradient" size="sm">Small Button</Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Medium</label>
              <Button variant="gradient" size="md">Medium Button</Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Large</label>
              <Button variant="gradient" size="lg">Large Button</Button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">With Icons</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Start Icon</label>
              <Button 
                variant="gradient" 
                startIcon={<ArrowRight size={18} />}
              >
                Schedule Session
              </Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">End Icon</label>
              <Button 
                variant="gradient" 
                endIcon={<Play size={18} />}
              >
                Watch Demo
              </Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Full Width</label>
              <Button 
                variant="gradient" 
                endIcon={<Zap size={18} />}
                fullWidth
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Secondary Variant</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Standard</label>
              <Button variant="gradient-secondary">Secondary Button</Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">With Icon</label>
              <Button 
                variant="gradient-secondary" 
                endIcon={<ArrowRight size={18} />}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="example-section bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-6">Violet Gradient Buttons</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Primary Variant</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Small</label>
              <Button variant="gradient-violet" size="sm">Small Button</Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Medium</label>
              <Button variant="gradient-violet" size="md">Medium Button</Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Large</label>
              <Button variant="gradient-violet" size="lg">Large Button</Button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">With Icons</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Start Icon</label>
              <Button 
                variant="gradient-violet" 
                startIcon={<ArrowRight size={18} />}
              >
                Join Now
              </Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">End Icon</label>
              <Button 
                variant="gradient-violet" 
                endIcon={<Play size={18} />}
              >
                Watch Tour
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Secondary Variant</h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Standard</label>
              <Button variant="gradient-violet-secondary">Secondary Button</Button>
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">With Icon</label>
              <Button 
                variant="gradient-violet-secondary" 
                endIcon={<ArrowRight size={18} />}
              >
                Explore Gym
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientButtonExample; 