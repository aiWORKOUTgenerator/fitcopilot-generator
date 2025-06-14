/**
 * Premium Preview Step Component
 * 
 * Enhanced preview step for the new modularized WorkoutGeneratorGrid.
 * This component provides a testing ground for each newly migrated card,
 * allowing validation of the modular architecture incrementally.
 */
import React from 'react';
import { Card } from '../../../../../components/ui';
import { Button } from '../../../../../components/ui';
import { WorkoutFormParams, SessionSpecificInputs } from '../../../types/workout';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { EquipmentIcon } from '../../../utils/EquipmentIcons';
import './PremiumPreviewStep.scss';

interface PremiumPreviewStepProps {
  /** Form values to preview */
  formValues: WorkoutFormParams;
  /** Callback when the user wants to edit their selections */
  onEditRequest: () => void;
  /** Callback when the user confirms and wants to generate a workout */
  onGenerateWorkout: () => void;
  /** Loading state */
  isLoading?: boolean;
}

// Migration flags to track which cards are using the new modular system
const MODULAR_CARDS_ACTIVE = {
  equipment: true,    // ✅ Migrated - Modular component active
  focus: true,        // ✅ Migrated - Phase 1 complete
  intensity: true,    // ✅ Migrated - Phase 2 complete
  duration: true,     // ✅ Migrated - Phase 3 complete
  muscles: true,      // ✅ Migrated - Target Muscle integration complete
  restrictions: true, // ✅ Migrated - Phase 4 complete
  location: true,     // ✅ Migrated - Phase 5 complete
  stress: true,       // ✅ Migrated - Phase 6 complete (StressMoodCard)
  energy: true,       // ✅ Migrated - Phase 7 complete (EnergyMoodCard)
  sleep: true,        // ✅ Migrated - Phase 8 complete (SleepQualityCard)
  customization: true  // ✅ Migrated - Phase 9 complete (WorkoutCustomizationCard) - 100% ACHIEVED!
};

// Enhanced label mappings for the new modular cards
const ENHANCED_LABELS = {
  GOALS: {
    'lose-weight': 'Fat Burning & Cardio',
    'build-muscle': 'Muscle Building',
    'improve-endurance': 'Endurance & Stamina',
    'increase-strength': 'Strength Training',
    'enhance-flexibility': 'Flexibility & Mobility',
    'general-fitness': 'General Fitness',
    'sport-specific': 'Sport-Specific Training'
  },
  DIFFICULTY: {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
  },
  EQUIPMENT: {
    'none': 'No Equipment',
    'dumbbells': 'Dumbbells',
    'resistance-bands': 'Resistance Bands',
    'kettlebells': 'Kettlebells',
    'barbell': 'Barbell',
    'pull-up-bar': 'Pull-up Bar',
    'bench': 'Bench',
    'yoga-mat': 'Yoga Mat',
    'medicine-ball': 'Medicine Ball',
    'stability-ball': 'Stability Ball',
    'cable-machine': 'Cable Machine',
    'squat-rack': 'Squat Rack',
    'leg-press': 'Leg Press',
    'treadmill': 'Treadmill',
    'stationary-bike': 'Stationary Bike',
    'elliptical': 'Elliptical',
    'rowing-machine': 'Rowing Machine',
    'trx': 'TRX',
    'jump-rope': 'Jump Rope',
  },
  ENVIRONMENT: {
    'gym': 'Gym',
    'home': 'Home',
    'outdoors': 'Outdoors',
    'travel': 'Travel',
    'limited-space': 'Limited Space',
  },
  INTENSITY: {
    1: 'Very Low',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Very High',
    6: 'Maximum'
  },
  RESTRICTIONS: {
    'lower-back': 'Lower Back Issues',
    'knees': 'Knee Problems',
    'shoulders': 'Shoulder Issues',
    'wrists': 'Wrist Problems',
    'neck': 'Neck Issues',
    'ankles': 'Ankle Problems',
    'hips': 'Hip Issues',
    'upper-back': 'Upper Back Issues',
    'elbows': 'Elbow Problems'
  },
  MUSCLE_GROUPS: {
    'chest': 'Chest',
    'back': 'Back',
    'shoulders': 'Shoulders',
    'arms': 'Arms',
    'legs': 'Legs',
    'glutes': 'Glutes',
    'core': 'Core',
    'calves': 'Calves',
    'forearms': 'Forearms',
    'traps': 'Traps',
    'lats': 'Lats',
    'quads': 'Quadriceps',
    'hamstrings': 'Hamstrings'
  }
};

