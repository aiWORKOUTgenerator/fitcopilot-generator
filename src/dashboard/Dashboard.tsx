import React from 'react';
import { Card } from '../components/ui/Card';
import './styles/Dashboard.scss';
import { DashboardProvider } from './context/DashboardContext';
import UserProfile from './components/UserProfile';
import ApiUsage from './components/ApiUsage';
import RecentWorkouts from './components/RecentWorkouts';

/**
 * Main Dashboard container component for the FitCopilot plugin
 * Implements a responsive layout with 40/60 split on desktop
 * 
 * @returns {JSX.Element} The rendered Dashboard component
 */
const Dashboard: React.FC = () => {
  return (
    <DashboardProvider>
      <div className="fitcopilot-dashboard">
        <header className="dashboard-header">
          <h1 className="dashboard-title">FitCopilot Dashboard</h1>
          <div className="dashboard-actions">
            <button className="refresh-button">Refresh Data</button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Left Column (40% on desktop) */}
          <div className="dashboard-sidebar">
            <Card className="profile-card">
              <h2 className="card-title">User Profile</h2>
              <div className="profile-content">
                <UserProfile />
              </div>
            </Card>
            
            <Card className="api-usage-card">
              <h2 className="card-title">API Usage</h2>
              <div className="api-usage-content">
                <ApiUsage />
              </div>
            </Card>
          </div>

          {/* Right Column (60% on desktop) */}
          <div className="dashboard-main">
            <Card className="workout-generator-card">
              <h2 className="card-title">Create New Workout</h2>
              <div className="workout-generator-content">
                <p>Workout generator will be loaded here from the workout-generator feature.</p>
                <button className="create-workout-button">Create Workout</button>
              </div>
            </Card>
            
            <Card className="recent-workouts-card">
              <h2 className="card-title">Recent Workouts</h2>
              <div className="recent-workouts-content">
                <RecentWorkouts />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default Dashboard; 