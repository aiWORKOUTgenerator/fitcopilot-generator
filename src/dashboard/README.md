# FitCopilot Dashboard

The Dashboard is a central hub for users to manage their fitness journey with the FitCopilot plugin. It provides a comprehensive interface for accessing workout generation, profile management, and tracking API usage.

## Features

- **Responsive Layout**: 40/60 split layout on desktop that stacks on mobile devices
- **User Profile Management**: View and edit profile information
- **API Usage Tracking**: Monitor daily, weekly, and monthly API usage
- **Workout Generation**: Quick access to the workout generator
- **Recent Workouts**: View and manage recently created workouts

## Architecture

The Dashboard follows a feature-first architecture and is built with React 18 and TypeScript. It uses:

- **Context API** for state management
- **Component-based architecture** for reusability
- **CSS Modules with SCSS** for styling
- **Responsive design** with mobile-first approach

## Component Structure

```
src/dashboard/
├── components/
│   ├── ApiUsage.tsx
│   ├── RecentWorkouts.tsx
│   └── UserProfile.tsx
├── context/
│   └── DashboardContext.tsx
├── styles/
│   ├── Dashboard.scss
│   └── components.scss
├── Dashboard.tsx
├── index.ts
└── README.md
```

## Usage

The Dashboard can be integrated into the WordPress admin interface or embedded via shortcode:

```tsx
import { Dashboard } from './dashboard';

// In your main application
const App = () => {
  return (
    <div className="fitcopilot-app">
      <Dashboard />
    </div>
  );
};
```

## API Integration

The Dashboard components interact with the WordPress REST API endpoints:

- `GET/PUT /wp-json/my-wg/v1/profile` - User profile management
- `GET /wp-json/my-wg/v1/workouts` - Retrieve recent workouts
- `GET /wp-json/my-wg/v1/token-usage` - API usage statistics

## Styling

The Dashboard uses a dark theme by default and is styled with SCSS. CSS variables are used for themeable elements:

```scss
.fitcopilot-dashboard {
  --primary-bg: #121212;
  --card-bg: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --accent-color: #6366f1;
  --border-color: #333333;
}
```

## Accessibility

The Dashboard is built with accessibility in mind, following WCAG 2.1 AA guidelines:

- Proper heading hierarchy
- Sufficient color contrast
- Keyboard navigation support
- Screen reader-friendly elements

## Extension

The Dashboard can be extended with additional components by:

1. Creating new component files in the `components/` directory
2. Adding the component to the Dashboard layout
3. Updating the DashboardContext if additional state is required 