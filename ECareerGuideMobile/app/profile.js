import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from './theme';
import { profileAPI } from '../services/api';
import { studentActivityAPI } from '../services/api';
import { useEffect } from 'react';
import { getUserRole, getUserData, clearAllAuthData } from '../services/storage';
import axios from 'axios'; // Added axios import
import ProfileUser from './(tabs)/profileUser';
import ProfileCounselor from './profileCounselor';

export default function Profile() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ counselors: 0, meetings: 0, achievements: 0 });
  const [isCounselor, setIsCounselor] = useState(false);
  const [counselorProfile, setCounselorProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '', specialization: '', experience: '', availability: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    getUserRole().then(setRole);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const role = await getUserRole();
        setIsCounselor(role === 'counselor');
        if (role === 'counselor') {
          const user = await getUserData();
          // Fetch counselor profile from backend (use profileAPI or direct API call)
          const res = await axios.get(`${profileAPI.baseURL}/counselor_profile.php`);
          if (res.data.success) {
            setCounselorProfile(res.data.counselor);
            setForm({
              name: res.data.counselor.name,
              email: res.data.counselor.email,
              phone: res.data.counselor.phone,
              bio: res.data.counselor.bio,
              specialization: res.data.counselor.specialization,
              experience: res.data.counselor.experience,
              availability: res.data.counselor.availability,
            });
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    const fetchStats = async () => {
      try {
        const activityResponse = await studentActivityAPI.getStudentActivity();
        if (activityResponse.success) {
          setStats({
            counselors: activityResponse.counselors_count || 0,
            meetings: activityResponse.meetings_count || 0,
            achievements: activityResponse.achievements_count || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };
    fetchProfile();
    fetchStats();
  }, []);

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        {
          icon: 'person-outline',
          label: 'Full Name',
          value: userProfile?.full_name,
          action: 'edit',
        },
        {
          icon: 'mail-outline',
          label: 'Email',
          value: userProfile?.email,
          action: 'edit',
        },
        {
          icon: 'call-outline',
          label: 'Phone',
          value: userProfile?.phone,
          action: 'edit',
        },
        {
          icon: 'location-outline',
          label: 'Location',
          value: userProfile?.location,
          action: 'edit',
        },
      ],
    },
    {
      title: 'Account Settings',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          value: notificationsEnabled ? 'On' : 'Off',
          action: 'toggle',
          toggleValue: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'mail-outline',
          label: 'Email Notifications',
          value: emailNotifications ? 'On' : 'Off',
          action: 'toggle',
          toggleValue: emailNotifications,
          onToggle: setEmailNotifications,
        },
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          value: '',
          action: 'navigate',
          route: '/change-password',
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Settings',
          value: '',
          action: 'navigate',
          route: '/privacy-settings',
        },
      ],
    },
    {
      title: 'Career Tools',
      items: [
        {
          icon: 'document-text-outline',
          label: 'My Resume',
          value: 'View & Edit',
          action: 'navigate',
          route: '/resume-builder',
        },
        {
          icon: 'trending-up-outline',
          label: 'Learning Journey',
          value: 'Track Progress',
          action: 'navigate',
          route: '/learning-journey',
        },
        {
          icon: 'calendar-outline',
          label: 'Meeting History',
          value: 'View All',
          action: 'navigate',
          route: '/meeting-history',
        },
        {
          icon: 'chatbubble-outline',
          label: 'Message History',
          value: 'View All',
          action: 'navigate',
          route: '/message-history',
        },
      ],
    },
  ];

  const handleAction = (item) => {
    switch (item.action) {
      case 'edit':
        Alert.alert('Edit Profile', `Edit ${item.label} functionality coming soon!`);
        break;
      case 'navigate':
        if (item.route) {
          router.push(item.route);
        }
        break;
      case 'toggle':
        // Toggle is handled by the Switch component
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await clearAllAuthData();
    router.replace('/login');
  };

  const renderProfileItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.profileItem}
      onPress={() => handleAction(item)}
      disabled={item.action === 'toggle'}
    >
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          <Ionicons name={item.icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        {item.action === 'toggle' ? (
          <Switch
            value={item.toggleValue}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e2e8f0', true: COLORS.primary }}
            thumbColor="#fff"
          />
        ) : item.action === 'navigate' || item.action === 'edit' ? (
          <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  // Replace all userProfile usages with the fetched userProfile
  // Show loading indicator if isLoading
  if (!role) return null;
  if (role === 'counselor') return <ProfileCounselor />;
  return <ProfileUser />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  editButton: {
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a202c',
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 14,
    color: '#4a5568',
  },
  itemRight: {
    alignItems: 'center',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e53e3e',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#a0aec0',
  },
}); 