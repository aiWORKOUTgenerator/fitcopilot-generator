/**
 * Tailwind CSS plugin to integrate the FitCopilot enhanced color system
 */
module.exports = function ({ addUtilities, addComponents, _theme, _e }) {
  /**
     * Add utilities for background colors
     */
  const backgroundUtilities = {
    '.bg-background-primary': {
      backgroundColor: 'var(--color-background-primary)'
    },
    '.bg-background-secondary': {
      backgroundColor: 'var(--color-background-secondary)'
    },
    '.bg-background-tertiary': {
      backgroundColor: 'var(--color-background-tertiary)'
    },
    '.bg-surface-primary': {
      backgroundColor: 'var(--color-surface-primary)'
    },
    '.bg-surface-secondary': {
      backgroundColor: 'var(--color-surface-secondary)'
    }
  };

  /**
     * Add utilities for text colors
     */
  const textUtilities = {
    '.text-text-primary': {
      color: 'var(--color-text-primary)'
    },
    '.text-text-secondary': {
      color: 'var(--color-text-secondary)'
    },
    '.text-text-accent': {
      color: 'var(--color-text-accent)'
    }
  };

  /**
     * Add utilities for border colors
     */
  const borderUtilities = {
    '.border-border-light': {
      borderColor: 'var(--color-border-light)'
    },
    '.border-border-medium': {
      borderColor: 'var(--color-border-medium)'
    }
  };

  /**
     * Add utilities for applying theme variants
     */
  const themeUtilities = {
    '.theme-default': {
      'data-theme': 'default'
    },
    '.theme-gym': {
      'data-theme': 'gym'
    },
    '.theme-sports': {
      'data-theme': 'sports'
    },
    '.theme-wellness': {
      'data-theme': 'wellness'
    },
    '.theme-modern': {
      'data-theme': 'modern'
    },
    '.theme-classic': {
      'data-theme': 'classic'
    },
    '.theme-minimalist': {
      'data-theme': 'minimalist'
    }
  };

  /**
     * Add utilities for background patterns
     */
  const patternUtilities = {
    '.bg-pattern-grid': {
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: '0',
        backgroundImage: `
          linear-gradient(var(--color-grid-pattern) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-grid-pattern) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
        zIndex: '1',
        pointerEvents: 'none',
        opacity: '0.05'
      }
    },
    '.bg-pattern-dots': {
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: '0',
        backgroundImage: 'radial-gradient(var(--color-grid-pattern) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        zIndex: '1',
        pointerEvents: 'none',
        opacity: '0.05'
      }
    }
  };

  // Add all utilities
  addUtilities(backgroundUtilities);
  addUtilities(textUtilities);
  addUtilities(borderUtilities);
  addUtilities(themeUtilities);
  addUtilities(patternUtilities);

  // Add base components
  addComponents({
    '.section-component': {
      position: 'relative',
      backgroundColor: 'var(--color-background-primary)',
      color: 'var(--color-text-primary)',
      overflow: 'hidden'
    }
  });
}; 