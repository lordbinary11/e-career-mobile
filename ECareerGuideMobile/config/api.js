// API Configuration
const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://172.20.10.3:8080/api',
    timeout: 10000,
  },
  
  // Production (update with your actual production URL)
  production: {
    baseURL: 'http://172.20.10.3:8080/api',
    timeout: 15000,
  },
  
  // Staging (if needed)
  staging: {
    baseURL: 'https://your-staging-domain.com/backend/api',
    timeout: 12000,
  },
};

// Get current environment
const getEnvironment = () => {
  // You can set this via environment variables or build configuration
  // For now, defaulting to development
  return process.env.NODE_ENV || 'development';
};

// Get current API config
export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env] || API_CONFIG.development;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login.php',
  REGISTER: '/register.php',
  
  // User Profile
  PROFILE: '/profile.php',
  
  // Counselors
  GET_COUNSELORS: '/get_counselors.php',
  GET_COUNSELOR: '/get_counselor.php',
  GET_COUNSELOR_PROFILE: '/counselor_profile.php',
  GET_COUNSELOR_MEETINGS: '/get_counselor_meetings.php',
  MEETING_ACTIONS: '/meeting_actions.php',
  
  // Meetings
  SCHEDULE_MEETING: '/schedule_meeting.php',
  GET_MEETING_DETAILS: '/get_meeting_details.php',
  GET_MEETING_TOKEN: '/get_meeting_token.php',
  RENEW_MEETING_TOKEN: '/renew_meeting_token.php',
  
  // Messaging
  SEND_MESSAGE: '/send_message.php',
  SEND_COUNSELOR_MESSAGE: '/send_counselor_message.php',
  SEND_REPLY: '/send_reply.php',
  GET_MESSAGES: '/get_messages.php',
  GET_UNREAD_COUNT: '/get_unread_count.php',
  
  // AI
  ASK_AI: '/ask-ai.php',
  AI_INSIGHTS: '/ai_insights.php',
  
  // Resume & Skills
  RESUME: '/resume.php',
  SKILLS: '/skills.php',
  INTERESTS: '/interests.php',
  EDUCATION: '/education.php',
  EXPERIENCE: '/experience.php',
  
  // Learning Journey
  LEARNING_JOURNEY: '/learning_journey.php',
  STUDENT_ACTIVITY: '/student_activity.php',
  
  // Document Optimization
  OPTIMIZE_DOCUMENT: '/optimize_document.php',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Default Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export default {
  getApiConfig,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  HTTP_STATUS,
  DEFAULT_HEADERS,
}; 