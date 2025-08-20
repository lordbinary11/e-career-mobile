import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { setAuthToken, setUserData, setUserRole, getAuthToken, setRememberMe, getRememberMe, isAuthenticated } from '../services/storage';
import COLORS from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAs, setLoginAs] = useState('user'); // 'user' or 'counselor'
  const [rememberMe, setRememberMeState] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // On mount, check if user is already authenticated and wants to be remembered
  React.useEffect(() => {
    const checkAuth = async () => {
      const [authed, remember] = await Promise.all([
        isAuthenticated(),
        getRememberMe()
      ]);
      if (authed && remember) {
        // Optionally, you can fetch user role and redirect accordingly
        // For now, just go to dashboard (can be improved)
        router.replace('/dashboard');
      }
      setRememberMeState(remember);
    };
    checkAuth();
  }, []);


  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    setShowOnboarding(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authAPI.login(email, password, loginAs);
      
      if (response.success) {
        // Store authentication data
        await setAuthToken(response.token);
        await setUserRole(response.role);
        await setRememberMe(rememberMe); // Store rememberMe flag
        // Store user data based on role
        if (response.role === 'user' && response.user) {
          await setUserData(response.user);
        } else if (response.role === 'counselor' && response.counselor) {
          await setUserData(response.counselor);
        }
        Alert.alert('Success', response.message, [
          {
            text: 'OK',
            onPress: () => {
              if (response.role === 'user') {
                router.replace('/dashboardUser');
              } else {
                router.replace('/dashboardCounselor');
              }
            },
          },
        ]);
      } else {
        // Log the full response for debugging
        Alert.alert('Login Failed', JSON.stringify(response, null, 2));
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 401 || error.response?.data?.message?.toLowerCase().includes('invalid')) {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo and Welcome Text */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="school-outline" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.welcomeText}>Sign in to continue your career journey</Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSelection}>
            <Text style={styles.roleLabel}>Login as:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  loginAs === 'user' && styles.roleButtonActive
                ]}
                onPress={() => setLoginAs('user')}
              >
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={loginAs === 'user' ? '#fff' : COLORS.primary} 
                />
                <Text style={[
                  styles.roleButtonText,
                  loginAs === 'user' && styles.roleButtonTextActive
                ]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  loginAs === 'counselor' && styles.roleButtonActive
                ]}
                onPress={() => setLoginAs('counselor')}
              >
                <Ionicons 
                  name="people-outline" 
                  size={20} 
                  color={loginAs === 'counselor' ? '#fff' : COLORS.primary} 
                />
                <Text style={[
                  styles.roleButtonText,
                  loginAs === 'counselor' && styles.roleButtonTextActive
                ]}>
                  Counselor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#a0aec0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a0aec0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#a0aec0"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setRememberMeState((prev) => !prev)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                  backgroundColor: rememberMe ? COLORS.primary : '#fff',
                }}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={{ color: '#1a202c', fontSize: 15 }}>Remember Me</Text>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>Signing in...</Text>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
             
             {/* signup with google
            <TouchableOpacity style={styles.googleButton}>
              <Ionicons name="logo-google" size={20} color="#ea4335" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>*/}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Reset Onboarding for testing*/} 
      <TouchableOpacity onPress={resetOnboarding} style={{ alignSelf: 'center', marginTop: 12 }}>
        <Text style={{ color: COLORS.primary, textDecorationLine: 'underline', fontSize: 13 }}>Reset Onboarding (for testing)</Text>
      </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
  },
  placeholder: {
    width: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#f7fafc',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
  roleSelection: {
    marginBottom: 30,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 15,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a202c',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#a0aec0',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  googleButtonText: {
    color: '#1a202c',
    fontSize: 16,
    fontWeight: '500',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: '#4a5568',
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
}); 