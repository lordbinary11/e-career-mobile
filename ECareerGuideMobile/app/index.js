import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAuthenticated, getUserRole } from '../services/storage';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: 'bulb-outline',
    title: 'Expert Guidance',
    description: 'Connect with experienced career counselors tailored to your needs.',
  },
  {
    icon: 'trending-up-outline',
    title: 'Personalized Paths',
    description: 'Receive customized advice and resources for your unique career goals.',
  },
  {
    icon: 'rocket-outline',
    title: 'Achieve Your Dreams',
    description: 'Gain the confidence and tools to land your dream job and grow professionally.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding has been seen
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (seen) {
        // If seen, check if authenticated
        if (await isAuthenticated()) {
          const role = await getUserRole();
          if (role === 'counselor') {
            router.replace('/dashboardCounselor');
          } else {
            router.replace('/dashboardUser');
          }
        } else {
          router.replace('/login');
        }
      } else {
        setShowOnboarding(true);
      }
      setLoading(false);
    };
    checkOnboarding();
  }, []);

  const goNext = () => setStep((prev) => Math.min(prev + 1, 2));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    if (await isAuthenticated()) {
      const role = await getUserRole();
      if (role === 'counselor') {
        router.replace('/dashboardCounselor');
      } else {
        router.replace('/dashboardUser');
      }
    } else {
      router.replace('/login');
    }
  };

  // For testing: Reset onboarding
  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    setShowOnboarding(true);
    setStep(0);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!showOnboarding) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        {/* Step 1: Welcome */}
        {step === 0 && (
          <>
            <Ionicons name="school-outline" size={80} color={COLORS.primary} style={{ marginBottom: 24 }} />
            <Text style={styles.logo}>ECareerGuide</Text>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.welcomeSubtitle}>
              Unlock your career potential with personalized guidance and expert support.
            </Text>
          </>
        )}
        {/* Step 2: Features */}
        {step === 1 && (
          <>
            <Text style={styles.featuresTitle}>Why ECareerGuide?</Text>
            {features.map((feature, idx) => (
              <View key={idx} style={styles.featureCard}>
                <Ionicons name={feature.icon} size={32} color={COLORS.primary} style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}
        {/* Step 3: Call to Action */}
        {step === 2 && (
          <>
            <Ionicons name="rocket-outline" size={80} color={COLORS.primary} style={{ marginBottom: 24 }} />
            <Text style={styles.ctaTitle}>Ready to get started?</Text>
            <Text style={styles.ctaSubtitle}>Join ECareerGuide and take the next step in your career journey.</Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={finishOnboarding}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
            
          </>
        )}
      </View>
      {/* Navigation Dots and Buttons */}
      <View style={styles.bottomNav}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, step === i && styles.activeDot]}
            />
          ))}
        </View>
        <View style={styles.navButtons}>
          {step > 0 ? (
            <TouchableOpacity onPress={goBack} style={styles.navButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
          {step < 2 ? (
            <TouchableOpacity onPress={goNext} style={styles.navButton}>
              <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 10,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#4a5568',
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 24,
  },
  getStartedButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  getStartedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
  },
}); 