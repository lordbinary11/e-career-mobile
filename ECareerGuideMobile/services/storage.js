import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_ROLE: 'userRole',
  REMEMBER_ME: 'rememberMe',
};

// Token management
export const setAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

// User data management
export const setUserData = async (userData) => {
  try {
    if (userData) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// User role management
export const setUserRole = async (role) => {
  try {
    if (role) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    }
  } catch (error) {
    console.error('Error saving user role:', error);
  }
};

export const getUserRole = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const clearUserRole = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  } catch (error) {
    console.error('Error clearing user role:', error);
  }
};

// Remember me functionality
export const setRememberMe = async (remember) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(remember));
  } catch (error) {
    console.error('Error saving remember me:', error);
  }
};

export const getRememberMe = async () => {
  try {
    const remember = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return remember ? JSON.parse(remember) : false;
  } catch (error) {
    console.error('Error getting remember me:', error);
    return false;
  }
};

// Clear all auth data
export const clearAllAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USER_ROLE,
    ]);
  } catch (error) {
    console.error('Error clearing all auth data:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Get stored credentials for auto-login
export const getStoredCredentials = async () => {
  try {
    const [userData, rememberMe] = await Promise.all([
      getUserData(),
      getRememberMe(),
    ]);
    
    return {
      userData,
      rememberMe,
    };
  } catch (error) {
    console.error('Error getting stored credentials:', error);
    return {
      userData: null,
      rememberMe: false,
    };
  }
};

export default {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  setUserData,
  getUserData,
  clearUserData,
  setUserRole,
  getUserRole,
  clearUserRole,
  setRememberMe,
  getRememberMe,
  clearAllAuthData,
  isAuthenticated,
  getStoredCredentials,
}; 