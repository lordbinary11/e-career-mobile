import axios from 'axios';
import { setAuthToken, getAuthToken, clearAuthToken } from './storage';
import { getApiConfig, API_ENDPOINTS, ERROR_MESSAGES, HTTP_STATUS, DEFAULT_HEADERS } from '../config/api';

// Get API configuration
const apiConfig = getApiConfig();

// Create axios instance with default config
const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: DEFAULT_HEADERS,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug log
    console.log('Outgoing request:', config.url, config.headers.Authorization);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Token expired or invalid, redirect to login
      clearAuthToken();
      // You might want to trigger a navigation to login here
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: async (email, password, loginAs = 'user') => {
    const response = await api.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
      loginAs,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  logout: async () => {
    await clearAuthToken();
  },
};

// User Profile APIs
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.PROFILE);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put(API_ENDPOINTS.PROFILE, profileData);
    return response.data;
  },
};

// Counselors APIs
export const counselorsAPI = {
  getAllCounselors: async () => {
    const response = await api.get(API_ENDPOINTS.GET_COUNSELORS);
    return response.data;
  },

  getCounselor: async (counselorId) => {
    const response = await api.get(`${API_ENDPOINTS.GET_COUNSELOR}?id=${counselorId}`);
    return response.data;
  },

  getCounselorProfile: async () => {
    const response = await api.get(API_ENDPOINTS.GET_COUNSELOR_PROFILE);
    return response.data;
  },

  getCounselorMeetings: async () => {
    const response = await api.get(API_ENDPOINTS.GET_COUNSELOR_MEETINGS);
    return response.data;
  },

  // Meeting Actions for Counselors
  acceptMeeting: async (meetingId) => {
    const response = await api.post(API_ENDPOINTS.MEETING_ACTIONS, {
      meeting_id: meetingId,
      action: 'accept'
    });
    return response.data;
  },

  rescheduleMeeting: async (meetingId, newDatetime, reason = null) => {
    const response = await api.post(API_ENDPOINTS.MEETING_ACTIONS, {
      meeting_id: meetingId,
      action: 'reschedule',
      new_datetime: newDatetime,
      reason: reason
    });
    return response.data;
  },

  cancelMeeting: async (meetingId, reason = null) => {
    const response = await api.post(API_ENDPOINTS.MEETING_ACTIONS, {
      meeting_id: meetingId,
      action: 'cancel',
      reason: reason
    });
    return response.data;
  },

  declineMeeting: async (meetingId, reason = null) => {
    const response = await api.post(API_ENDPOINTS.MEETING_ACTIONS, {
      meeting_id: meetingId,
      action: 'decline',
      reason: reason
    });
    return response.data;
  },
};

// Meetings APIs
export const meetingsAPI = {
  scheduleMeeting: async (meetingData) => {
    const response = await api.post(API_ENDPOINTS.SCHEDULE_MEETING, meetingData);
    return response.data;
  },

  getMeetingDetails: async (meetingId) => {
    const response = await api.get(`${API_ENDPOINTS.GET_MEETING_DETAILS}?meeting_id=${meetingId}`);
    return response.data;
  },

  getMeetingToken: async (meetingId) => {
    const response = await api.get(`${API_ENDPOINTS.GET_MEETING_TOKEN}?meeting_id=${meetingId}`);
    return response.data;
  },

  renewMeetingToken: async (meetingId) => {
    const response = await api.post(API_ENDPOINTS.RENEW_MEETING_TOKEN, { meeting_id: meetingId });
    return response.data;
  },
};

// Messaging APIs
export const messagingAPI = {
  sendMessage: async (messageData) => {
    const response = await api.post(API_ENDPOINTS.SEND_MESSAGE, messageData);
    return response.data;
  },

  sendCounselorMessage: async (messageData) => {
    const response = await api.post(API_ENDPOINTS.SEND_COUNSELOR_MESSAGE, messageData);
    return response.data;
  },

  sendReply: async (replyData) => {
    const response = await api.post(API_ENDPOINTS.SEND_REPLY, replyData);
    return response.data;
  },

  getMessages: async (params) => {
    const response = await api.get(API_ENDPOINTS.GET_MESSAGES, { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get(API_ENDPOINTS.GET_UNREAD_COUNT);
    return response.data;
  },
};

// AI Chat APIs
export const aiAPI = {
  askAI: async (message) => {
    // Remove timeout for this request
    const response = await api.post(API_ENDPOINTS.ASK_AI, { message }, { timeout: 0 });
    return response.data;
  },

  getAIInsights: async (userId) => {
    const response = await api.get(`${API_ENDPOINTS.AI_INSIGHTS}?user_id=${userId}`);
    return response.data;
  },
};

// Resume and Skills APIs
export const resumeAPI = {
  getResume: async () => {
    const response = await api.get(API_ENDPOINTS.RESUME);
    return response.data;
  },

  updateResume: async (resumeData) => {
    const response = await api.put(API_ENDPOINTS.RESUME, resumeData);
    return response.data;
  },

  optimizeDocument: async (documentData) => {
    const response = await api.post(API_ENDPOINTS.OPTIMIZE_DOCUMENT, documentData);
    return response.data;
  },
};

export const skillsAPI = {
  getSkills: async () => {
    const response = await api.get(API_ENDPOINTS.SKILLS);
    return response.data;
  },

  updateSkills: async (skillsData) => {
    const response = await api.put(API_ENDPOINTS.SKILLS, skillsData);
    return response.data;
  },
};

export const interestsAPI = {
  getInterests: async () => {
    const response = await api.get(API_ENDPOINTS.INTERESTS);
    return response.data;
  },

  updateInterests: async (interestsData) => {
    const response = await api.put(API_ENDPOINTS.INTERESTS, interestsData);
    return response.data;
  },
};

export const educationAPI = {
  getEducation: async () => {
    const response = await api.get(API_ENDPOINTS.EDUCATION);
    return response.data;
  },

  updateEducation: async (educationData) => {
    const response = await api.put(API_ENDPOINTS.EDUCATION, educationData);
    return response.data;
  },
};

export const experienceAPI = {
  getExperience: async () => {
    const response = await api.get(API_ENDPOINTS.EXPERIENCE);
    return response.data;
  },

  updateExperience: async (experienceData) => {
    const response = await api.put(API_ENDPOINTS.EXPERIENCE, experienceData);
    return response.data;
  },
};

export const learningJourneyAPI = {
  getLearningJourney: async () => {
    const response = await api.get(API_ENDPOINTS.LEARNING_JOURNEY);
    return response.data;
  },

  updateLearningJourney: async (journeyData) => {
    const response = await api.put(API_ENDPOINTS.LEARNING_JOURNEY, journeyData);
    return response.data;
  },
};

export const studentActivityAPI = {
  getStudentActivity: async () => {
    const response = await api.get(API_ENDPOINTS.STUDENT_ACTIVITY);
    return response.data;
  },
};

export default api; 