/**
 * Premium Preview Step Component with modular card preview support
 */
const PremiumPreviewStep: React.FC<PremiumPreviewStepProps> = ({
  formValues,
  onEditRequest,
  onGenerateWorkout,
  isLoading = false,
}) => {
  const sessionInputs = formValues.sessionInputs || {};
  const equipment = formValues.equipment || [];

  // Helper function to get intensity label
  const getIntensityLabel = (intensity: number): string => {
    return ENHANCED_LABELS.INTENSITY[intensity as keyof typeof ENHANCED_LABELS.INTENSITY] || 'Moderate';
  };

  // Helper function to format modular card data
  const getModularCardData = () => {
    const cards = [];

    // Equipment Card (modular)
    if (MODULAR_CARDS_ACTIVE.equipment) {
      cards.push({
        id: 'equipment',
        label: 'Equipment (Modular)',
        value: sessionInputs.equipmentAvailableToday?.length 
          ? sessionInputs.equipmentAvailableToday.join(', ')
          : 'No equipment selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Focus Card (when migrated)
    if (MODULAR_CARDS_ACTIVE.focus) {
      cards.push({
        id: 'focus',
        label: 'Focus (Modular)',
        value: sessionInputs.todaysFocus 
          ? (ENHANCED_LABELS.GOALS[sessionInputs.todaysFocus as keyof typeof ENHANCED_LABELS.GOALS] || 
             sessionInputs.todaysFocus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))
          : 'No focus selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Intensity Card (when migrated)
    if (MODULAR_CARDS_ACTIVE.intensity) {
      cards.push({
        id: 'intensity',
        label: 'Intensity (Modular)',
        value: sessionInputs.dailyIntensityLevel 
          ? `${sessionInputs.dailyIntensityLevel}/6 - ${getIntensityLabel(sessionInputs.dailyIntensityLevel)}`
          : 'No intensity selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Duration Card (when migrated)
    if (MODULAR_CARDS_ACTIVE.duration) {
      cards.push({
        id: 'duration',
        label: 'Duration (Modular)',
        value: sessionInputs.timeConstraintsToday 
          ? `${sessionInputs.timeConstraintsToday} minutes`
          : 'No duration selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Target Muscle Groups Card (integrated)
    if (MODULAR_CARDS_ACTIVE.muscles) {
      // Check multiple sources for muscle data
      const muscleGroups = sessionInputs.focusArea || formValues.muscleTargeting?.targetMuscleGroups || [];
      const specificMuscles = formValues.muscleTargeting?.specificMuscles;
      const selectionSummary = formValues.muscleTargeting?.selectionSummary;

      let displayValue = '';
      
      if (selectionSummary) {
        // Use the formatted summary from muscle integration
        displayValue = selectionSummary;
      } else if (muscleGroups.length > 0) {
        // Format muscle groups with enhanced labels
        const muscleLabels = muscleGroups.map((muscle: string) => 
          ENHANCED_LABELS.MUSCLE_GROUPS[muscle as keyof typeof ENHANCED_LABELS.MUSCLE_GROUPS] || 
          muscle.charAt(0).toUpperCase() + muscle.slice(1)
        );
        displayValue = muscleLabels.join(', ');
        
        // Add specific muscles if available
        if (specificMuscles && Object.keys(specificMuscles).length > 0) {
          const specificCount = Object.values(specificMuscles).reduce((total, muscles) => total + muscles.length, 0);
          if (specificCount > 0) {
            displayValue += ` (+${specificCount} specific muscles)`;
          }
        }
      } else {
        // Provide fallback value like other cards
        displayValue = 'No muscle groups selected';
      }
      
      cards.push({
        id: 'muscles',
        label: 'Target Muscles (Modular)',
        value: displayValue,
        isModular: true,
        badge: '✨'
      });
    }

    // Restrictions Card (Phase 4)
    if (MODULAR_CARDS_ACTIVE.restrictions) {
      const restrictionLabels = sessionInputs.healthRestrictionsToday?.length 
        ? sessionInputs.healthRestrictionsToday.map(restriction => 
            ENHANCED_LABELS.RESTRICTIONS[restriction as keyof typeof ENHANCED_LABELS.RESTRICTIONS] || restriction
          )
        : [];
      
      cards.push({
        id: 'restrictions',
        label: 'Restrictions (Modular)',
        value: restrictionLabels.length > 0 
          ? restrictionLabels.join(', ')
          : 'No restrictions selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Location Card (Phase 5)
    if (MODULAR_CARDS_ACTIVE.location) {
      cards.push({
        id: 'location',
        label: 'Location (Modular)',
        value: sessionInputs.locationToday
          ? (ENHANCED_LABELS.ENVIRONMENT[sessionInputs.locationToday as keyof typeof ENHANCED_LABELS.ENVIRONMENT] || 
             sessionInputs.locationToday.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))
          : 'No location selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Stress/Mood Card (Phase 6)
    if (MODULAR_CARDS_ACTIVE.stress) {
      cards.push({
        id: 'stress',
        label: 'Stress Level (Modular)',
        value: sessionInputs.moodLevel
          ? `${sessionInputs.moodLevel}/6 - ${ENHANCED_LABELS.INTENSITY[sessionInputs.moodLevel as keyof typeof ENHANCED_LABELS.INTENSITY] || 'Moderate'}`
          : 'No stress level selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Energy/Motivation Card (Phase 7)
    if (MODULAR_CARDS_ACTIVE.energy) {
      cards.push({
        id: 'energy',
        label: 'Energy Level (Modular)',
        value: sessionInputs.energyLevel
          ? `${sessionInputs.energyLevel}/6 - ${ENHANCED_LABELS.INTENSITY[sessionInputs.energyLevel as keyof typeof ENHANCED_LABELS.INTENSITY] || 'Moderate'}`
          : 'No energy level selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Sleep Quality Card (Phase 8)
    if (MODULAR_CARDS_ACTIVE.sleep) {
      const sleepLabels = {
        6: 'Excellent',
        5: 'Good', 
        4: 'Fair',
        3: 'Poor',
        2: 'Very Poor',
        1: 'Terrible'
      };
      
      cards.push({
        id: 'sleep',
        label: 'Sleep Quality (Modular)',
        value: sessionInputs.sleepQuality
          ? `${sessionInputs.sleepQuality}/6 - ${sleepLabels[sessionInputs.sleepQuality as keyof typeof sleepLabels] || 'Unknown'}`
          : 'No sleep quality selected',
        isModular: true,
        badge: '✨'
      });
    }

    // Workout Customization Card (Phase 9 - FINAL!)
    if (MODULAR_CARDS_ACTIVE.customization) {
      const customizationText = sessionInputs.workoutCustomization?.trim();
      const previewText = customizationText && customizationText.length > 50 
        ? customizationText.slice(0, 50) + '...' 
        : customizationText;
      
      cards.push({
        id: 'customization',
        label: 'Custom Requests (Modular)',
        value: previewText || 'No custom preferences specified',
        isModular: true,
        badge: '✨'
      });
    }

    // 🎉 ALL CARDS MIGRATED - 100% MODULARIZATION COMPLETE!

    return cards;
  };

  const modularCards = getModularCardData();

  return (
    <div className="premium-preview-step">
      {/* Header with Premium Badge */}
      <div className="premium-preview-step__header">
        <div className="premium-badge">
          <Sparkles size={16} />
          <span>Premium Preview</span>
        </div>
        <h2 className="premium-preview-step__title">Enhanced Workout Summary</h2>
        <p className="premium-preview-step__subtitle">
          Previewing your modular workout configuration
        </p>
      </div>
      
      <div className="premium-workout-preview">

        {/* Modular Cards Section */}
        {modularCards.length > 0 && (
          <div className="preview-section">
            <h3 className="preview-section__title">
              <Sparkles size={18} className="section-icon" />
              Modular Card Data
              <span className="modular-count">({modularCards.length} active)</span>
            </h3>
            <div className="modular-cards-grid">
              {modularCards.map((card) => (
                <Card key={card.id} className="modular-preview-card">
                  <div className="modular-preview-card__header">
                    <span className="modular-badge">{card.badge}</span>
                    <div className="modular-preview-card__label">{card.label}</div>
                  </div>
                  <div className="modular-preview-card__value">{card.value}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Equipment Section (for comparison) */}
        {equipment.length > 0 && !MODULAR_CARDS_ACTIVE.equipment && (
          <div className="preview-section">
            <h3 className="preview-section__title">Equipment (Legacy)</h3>
            <div className="equipment-display">
              {equipment.map((item: string, index: number) => (
                <span key={index} className="equipment-tag legacy">
                  <EquipmentIcon type={item} size={20} />
                  {ENHANCED_LABELS.EQUIPMENT[item as keyof typeof ENHANCED_LABELS.EQUIPMENT] || item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Session Inputs Preview */}
        {Object.keys(sessionInputs).length > 0 && (
          <div className="preview-section">
            <h3 className="preview-section__title">Today's Session Factors</h3>
            <div className="session-inputs-grid">
              {sessionInputs.energyLevel && (
                <div className="session-input-item">
                  <span className="session-label">Energy Level:</span>
                  <span className="session-value">{sessionInputs.energyLevel}/5</span>
                </div>
              )}
              
              {sessionInputs.moodLevel && (
                <div className="session-input-item">
                  <span className="session-label">Stress Level:</span>
                  <span className="session-value">{sessionInputs.moodLevel}/5</span>
                </div>
              )}
              
              {sessionInputs.sleepQuality && (
                <div className="session-input-item">
                  <span className="session-label">Sleep Quality:</span>
                  <span className="session-value">{sessionInputs.sleepQuality}/5</span>
                </div>
              )}

              {sessionInputs.timeConstraintsToday && (
                <div className="session-input-item">
                  <span className="session-label">Time Available:</span>
                  <span className="session-value">{sessionInputs.timeConstraintsToday} min</span>
                </div>
              )}

              {sessionInputs.locationToday && (
                <div className="session-input-item">
                  <span className="session-label">Location:</span>
                  <span className="session-value">
                    {sessionInputs.locationToday.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Migration Status Indicator */}
        <div className="migration-status">
          <h4 className="migration-status__title">Migration Progress</h4>
          <div className="migration-cards">
            {Object.entries(MODULAR_CARDS_ACTIVE).map(([card, isActive]) => (
              <div key={card} className={`migration-card ${isActive ? 'active' : 'pending'}`}>
                <span className="migration-icon">{isActive ? '✅' : '🚧'}</span>
                <span className="migration-label">
                  {card.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="premium-preview-step__notice">
        <Sparkles size={16} />
        Preview your enhanced modular workout configuration before generation.
      </div>
      
      <div className="premium-preview-step__actions">
        <Button 
          onClick={onEditRequest}
          variant="secondary"
          size="lg"
          disabled={isLoading}
          aria-label="Edit workout request"
          className="premium-preview-step__edit-button"
          startIcon={<ArrowLeft size={20} />}
        >
          Edit Request
        </Button>
        
        <Button 
          onClick={onGenerateWorkout}
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          aria-label="Generate premium workout"
          className="premium-preview-step__generate-button"
          endIcon={<Plus size={20} className="generate-icon" />}
        >
          Generate Premium Workout
        </Button>
      </div>
    </div>
  );
};

export default PremiumPreviewStep; 