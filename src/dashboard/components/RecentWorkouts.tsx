import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

interface Workout {
  id: number;
  title: string;
  date: string;
  duration: string;
  type: string;
  completed: boolean;
}

/**
 * Displays recent workouts in the dashboard
 * 
 * @returns {JSX.Element} The rendered RecentWorkouts component
 */
const RecentWorkouts: React.FC = () => {
  const { state } = useDashboard();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      setIsLoading(true);
      try {
        // API call would go here
        // const response = await fetch('/wp-json/my-wg/v1/workouts?limit=5', ...);
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setWorkouts([
            {
              id: 1,
              title: 'Full Body HIIT',
              date: '2023-05-10',
              duration: '30 min',
              type: 'HIIT',
              completed: true
            },
            {
              id: 2,
              title: 'Upper Body Strength',
              date: '2023-05-08',
              duration: '45 min',
              type: 'Strength',
              completed: false
            },
            {
              id: 3,
              title: 'Leg Day Challenge',
              date: '2023-05-05',
              duration: '40 min',
              type: 'Strength',
              completed: true
            },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching recent workouts:', error);
        setIsLoading(false);
      }
    };
    
    fetchRecentWorkouts();
  }, [state.lastRefresh]);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  if (isLoading) {
    return <div className="recent-workouts-loading">Loading recent workouts...</div>;
  }
  
  if (workouts.length === 0) {
    return (
      <div className="no-workouts">
        <p>No workouts found. Create your first workout to get started!</p>
      </div>
    );
  }
  
  return (
    <div className="recent-workouts-list">
      {workouts.map(workout => (
        <div key={workout.id} className="workout-item">
          <div className="workout-header">
            <h3 className="workout-title">{workout.title}</h3>
            <span className={`workout-status ${workout.completed ? 'completed' : 'pending'}`}>
              {workout.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
          
          <div className="workout-details">
            <div className="workout-detail">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formatDate(workout.date)}</span>
            </div>
            
            <div className="workout-detail">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{workout.duration}</span>
            </div>
            
            <div className="workout-detail">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{workout.type}</span>
            </div>
          </div>
          
          <div className="workout-actions">
            <button className="view-button">View Details</button>
            {!workout.completed && (
              <button className="complete-button">Mark Complete</button>
            )}
          </div>
        </div>
      ))}
      
      <div className="view-all-link">
        <a href="#">View All Workouts</a>
      </div>
    </div>
  );
};

export default RecentWorkouts; 