import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { counselorsAPI } from '../services/api';
import { useRouter } from 'expo-router';
import { getUserData, clearAllAuthData } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';
import COLORS from './theme';
import LogoutModal from '../components/LogoutModal';

export default function DashboardCounselor() {
  const router = useRouter();
  const [stats, setStats] = useState({
    upcomingMeetings: 0,
    totalMessages: 0,
    studentRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch counselor meetings
        const meetingsRes = await counselorsAPI.getCounselorMeetings();
        console.log('Meetings response:', meetingsRes);
        
        if (meetingsRes.success && Array.isArray(meetingsRes.meetings)) {
          console.log('All meetings:', meetingsRes.meetings);
          
          const upcomingMeetings = meetingsRes.meetings.filter(meeting => {
            const meetingDate = new Date(meeting.schedule_date + ' ' + meeting.schedule_time);
            const now = new Date();
            
            console.log('Meeting:', meeting);
            console.log('Meeting date:', meetingDate);
            console.log('Current date:', now);
            console.log('Is future:', meetingDate > now);
            console.log('Status:', meeting.status);
            
            // If status is not available, assume it's scheduled (for backward compatibility)
            const status = meeting.status || 'scheduled';
            return meetingDate > now && status === 'scheduled';
          });
          
          console.log('Upcoming meetings:', upcomingMeetings);
          setStats(prev => ({ ...prev, upcomingMeetings: upcomingMeetings.length }));
        }

        // TODO: Add endpoints for messages count and student requests
        // For now, set default values
        setStats(prev => ({ 
          ...prev, 
          totalMessages: 0,
          studentRequests: 0
        }));

      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load counselor dashboard data');
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 16, color: '#4a5568' }}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f7fafc' }}>
        <Text style={{ color: '#e53e3e', textAlign: 'center', marginBottom: 16 }}>Error: {error}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#667eea', padding: 12, borderRadius: 8 }}
          onPress={() => window.location.reload()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7fafc' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Counselor Dashboard</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <Ionicons name="log-out-outline" size={20} color="#e53e3e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#667eea" />
            </View>
            <Text style={styles.statNumber}>{stats.upcomingMeetings}</Text>
            <Text style={styles.statLabel}>Upcoming Meetings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="chatbubbles-outline" size={24} color="#48bb78" />
            </View>
            <Text style={styles.statNumber}>{stats.totalMessages}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people-outline" size={24} color="#ed8936" />
            </View>
            <Text style={styles.statNumber}>{stats.studentRequests}</Text>
            <Text style={styles.statLabel}>Student Requests</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/counselorMeetings')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar" size={28} color="#667eea" />
              </View>
              <Text style={styles.quickActionTitle}>Meetings</Text>
              <Text style={styles.quickActionSubtitle}>Manage scheduled meetings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/counselorMessages')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="chatbubbles" size={28} color="#48bb78" />
              </View>
              <Text style={styles.quickActionTitle}>Messages</Text>
              <Text style={styles.quickActionSubtitle}>View and reply to messages</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/student-requests')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="people" size={28} color="#ed8936" />
              </View>
              <Text style={styles.quickActionTitle}>Requests</Text>
              <Text style={styles.quickActionSubtitle}>Review student requests</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/profileCounselor')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person" size={28} color="#9f7aea" />
              </View>
              <Text style={styles.quickActionTitle}>Profile</Text>
              <Text style={styles.quickActionSubtitle}>Update your profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>No recent activity</Text>
            <Text style={styles.activitySubtext}>Your recent meetings and messages will appear here</Text>
          </View>
        </View>
      </ScrollView>
      <LogoutModal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  statLabel: {
    color: '#4a5568',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 16,
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
  },
  activitySubtext: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
  },
});