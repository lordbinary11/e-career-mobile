import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserData, clearAllAuthData } from '../services/storage';
import COLORS from './theme';
import LogoutModal from '../components/LogoutModal';

export default function ProfileCounselor() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    specialization: '',
    experience: '',
    availability: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getUserData();
        setUserProfile(user);
        if (user) {
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            specialization: user.specialization || '',
            experience: user.experience || '',
            availability: user.availability || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await clearAllAuthData();
    router.replace('/login');
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        {
          icon: 'person-outline',
          label: 'Name',
          value: userProfile?.name,
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
          value: userProfile?.phone || 'Not provided',
          action: 'edit',
        },
        {
          icon: 'briefcase-outline',
          label: 'Specialization',
          value: userProfile?.specialization,
          action: 'edit',
        },
      ],
    },
    {
      title: 'Professional Details',
      items: [
        {
          icon: 'time-outline',
          label: 'Experience',
          value: userProfile?.experience_years ? `${userProfile.experience_years} years` : 'Not specified',
          action: 'edit',
        },
        {
          icon: 'calendar-outline',
          label: 'Availability',
          value: userProfile?.availability || 'Not specified',
          action: 'edit',
        },
        {
          icon: 'star-outline',
          label: 'Rating',
          value: userProfile?.rating ? `${userProfile.rating}/5.0` : 'No ratings yet',
          action: 'view',
        },
      ],
    },
    {
      title: 'Account Settings',
      items: [
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
        {
          icon: 'notifications-outline',
          label: 'Notification Preferences',
          value: '',
          action: 'navigate',
          route: '/notification-settings',
        },
      ],
    },
    {
      title: 'Professional Tools',
      items: [
        {
          icon: 'calendar-outline',
          label: 'Meeting Schedule',
          value: 'View & Manage',
          action: 'navigate',
          route: '/counselor-meetings',
        },
        {
          icon: 'chatbubbles-outline',
          label: 'Messages',
          value: 'View All',
          action: 'navigate',
          route: '/counselor-messages',
        },
        {
          icon: 'people-outline',
          label: 'Student Management',
          value: 'View Students',
          action: 'navigate',
          route: '/student-management',
        },
        {
          icon: 'analytics-outline',
          label: 'Performance Analytics',
          value: 'View Stats',
          action: 'navigate',
          route: '/analytics',
        },
      ],
    },
  ];

  const handleAction = (item) => {
    switch (item.action) {
      case 'edit':
        Alert.alert('Edit Profile', `Edit ${item.label} functionality coming soon!`);
        break;
      case 'view':
        Alert.alert('View Details', `View ${item.label} details coming soon!`);
        break;
      case 'navigate':
        if (item.route) {
          router.push(item.route);
        }
        break;
      default:
        break;
    }
  };

  const renderProfileItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.profileItem}
      onPress={() => handleAction(item)}
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
        {(item.action === 'navigate' || item.action === 'edit' || item.action === 'view') && (
          <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading counselor profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Counselor profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{userProfile?.name?.charAt(0) || 'C'}</Text>
          </View>
          <Text style={styles.profileName}>{userProfile?.name}</Text>
          <Text style={styles.profileRole}>Career Counselor</Text>
          <Text style={styles.profileBio}>{userProfile?.bio || 'Professional career counselor dedicated to helping students achieve their career goals.'}</Text>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => renderProfileItem(item, itemIndex))}
            </View>
          </View>
        ))}

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
            <Ionicons name="log-out-outline" size={20} color="#e53e3e" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ECareerGuide v1.0.0</Text>
        </View>
      </ScrollView>
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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