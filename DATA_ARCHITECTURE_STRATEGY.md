# 📊 DATA ARCHITECTURE STRATEGY: PROFILE vs SESSION DATA

## **Executive Summary**

This document defines the optimal strategy for handling two fundamentally different data types in the FitCopilot workout generation system:

1. **Profile Data** (Static/Persistent) - User preferences that rarely change
2. **Session Data** (Dynamic/Temporary) - Workout-specific data that changes frequently

---

## **🏗️ ARCHITECTURAL PRINCIPLES**

### **1. Clear Data Separation**
- **Profile Data**: Stored in WordPress user_meta, cached long-term
- **Session Data**: Stored in sessionStorage, expires after 24 hours
- **No Data Mixing**: Each type has dedicated storage, APIs, and management

### **2. Muscle Selection Classification**
**Muscle targeting is SESSION DATA** because:
- Changes daily or per workout
- Represents "today's focus" not permanent preferences  
- Should expire and reset regularly
- Influences immediate workout generation

### **3. Data Flow Architecture**
```
Profile Data (Static) → Provides suggestions and context
Session Data (Dynamic) → Drives actual workout generation
Combined Context → Sent to OpenAI Provider
```

---

## **📋 DATA TYPE DEFINITIONS**

### **🏠 PROFILE DATA (Static/Persistent)**

**Storage**: WordPress user_meta via `/wp-json/fitcopilot/v1/profile`
**Lifespan**: Weeks/months until user explicitly changes
**Caching**: Long-term (hours/days)

**Examples**:
```typescript
interface ProfileWorkoutData {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: string[]; // ['lose-weight', 'build-muscle']
  ownedEquipment: string[]; // ['dumbbells', 'resistance-bands']
  healthRestrictions: string[]; // ['knee-problems', 'back-issues']
  preferredDurations: { minimum: 15, maximum: 60, typical: 30 };
  musclePreferences: {
    favoriteGroups: string[]; // For suggestions only
    avoidedGroups: string[];
    lastTargeted: Record<string, Date>;
  };
}
```

### **⚡ SESSION DATA (Dynamic/Temporary)**

**Storage**: sessionStorage + optional API persistence
**Lifespan**: Single workout session or day (24 hours max)
**Caching**: Short-term (minutes/hours)

**Examples**:
```typescript
interface SessionWorkoutData {
  muscleTargeting: {
    selectedGroups: string[]; // Today's muscle focus
    specificMuscles: Record<string, string[]>;
    primaryFocus: string;
    selectionSummary: string;
  };
  timeAvailable: number; // Today's available time
  energyLevel: number; // Current energy (1-5)
  todaysFocus: 'fat-burning' | 'muscle-building' | 'endurance';
  intensityLevel: number; // Today's desired intensity
  equipmentToday: string[]; // Equipment available today
  physicalState: {
    soreness: string[]; // Currently sore areas
    sleepQuality: number; // Last night's sleep
    stressLevel: number; // Current stress
  };
}
```

---

## **🔄 IMPLEMENTATION STRATEGY**

### **Phase 1: Data Service Layer**

Create dedicated services for each data type:

```typescript
// Profile Data Service (Static)
class ProfileDataService {
  static extractWorkoutData(profile: any): ProfileWorkoutData
  static getMuscleGroupSuggestions(profile: ProfileWorkoutData): string[]
  static saveProfilePreferences(updates: Partial<ProfileWorkoutData>): Promise<void>
}

// Session Data Service (Dynamic)  
class SessionDataService {
  static extractSessionData(inputs: SessionInputs, muscles: MuscleSelection): SessionWorkoutData
  static saveSessionData(data: SessionWorkoutData): void // sessionStorage
  static loadSessionData(): SessionWorkoutData | null
  static clearExpiredData(): void
}

// Workout Context Service (Combiner)
class WorkoutContextService {
  static createWorkoutContext(profile: ProfileWorkoutData, session: SessionWorkoutData): WorkoutGenerationContext
  static formatForAPI(context: WorkoutGenerationContext): any
}
```

### **Phase 2: Storage Implementation**

