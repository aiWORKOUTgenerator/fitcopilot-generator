import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

interface ColorSwatchProps {
  name: string;
  color: string;
  textColor?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, color, textColor = 'black' }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    margin: '10px',
    width: '200px' 
  }}>
    <div style={{ 
      backgroundColor: color,
      height: '100px',
      width: '100%',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      marginBottom: '8px'
    }} />
    <div style={{ fontWeight: 'bold', color: textColor }}>{name}</div>
    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: textColor }}>{color}</div>
  </div>
);

const ColorGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ 
    display: 'flex', 
    flexWrap: 'wrap',
    gap: '16px'
  }}>
    {children}
  </div>
);

const ColorSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px' }}>{title}</h2>
    {children}
  </div>
);

const ColorSystem: React.FC = () => {
  const baseColors = [
    { name: 'Primary', color: 'var(--color-wg-primary)' },
    { name: 'Primary Hover', color: 'var(--color-wg-primary-hover)' },
    { name: 'Primary Active', color: 'var(--color-wg-primary-active)' },
    { name: 'Primary Disabled', color: 'var(--color-wg-primary-disabled)' },
    { name: 'Secondary', color: 'var(--color-wg-secondary)' },
    { name: 'Secondary Hover', color: 'var(--color-wg-secondary-hover)' },
    { name: 'Surface', color: 'var(--color-wg-surface)' }
  ];

  const feedbackColors = [
    { name: 'Success', color: 'var(--color-wg-success)' },
    { name: 'Error', color: 'var(--color-wg-error)' },
    { name: 'Warning', color: 'var(--color-wg-warning)' }
  ];

  const textColors = [
    { name: 'Text Primary', color: 'var(--color-wg-text-primary)' },
    { name: 'Text Secondary', color: 'var(--color-wg-text-secondary)' },
    { name: 'Text Disabled', color: 'var(--color-wg-text-disabled)' }
  ];

  const stateColors = [
    { name: 'Focus Outline', color: 'var(--color-wg-focus-outline)' },
    { name: 'Focus Background', color: 'var(--color-wg-focus-bg)' },
    { name: 'Hover Background', color: 'var(--color-wg-hover-bg)' },
    { name: 'Hover Text', color: 'var(--color-wg-hover-text)' }
  ];

  const darkModeColors = [
    { name: 'Dark Surface', color: 'var(--color-wg-dark-surface)', textColor: 'white' },
    { name: 'Dark Surface Hover', color: 'var(--color-wg-dark-surface-hover)', textColor: 'white' },
    { name: 'Dark Text Primary', color: 'var(--color-wg-dark-text-primary)', textColor: 'white' },
    { name: 'Dark Text Secondary', color: 'var(--color-wg-dark-text-secondary)', textColor: 'white' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>FitCopilot Color System</h1>
      <p>The comprehensive color system powering the FitCopilot UI components.</p>
      
      <ColorSection title="Base Colors">
        <ColorGrid>
          {baseColors.map(color => (
            <ColorSwatch key={color.name} name={color.name} color={color.color} />
          ))}
        </ColorGrid>
      </ColorSection>
      
      <ColorSection title="Feedback Colors">
        <ColorGrid>
          {feedbackColors.map(color => (
            <ColorSwatch key={color.name} name={color.name} color={color.color} />
          ))}
        </ColorGrid>
      </ColorSection>
      
      <ColorSection title="Text Colors">
        <ColorGrid>
          {textColors.map(color => (
            <ColorSwatch key={color.name} name={color.name} color={color.color} />
          ))}
        </ColorGrid>
      </ColorSection>
      
      <ColorSection title="State Colors">
        <ColorGrid>
          {stateColors.map(color => (
            <ColorSwatch key={color.name} name={color.name} color={color.color} />
          ))}
        </ColorGrid>
      </ColorSection>
      
      <ColorSection title="Dark Mode Colors">
        <ColorGrid>
          {darkModeColors.map(color => (
            <ColorSwatch 
              key={color.name} 
              name={color.name} 
              color={color.color} 
              textColor={color.textColor}
            />
          ))}
        </ColorGrid>
      </ColorSection>
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Usage Guidelines</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Primary Colors:</strong> Use for main actions, buttons, and key UI elements.</li>
          <li><strong>Secondary Colors:</strong> Use for supporting actions and secondary UI elements.</li>
          <li><strong>Feedback Colors:</strong> Use to communicate status, warnings, errors, and success states.</li>
          <li><strong>Text Colors:</strong> Use for typography with proper hierarchy and emphasis.</li>
          <li><strong>State Colors:</strong> Use for interactive states like hover, focus, and active.</li>
        </ul>
        
        <h3>Accessibility Notes</h3>
        <p>All color combinations meet WCAG 2.1 AA standards with a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.</p>
      </div>
    </div>
  );
};

const meta: Meta<typeof ColorSystem> = {
  title: 'FitCopilot/Design System/Color System',
  component: ColorSystem,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The complete color system for the FitCopilot design system.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorSystem>;

export const Default: Story = {};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark-theme" style={{ backgroundColor: '#121212', color: 'white', minHeight: '100vh', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
}; 