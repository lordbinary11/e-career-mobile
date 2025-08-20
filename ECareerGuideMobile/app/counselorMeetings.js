import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, Modal, TextInput } from 'react-native';
import { counselorsAPI } from '../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CounselorMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', or 'declined'
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [newDateTime, setNewDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await counselorsAPI.getCounselorMeetings();
      console.log('Meetings response:', response);
      
      if (response.success && Array.isArray(response.meetings)) {
        setMeetings(response.meetings);
      } else {
        setMeetings([]);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const filterMeetings = (type) => {
    const now = new Date();
    console.log('Filtering meetings for type:', type);
    console.log('Current time:', now);
    console.log('All meetings:', meetings);
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.schedule_date + ' ' + meeting.schedule_time);
      console.log('Meeting:', meeting);
      console.log('Meeting date:', meetingDate);
      console.log('Meeting status:', meeting.status);
      
      // If status is not available, assume it's scheduled (for backward compatibility)
      const status = meeting.status || 'scheduled';
      
      if (type === 'upcoming') {
        // Show scheduled, accepted, and rescheduled meetings that are in the future
        const isUpcoming = meetingDate > now && (status === 'scheduled' || status === 'accepted' || status === 'rescheduled');
        console.log('Is upcoming:', isUpcoming);
        return isUpcoming;
      } else if (type === 'past') {
        // Show completed, cancelled, and past meetings (but not declined or rescheduled)
        const isPast = (meetingDate <= now && status !== 'declined' && status !== 'rescheduled') || 
                      ['completed', 'cancelled'].includes(status);
        console.log('Is past:', isPast);
        return isPast;
      } else if (type === 'declined') {
        // Show declined meetings
        return status === 'declined';
      }
      return false;
    });
  };

  const handleMeetingAction = async (meeting, action) => {
    try {
      if (action === 'accept') {
        await counselorsAPI.acceptMeeting(meeting.id);
        Alert.alert('Success', 'Meeting accepted successfully!');
      } else if (action === 'reschedule') {
        setSelectedMeeting(meeting);
        setShowRescheduleModal(true);
        return; // Don't refresh yet, wait for reschedule completion
      } else if (action === 'cancel') {
        Alert.prompt(
          'Cancel Meeting',
          'Please provide a reason for cancellation (optional):',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Confirm',
              onPress: async (reason) => {
                await counselorsAPI.cancelMeeting(meeting.id, reason);
                Alert.alert('Success', 'Meeting cancelled successfully!');
                fetchMeetings();
              }
            }
          ],
          'plain-text',
          ''
        );
        return;
      } else if (action === 'decline') {
        Alert.prompt(
          'Decline Meeting',
          'Please provide a reason for declining (optional):',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Confirm',
              onPress: async (reason) => {
                await counselorsAPI.declineMeeting(meeting.id, reason);
                Alert.alert('Success', 'Meeting declined successfully!');
                fetchMeetings();
              }
            }
          ],
          'plain-text',
          ''
        );
        return;
      }
      
      fetchMeetings(); // Refresh the list
    } catch (err) {
      console.error('Meeting action error:', err);
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to perform action');
    }
  };

  const handleReschedule = async () => {
    if (!selectedMeeting) return;
    
    try {
      const pad = n => n < 10 ? '0' + n : n;
      const formattedDateTime = `${newDateTime.getFullYear()}-${pad(newDateTime.getMonth()+1)}-${pad(newDateTime.getDate())} ${pad(newDateTime.getHours())}:${pad(newDateTime.getMinutes())}:00`;
      
      await counselorsAPI.rescheduleMeeting(selectedMeeting.id, formattedDateTime, reason);
      Alert.alert('Success', 'Meeting rescheduled successfully!');
      setShowRescheduleModal(false);
      setSelectedMeeting(null);
      setReason('');
      fetchMeetings();
    } catch (err) {
      console.error('Reschedule error:', err);
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to reschedule meeting');
    }
  };

  const renderMeetingCard = ({ item: meeting }) => {
    const meetingDate = new Date(meeting.schedule_date + ' ' + meeting.schedule_time);
    const status = meeting.status || 'scheduled';
    const isUpcoming = meetingDate > new Date() && status === 'scheduled';
    const isPast = meetingDate <= new Date() || status !== 'scheduled';
    
    const getStatusColor = () => {
      switch (status) {
        case 'scheduled': return '#667eea';
        case 'accepted': return '#48bb78';
        case 'completed': return '#38a169';
        case 'cancelled': return '#e53e3e';
        case 'rescheduled': return '#ed8936';
        case 'declined': return '#9f7aea';
        default: return '#a0aec0';
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'scheduled': return 'Scheduled';
        case 'accepted': return 'Accepted';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        case 'rescheduled': return 'Rescheduled';
        case 'declined': return 'Declined';
        default: return 'Unknown';
      }
    };

    return (
      <View style={styles.meetingCard}>
        <View style={styles.meetingHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {meeting.student_name ? meeting.student_name.charAt(0).toUpperCase() : 'S'}
              </Text>
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{meeting.student_name || 'Unknown Student'}</Text>
              <Text style={styles.studentEmail}>{meeting.student_email}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <View style={styles.meetingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#4a5568" />
            <Text style={styles.detailText}>
              {dayjs(meeting.schedule_date).format('MMM DD, YYYY')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#4a5568" />
            <Text style={styles.detailText}>
              {dayjs(meeting.schedule_time, 'HH:mm:ss').format('hh:mm A')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="chatbubble-outline" size={16} color="#4a5568" />
            <Text style={styles.detailText} numberOfLines={2}>
              {meeting.purpose}
            </Text>
          </View>
          
          {/* Virtual Meeting Information */}
          {meeting.is_virtual_meet && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="videocam-outline" size={16} color="#667eea" />
                <Text style={[styles.detailText, { color: '#667eea', fontWeight: '600' }]}>
                  Virtual Meeting - {meeting.meeting_platform}
                </Text>
              </View>
              {meeting.meeting_link && (
                <TouchableOpacity 
                  style={styles.meetingLinkContainer}
                  onPress={() => {
                    // Open meeting link in browser or app
                    Alert.alert(
                      'Join Meeting',
                      `Would you like to join the ${meeting.meeting_platform} meeting?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Join Meeting', 
                          onPress: () => {
                            // TODO: Implement deep linking to meeting apps
                            Alert.alert('Info', 'Meeting link functionality will be implemented soon!');
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="link-outline" size={16} color="#667eea" />
                  <Text style={[styles.detailText, { color: '#667eea', textDecorationLine: 'underline' }]}>
                    Join Meeting
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Action Buttons - Show different buttons based on status */}
        {status === 'scheduled' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleMeetingAction(meeting, 'accept')}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={() => handleMeetingAction(meeting, 'reschedule')}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleMeetingAction(meeting, 'decline')}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {status === 'accepted' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={() => handleMeetingAction(meeting, 'reschedule')}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleMeetingAction(meeting, 'cancel')}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Show reschedule button for rescheduled meetings */}
        {status === 'rescheduled' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={() => handleMeetingAction(meeting, 'reschedule')}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Reschedule Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleMeetingAction(meeting, 'cancel')}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 16, color: '#4a5568' }}>Loading meetings...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f7fafc' }}>
        <Text style={{ color: '#e53e3e', textAlign: 'center', marginBottom: 16 }}>Error: {error}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#667eea', padding: 12, borderRadius: 8 }}
          onPress={fetchMeetings}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const upcomingMeetings = filterMeetings('upcoming');
  const pastMeetings = filterMeetings('past');
  const declinedMeetings = filterMeetings('declined');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7fafc' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a202c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meetings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming ({upcomingMeetings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past ({pastMeetings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'declined' && styles.activeTab]}
          onPress={() => setActiveTab('declined')}
        >
          <Text style={[styles.tabText, activeTab === 'declined' && styles.activeTabText]}>
            Declined ({declinedMeetings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Meetings List */}
      <FlatList
        data={
          activeTab === 'upcoming' ? upcomingMeetings : 
          activeTab === 'past' ? pastMeetings : 
          declinedMeetings
        }
        renderItem={renderMeetingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#a0aec0" />
            <Text style={styles.emptyTitle}>
              No {activeTab} meetings
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming' 
                ? 'You have no upcoming meetings scheduled'
                : activeTab === 'past'
                ? 'No past meetings found'
                : 'No declined meetings found'
              }
            </Text>
          </View>
        }
      />

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowRescheduleModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Meeting</Text>
            
            <Text style={styles.modalLabel}>New Date & Time</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)} 
              style={styles.datePickerBtn}
            >
              <Text style={{ color: '#1a202c' }}>{newDateTime.toLocaleString()}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={newDateTime}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setNewDateTime(selectedDate);
                }}
              />
            )}

            <Text style={styles.modalLabel}>Reason (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason for rescheduling..."
              placeholderTextColor="#a0aec0"
              value={reason}
              onChangeText={setReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setShowRescheduleModal(false);
                  setSelectedMeeting(null);
                  setReason('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleReschedule}
              >
                <Text style={styles.confirmModalButtonText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  meetingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#4a5568',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  meetingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  acceptButton: {
    backgroundColor: '#48bb78',
  },
  rescheduleButton: {
    backgroundColor: '#ed8936',
  },
  cancelButton: {
    backgroundColor: '#e53e3e',
  },
  declineButton: {
    backgroundColor: '#9f7aea',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  meetingLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f7fafc',
    color: '#1a202c',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#e2e8f0',
  },
  confirmModalButton: {
    backgroundColor: '#667eea',
  },
  cancelModalButtonText: {
    color: '#4a5568',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmModalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a5568',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
  },
}); 