**Profile Data Storage**:
```php
// WordPress user_meta
update_user_meta($user_id, 'fitcopilot_profile_workout_data', $profile_data);
```

**Session Data Storage**:
```typescript
// Frontend sessionStorage with expiration
const sessionData = {
  data: sessionWorkoutData,
  timestamp: Date.now(),
  expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
};
sessionStorage.setItem('fitcopilot_session_data', JSON.stringify(sessionData));
```

### **Phase 3: API Integration**

**Profile Endpoints** (Existing):
- `GET /wp-json/fitcopilot/v1/profile` - Load profile data
- `PUT /wp-json/fitcopilot/v1/profile` - Update profile data

**Session Endpoints** (New):
- `POST /wp-json/fitcopilot/v1/session-data` - Optional session persistence
- `DELETE /wp-json/fitcopilot/v1/session-data` - Clear session data

### **Phase 4: Muscle Selection Integration**

**Current State**: Muscle selection uses multiple storage mechanisms
**Target State**: Muscle selection as pure session data

```typescript
// Before: Mixed storage (localStorage + API + form state)
useMuscleSelection() // Stores in localStorage permanently

// After: Session-only storage
useSessionMuscleSelection() // Stores in sessionStorage with expiration
```

---

## **🎯 MUSCLE TARGETING STRATEGY**

### **Profile Role**: Suggestions Only
```typescript
// Profile provides muscle group suggestions based on goals
const profileSuggestions = ProfileDataService.getMuscleGroupSuggestions(profile, todaysFocus);
// Example: User's goal is "build-muscle" → suggests ["Chest", "Back", "Arms"]
```

### **Session Role**: Actual Targeting
```typescript
// Session provides actual muscle targeting for workout generation
const sessionTargeting = {
  selectedGroups: ["Chest", "Arms"], // User's choice for today
  specificMuscles: { "Chest": ["Upper Chest", "Lower Chest"] },
  primaryFocus: "Chest"
};
```

### **OpenAI Integration**
```typescript
// Combined context sent to OpenAI
const workoutContext = {
  profile: profileData, // For context and suggestions
  session: sessionData, // For actual workout targeting
  computed: {
    effectiveDuration: session.timeAvailable || profile.preferredDurations.typical,
    suggestedMuscles: ProfileDataService.getMuscleGroupSuggestions(profile),
    adjustedIntensity: calculateIntensity(profile, session)
  }
};
```

---

## **📈 BENEFITS OF THIS APPROACH**

### **1. Clear Data Ownership**
- Profile data managed by Profile system
- Session data managed by Workout Generator
- No confusion about data lifecycle

### **2. Optimal Performance**
- Profile data cached long-term (rarely fetched)
- Session data cached short-term (frequent updates)
- Reduced API calls and storage overhead

### **3. Better User Experience**
- Profile suggestions guide user choices
- Session data reflects current needs
- Automatic expiration prevents stale data

### **4. Simplified Maintenance**
- Clear separation of concerns
- Easier debugging and testing
- Predictable data flow

---

## **🚀 MIGRATION PLAN**

### **Step 1**: Create data architecture types and services
### **Step 2**: Update MuscleGroupCard to use session storage only
### **Step 3**: Modify workout generation to use combined context
### **Step 4**: Update OpenAI provider to handle new data structure
### **Step 5**: Add session data expiration and cleanup
### **Step 6**: Remove redundant muscle selection storage mechanisms

---

## **🔍 VALIDATION CRITERIA**

**Success Metrics**:
- [ ] Profile data changes only when user explicitly updates profile
- [ ] Session data automatically expires after 24 hours
- [ ] Muscle selection resets daily (no permanent storage)
- [ ] Workout generation uses combined profile + session context
- [ ] OpenAI provider receives properly formatted data
- [ ] No data duplication or storage conflicts

**Performance Targets**:
- Profile data: < 1 API call per session
- Session data: < 5 API calls per workout generation
- Storage: < 50KB total session data
- Expiration: Automatic cleanup of data > 24 hours old

This architecture provides a clean, scalable foundation for handling both static user preferences and dynamic workout needs while maintaining optimal performance and user experience. 