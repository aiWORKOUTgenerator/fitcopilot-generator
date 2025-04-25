# FitCopilot Workout Generator

A React/TypeScript WordPress plugin for generating personalized workout plans using OpenAI integration.

## Features

- AI-powered workout generation based on user preferences
- Direct synchronous integration with OpenAI
- Clean, modern UI built with React and Tailwind CSS
- Responsive design for all devices
- Workout history and progress tracking

## Technology Stack

- React for UI components
- TypeScript for type safety
- Tailwind CSS for styling
- WordPress plugin architecture
- OpenAI API for workout generation

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Documentation Hub](./docs/index.md)** - Main documentation entry point
- **[Developer Documentation](./docs/developer/index.md)** - Technical documentation for developers
- **[API Reference](./docs/developer/api/index.md)** - API endpoints and usage
- **[User Documentation](./docs/user/index.md)** - End-user documentation
- **[Contribution Guidelines](./docs/contribution/index.md)** - How to contribute to the project

## Installation

1. Clone this repository into your WordPress plugins directory:
   ```
   git clone https://github.com/aiWORKOUTgenerator/fitcopilot-generator.git wp-content/plugins/fitcopilot-generator
   ```

2. Install dependencies:
   ```
   cd wp-content/plugins/fitcopilot-generator
   npm install
   ```

3. Build the plugin:
   ```
   npm run build
   ```

4. Activate the plugin in your WordPress admin dashboard.

5. Configure your OpenAI API key in the FitCopilot settings.

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Usage

1. Add the shortcode `[fitcopilot_generator]` to any page or post.
2. Configure your workout preferences in the form.
3. Generate a personalized workout plan.
4. View and track your workouts in the dashboard.

For detailed usage instructions, see the [User Documentation](./docs/user/index.md).

## API

The plugin provides a RESTful API for generating and managing workouts. For details, see the [API Reference](./docs/developer/api/index.md).

## License

[MIT License](LICENSE)

## Credits

FitCopilot Workout Generator is developed and maintained by the AI Workout Generator team. 