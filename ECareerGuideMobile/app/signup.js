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
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import COLORS from './theme';
import AvailabilityPicker from './AvailabilityPicker';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // 'user' or 'counselor'
    // Additional fields for counselors
    phone: '',
    specialization: '',
    experience: '',
    availability: [], // Now an array of {day, start, end}
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [specializationModalVisible, setSpecializationModalVisible] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Additional validation for counselors
    if (formData.role === 'counselor') {
      if (!formData.phone || !formData.specialization || !formData.experience) {
        Alert.alert('Error', 'Please fill in all counselor fields (phone, specialization, experience, availability)');
        return false;
      }
      if (isNaN(formData.experience) || Number(formData.experience) < 0) {
        Alert.alert('Error', 'Experience must be a non-negative number');
        return false;
      }
      if (!formData.availability || formData.availability.length === 0) {
        Alert.alert('Error', 'Please select at least one availability slot');
        return false;
      }
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Prepare data for backend
      const signupData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add name field based on role
      if (formData.role === 'user') {
        signupData.full_name = `${formData.firstName} ${formData.lastName}`;
      } else if (formData.role === 'counselor') {
        signupData.name = `${formData.firstName} ${formData.lastName}`;
        signupData.phone = formData.phone;
        signupData.specialization = formData.specialization;
        signupData.experience = parseInt(formData.experience);
        signupData.availability = formData.availability; // Send as array
      }

      const response = await authAPI.register(signupData);
      
      if (response.success) {
        Alert.alert(
          'Success',
          response.message,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Show the full error object for debugging
      Alert.alert('Signup Error', JSON.stringify(error, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const SPECIALIZATIONS = [
    'Technology',
    'Healthcare',
    'Business',
    'Education',
    'Arts',
    'Engineering',
    'Law',
    'Finance',
    'Science',
    'Other',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo and Welcome Text */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add-outline" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.welcomeText}>Join ECareerGuide and start your career journey</Text>
          </View>

          {/* Signup Form */}
          <View style={styles.formContainer}>
            {/* Name Fields */}
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Ionicons name="person-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor="#a0aec0"
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Ionicons name="person-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor="#a0aec0"
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#a0aec0"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Fields */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a0aec0"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#a0aec0"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#a0aec0"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#a0aec0"
                />
              </TouchableOpacity>
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'user' && styles.roleButtonActive
                  ]}
                  onPress={() => updateFormData('role', 'user')}
                >
                  <Ionicons 
                    name="school-outline" 
                    size={20} 
                    color={formData.role === 'user' ? '#fff' : COLORS.primary} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'user' && styles.roleButtonTextActive
                  ]}>
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'counselor' && styles.roleButtonActive
                  ]}
                  onPress={() => updateFormData('role', 'counselor')}
                >
                  <Ionicons 
                    name="people-outline" 
                    size={20} 
                    color={formData.role === 'counselor' ? '#fff' : COLORS.primary} 
                  />
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'counselor' && styles.roleButtonTextActive
                  ]}>
                    Counselor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Counselor Specific Fields */}
            {formData.role === 'counselor' && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor="#a0aec0"
                    value={formData.phone}
                    onChangeText={(value) => updateFormData('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>
                {/* Custom Specialization Picker */}
                <TouchableOpacity
                  style={[styles.inputContainer, { paddingVertical: 0 }]}
                  onPress={() => setSpecializationModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="briefcase-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
                  <Text
                    style={[
                      styles.input,
                      { color: formData.specialization ? '#1a202c' : '#a0aec0', paddingVertical: 16 }
                    ]}
                  >
                    {formData.specialization || 'Select specialization...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#a0aec0" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
                <Modal
                  visible={specializationModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setSpecializationModalVisible(false)}
                >
                  <TouchableWithoutFeedback onPress={() => setSpecializationModalVisible(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '80%', maxHeight: 350, paddingVertical: 12 }}>
                        <FlatList
                          data={SPECIALIZATIONS}
                          keyExtractor={(item) => item}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={{ paddingVertical: 16, paddingHorizontal: 24 }}
                              onPress={() => {
                                updateFormData('specialization', item);
                                setSpecializationModalVisible(false);
                              }}
                            >
                              <Text style={{ fontSize: 16, color: '#1a202c' }}>{item}</Text>
                            </TouchableOpacity>
                          )}
                          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#f1f1f1' }} />}
                          showsVerticalScrollIndicator={false}
                        />
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
                <View style={styles.inputContainer}>
                  <Ionicons name="time-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Experience (years)"
                    placeholderTextColor="#a0aec0"
                    value={formData.experience}
                    onChangeText={(value) => updateFormData('experience', value)}
                    keyboardType="numeric"
                  />
                </View>
                <AvailabilityPicker onChange={(slots) => setFormData(prev => ({ ...prev, availability: slots }))} />
              </>
            )}

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.signupButtonText}>Creating account...</Text>
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
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

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
    marginVertical: 30,
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
  formContainer: {
    marginBottom: 30,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  halfWidth: {
    flex: 1,
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
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a202c',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    gap: 8,
  },
  googleButtonText: {
    color: '#1a202c',
    fontSize: 16,
    fontWeight: '500',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: {
    color: '#4a5568',
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
}); 