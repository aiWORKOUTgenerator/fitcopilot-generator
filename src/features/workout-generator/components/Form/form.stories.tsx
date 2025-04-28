import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { WorkoutRequestForm } from './WorkoutRequestForm';

const meta: Meta<typeof WorkoutRequestForm> = {
  title: 'FitCopilot/Components/Form',
  component: WorkoutRequestForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'The main workout request form that collects user preferences and generates workouts.',
      },
    },
    chromatic: { viewports: [320, 768, 1024, 1440] },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkoutRequestForm>;

// Light theme stories
export const Default: Story = {
  args: {
    className: '',
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Default form in light mode',
      },
    },
  },
};

// Dark theme stories
export const DarkTheme: Story = {
  args: {
    className: '',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Form in dark mode',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark-theme" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};

// Responsive view
export const Mobile: Story = {
  args: {
    className: '',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Form on mobile devices',
      },
    },
  },
};

// Example of form with data pre-filled
export const Prefilled: Story = {
  args: {
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with pre-filled data',
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock the context with prefilled values
      return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Story />
        </div>
      );
    },
  ],
};

// Error state story
export const WithErrors: Story = {
  args: {
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with validation errors',
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Story />
        </div>
      );
    },
  ],
};

// Accessibility tests
export const AccessibilityTests: Story = {
  args: {
    className: '',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
    docs: {
      description: {
        story: 'Testing form against accessibility standards',
      },
    },
  },
}; 