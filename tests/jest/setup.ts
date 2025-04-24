// Add any global Jest setup code here
import '@testing-library/jest-dom';

// Mock window.fitcopilotData
(global as any).fitcopilotData = {
  apiBase: '/wp-json/fitcopilot/v1',
  nonce: 'mock-nonce',
  isLoggedIn: true,
}; 