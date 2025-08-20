import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native';
import { profileAPI } from '../../services/api';
import { getUserData, clearAllAuthData } from '../../services/storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme';
import LogoutModal from '../../components/LogoutModal';

export default function DashboardUser() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({ counselors: 0, meetings: 0, achievements: 0 });
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getUserData();
        setUserProfile(user);
        // Set default stats since student activity API is removed
        setStats({
          counselors: 0,
          meetings: 0,
          achievements: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await clearAllAuthData();
    router.replace('/login');
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{userProfile?.full_name || userProfile?.name || userProfile?.email}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
              <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
              <Ionicons name="log-out-outline" size={28} color="#e53e3e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.counselors}</Text>
            <Text style={styles.statLabel}>Counselors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.meetings}</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/ai-chat')}>
              <View style={styles.actionIcon}><Ionicons name="chatbubbles-outline" size={28} color={COLORS.primary} /></View>
              <Text style={styles.actionTitle}>AI Chat</Text>
              <Text style={styles.actionDescription}>Get instant career advice from AI.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/counselors')}>
              <View style={styles.actionIcon}><Ionicons name="people-outline" size={28} color={COLORS.primary} /></View>
              <Text style={styles.actionTitle}>Counselors</Text>
              <Text style={styles.actionDescription}>Connect with real career experts.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/resume-builder')}>
              <View style={styles.actionIcon}><Ionicons name="document-text-outline" size={28} color={COLORS.primary} /></View>
              <Text style={styles.actionTitle}>Resume Builder</Text>
              <Text style={styles.actionDescription}>Create and edit your resume.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/learning-journey')}>
              <View style={styles.actionIcon}><Ionicons name="trending-up-outline" size={28} color={COLORS.primary} /></View>
              <Text style={styles.actionTitle}>Learning Journey</Text>
              <Text style={styles.actionDescription}>Track your career progress.</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Navigation buttons for messages and schedule meeting */}
        {/* <TouchableOpacity style={{ backgroundColor: '#667eea', padding: 16, borderRadius: 10, marginBottom: 16, marginHorizontal: 20 }} onPress={() => router.push('/userMessages')}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#48bb78', padding: 16, borderRadius: 10, marginBottom: 16, marginHorizontal: 20 }} onPress={() => router.push('/scheduleMeeting')}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Schedule Meeting</Text>
        </TouchableOpacity> */}

        {/* Add more sections or activities as needed */}
        <View style={styles.bottomSpacing} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#4a5568',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileButton: {
    padding: 4,
  },
  logoutButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#4a5568',
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 100,
  },
}); 