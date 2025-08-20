import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserData, clearAllAuthData } from '../../services/storage';
import COLORS from '../theme';
import LogoutModal from '../../components/LogoutModal';

export default function ProfileUser() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getUserData();
        setUserProfile(user);
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
          value: 'On', // Placeholder, actual value would come from state
          action: 'toggle',
          toggleValue: true, // Placeholder
          onToggle: () => Alert.alert('Toggle', 'Push Notifications toggle coming soon!'),
        },
        {
          icon: 'mail-outline',
          label: 'Email Notifications',
          value: 'On', // Placeholder, actual value would come from state
          action: 'toggle',
          toggleValue: true, // Placeholder
          onToggle: () => Alert.alert('Toggle', 'Email Notifications toggle coming soon!'),
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Profile not found.</Text>
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
            <Text style={styles.avatar}>{userProfile?.full_name?.charAt(0)}</Text>
          </View>
          <Text style={styles.profileName}>{userProfile?.full_name}</Text>
          <Text style={styles.profileRole}>{userProfile?.role}</Text>
          <Text style={styles.profileBio}>{userProfile?.bio}</Text>
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
      <LogoutModal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
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