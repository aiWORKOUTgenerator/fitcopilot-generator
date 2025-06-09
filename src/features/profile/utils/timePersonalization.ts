/**
 * Time-based personalization utilities
 * Provides personalized greetings and messages based on the current time of day
 */

export interface TimeBasedPersonalization {
  greeting: string;
  emoji: string;
  message: string;
  description: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Get time-based personalization data
 * @param userName Optional user name to include in personalization
 * @returns Personalized greeting, emoji, and message based on current time
 */
export function getTimeBasedPersonalization(userName?: string): TimeBasedPersonalization {
  const now = new Date();
  const hour = now.getHours();
  
  // Determine time of day
  let timeOfDay: TimeBasedPersonalization['timeOfDay'];
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  // Create personalized content based on time of day
  const personalizations = {
    morning: {
      greeting: userName ? `Good morning, ${userName}!` : 'Good Morning!',
      emoji: '🌅',
      message: 'Your fitness profile is ready to power your day ahead.',
      description: 'Perfect timing for a morning workout to energize your day!'
    },
    afternoon: {
      greeting: userName ? `Good afternoon, ${userName}!` : 'Good Afternoon!',
      emoji: '☀️',
      message: 'Your fitness profile is loaded and ready for action.',
      description: 'Great time for a midday workout or planning your evening routine!'
    },
    evening: {
      greeting: userName ? `Good evening, ${userName}!` : 'Good Evening!',
      emoji: '🌆',
      message: 'Your fitness profile is set for evening workouts.',
      description: 'Wind down with a perfect workout tailored to your preferences!'
    },
    night: {
      greeting: userName ? `Hello, ${userName}!` : 'Hello!',
      emoji: '🌙',
      message: 'Your fitness profile is ready whenever you are.',
      description: 'Late night planning? Set up tomorrow\'s perfect workout routine!'
    }
  };

  return {
    ...personalizations[timeOfDay],
    timeOfDay
  };
}

/**
 * Get a motivational message based on time of day and fitness goals
 * @param goals User's fitness goals
 * @param timeOfDay Current time of day
 * @returns Motivational message
 */
export function getMotivationalMessage(goals: string[], timeOfDay: string): string {
  const goalMessages = {
    morning: {
      weight_loss: 'Start your day with a calorie-burning workout!',
      muscle_building: 'Morning strength training sets the tone for growth!',
      endurance: 'Build stamina with a morning cardio session!',
      flexibility: 'Begin your day with energizing stretches!',
      general_fitness: 'Kickstart your fitness journey this morning!',
      default: 'Make this morning count with a great workout!'
    },
    afternoon: {
      weight_loss: 'Midday movement keeps your metabolism active!',
      muscle_building: 'Afternoon strength training for maximum gains!',
      endurance: 'Perfect time for endurance training!',
      flexibility: 'Afternoon yoga can refresh your energy!',
      general_fitness: 'Keep your fitness momentum going!',
      default: 'A perfect afternoon for staying active!'
    },
    evening: {
      weight_loss: 'End your day strong with fat-burning exercises!',
      muscle_building: 'Evening workouts for muscle recovery and growth!',
      endurance: 'Wind down with a steady endurance session!',
      flexibility: 'Evening stretches help you relax and unwind!',
      general_fitness: 'Finish your day with a satisfying workout!',
      default: 'Perfect evening for achieving your fitness goals!'
    },
    night: {
      weight_loss: 'Plan tomorrow\'s calorie-burning adventure!',
      muscle_building: 'Rest and recover for tomorrow\'s strength gains!',
      endurance: 'Prepare for tomorrow\'s endurance challenge!',
      flexibility: 'Gentle stretches for better sleep and recovery!',
      general_fitness: 'Set yourself up for tomorrow\'s success!',
      default: 'Rest up and plan your next fitness victory!'
    }
  };

  const timeMessages = goalMessages[timeOfDay as keyof typeof goalMessages];
  if (!timeMessages) return goalMessages.morning.default;

  // Find the first matching goal or use default
  const primaryGoal = goals.find(goal => goal in timeMessages) || 'default';
  return timeMessages[primaryGoal as keyof typeof timeMessages] || timeMessages.default;
}

/**
 * Get time-appropriate workout suggestions
 * @param timeOfDay Current time of day
 * @returns Array of workout suggestions
 */
export function getWorkoutSuggestions(timeOfDay: string): string[] {
  const suggestions = {
    morning: [
      'Energy-boosting yoga flow',
      'High-intensity interval training',
      'Morning run or walk',
      'Full-body strength circuit'
    ],
    afternoon: [
      'Power lifting session',
      'Cardio interval training',
      'Sports-specific drills',
      'Core-focused workout'
    ],
    evening: [
      'Moderate strength training',
      'Yoga or pilates',
      'Swimming or water aerobics',
      'Flexibility and mobility work'
    ],
    night: [
      'Gentle stretching routine',
      'Meditation and breathwork',
      'Light yoga practice',
      'Recovery and foam rolling'
    ]
  };

  return suggestions[timeOfDay as keyof typeof suggestions] || suggestions.morning;
} 