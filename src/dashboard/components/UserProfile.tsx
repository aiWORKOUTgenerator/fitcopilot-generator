import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

interface UserProfileData {
  name: string;
  email: string;
  fitnessLevel: string;
  fitnessGoals: string[];
  preferredWorkoutTypes: string[];
  availableEquipment: string[];
}

/**
 * Displays and manages user profile information
 * 
 * @returns {JSX.Element} The rendered UserProfile component
 */
const UserProfile: React.FC = () => {
  const { state } = useDashboard();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // API call would go here
        // const response = await fetch('/wp-json/my-wg/v1/profile', ...);
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setProfile({
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            fitnessLevel: 'Intermediate',
            fitnessGoals: ['Build Muscle', 'Improve Endurance'],
            preferredWorkoutTypes: ['HIIT', 'Strength Training'],
            availableEquipment: ['Dumbbells', 'Resistance Bands', 'Yoga Mat']
          });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [state.lastRefresh]);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleSaveClick = () => {
    // Here we would save the profile changes
    // const saveProfile = async () => {
    //   await fetch('/wp-json/my-wg/v1/profile', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(profile)
    //   });
    // };
    // saveProfile();
    
    setIsEditing(false);
  };
  
  if (isLoading) {
    return <div className="profile-loading">Loading profile data...</div>;
  }
  
  if (!profile) {
    return <div className="profile-error">Could not load profile information.</div>;
  }
  
  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name.charAt(0)}
        </div>
        <div className="profile-name-email">
          <h3 className="profile-name">{profile.name}</h3>
          <div className="profile-email">{profile.email}</div>
        </div>
        {!isEditing ? (
          <button className="edit-profile-button" onClick={handleEditClick}>
            Edit
          </button>
        ) : (
          <button className="save-profile-button" onClick={handleSaveClick}>
            Save
          </button>
        )}
      </div>
      
      <div className="profile-details">
        <div className="profile-section">
          <h4 className="section-title">Fitness Level</h4>
          <div className="section-content">
            {isEditing ? (
              <select 
                value={profile.fitnessLevel}
                onChange={(e) => setProfile({...profile, fitnessLevel: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            ) : (
              <span className="fitness-level">{profile.fitnessLevel}</span>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h4 className="section-title">Fitness Goals</h4>
          <div className="section-content tag-list">
            {profile.fitnessGoals.map((goal, index) => (
              <span key={index} className="tag">{goal}</span>
            ))}
          </div>
        </div>
        
        <div className="profile-section">
          <h4 className="section-title">Preferred Workouts</h4>
          <div className="section-content tag-list">
            {profile.preferredWorkoutTypes.map((type, index) => (
              <span key={index} className="tag">{type}</span>
            ))}
          </div>
        </div>
        
        <div className="profile-section">
          <h4 className="section-title">Available Equipment</h4>
          <div className="section-content tag-list">
            {profile.availableEquipment.map((equipment, index) => (
              <span key={index} className="tag">{equipment}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 