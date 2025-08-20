import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, Alert, Modal, FlatList, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { counselorsAPI, meetingsAPI } from '../services/api';
import { getUserData } from '../services/storage';
import COLORS from './theme';

export default function ScheduleMeeting() {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [isVirtualMeeting, setIsVirtualMeeting] = useState(false);
  const [meetingPlatform, setMeetingPlatform] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [platformDropdownVisible, setPlatformDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const meetingPlatforms = [
    'Zoom',
    'Google Meet',
    'Microsoft Teams',
    'Skype',
    'Discord',
    'Other'
  ];

  useEffect(() => {
    const fetchCounselors = async () => {
      setLoading(true);
      setError(null);
      try {
        const counselorsRes = await counselorsAPI.getAllCounselors();
        if (counselorsRes.success) setCounselors(counselorsRes.counselors);
      } catch (err) {
        setError(err.message || 'Failed to load counselors');
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  const handleSchedule = async () => {
    if (!selectedCounselorId || !purpose.trim()) {
      Alert.alert('Error', 'Please select a counselor and enter a purpose.');
      return;
    }
    
    if (isVirtualMeeting && (!meetingPlatform || !meetingLink.trim())) {
      Alert.alert('Error', 'Please select a meeting platform and provide a meeting link for virtual meetings.');
      return;
    }
    
    try {
      const user = await getUserData();
      // Format date as 'YYYY-MM-DD HH:mm:ss'
      const pad = n => n < 10 ? '0' + n : n;
      const formattedDate = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
      
      await meetingsAPI.scheduleMeeting({
        counselor_id: selectedCounselorId,
        schedule_date: formattedDate,
        purpose,
        is_virtual_meet: isVirtualMeeting,
        meeting_platform: isVirtualMeeting ? meetingPlatform : null,
        meeting_link: isVirtualMeeting ? meetingLink : null,
      });
      
      Alert.alert('Meeting scheduled!');
      // Clear the form inputs
      setSelectedCounselorId(null);
      setDate(new Date());
      setPurpose('');
      setIsVirtualMeeting(false);
      setMeetingPlatform('');
      setMeetingLink('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to schedule meeting');
    }
  };

  const selectedCounselor = counselors.find(c => c.id === selectedCounselorId);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Schedule Meeting</Text>
          {/* Counselor selection - custom dropdown */}
          <Text style={styles.label}>Select Counselor</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: selectedCounselor ? COLORS.text : COLORS.muted }}>
              {selectedCounselor ? `${selectedCounselor.name} (${selectedCounselor.specialization})` : 'Choose a counselor...'}
            </Text>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 18 }}>▼</Text>
          </TouchableOpacity>
          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
              <View style={styles.modalContent}>
                <FlatList
                  data={counselors}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCounselorId(item.id);
                        setDropdownVisible(false);
                      }}
                    >
                      <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{item.name}</Text>
                      <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{item.specialization}</Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border }} />}
                  style={{ maxHeight: 300 }}
                />
              </View>
            </TouchableOpacity>
          </Modal>
          {/* Date/time picker */}
          <Text style={styles.label}>Date & Time</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
            <Text style={{ color: COLORS.text }}>{date.toLocaleString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
          {/* Purpose input */}
          <Text style={styles.label}>Purpose</Text>
          <TextInput
            style={styles.input}
            placeholder="Purpose of meeting"
            placeholderTextColor={COLORS.muted}
            value={purpose}
            onChangeText={setPurpose}
            multiline
          />
          
          {/* Virtual Meeting Toggle */}
          <View style={styles.virtualToggleContainer}>
            <Text style={styles.label}>Meeting Type</Text>
            <TouchableOpacity
              style={[styles.toggleButton, isVirtualMeeting && styles.toggleButtonActive]}
              onPress={() => setIsVirtualMeeting(!isVirtualMeeting)}
            >
              <Text style={[styles.toggleText, isVirtualMeeting && styles.toggleTextActive]}>
                {isVirtualMeeting ? 'Virtual Meeting' : 'In-Person Meeting'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Virtual Meeting Options */}
          {isVirtualMeeting && (
            <>
              {/* Platform Selection */}
              <Text style={styles.label}>Meeting Platform</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setPlatformDropdownVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={{ color: meetingPlatform ? COLORS.text : COLORS.muted }}>
                  {meetingPlatform || 'Choose a platform...'}
                </Text>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 18 }}>▼</Text>
              </TouchableOpacity>
              
              {/* Platform Dropdown Modal */}
              <Modal
                visible={platformDropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPlatformDropdownVisible(false)}
              >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPlatformDropdownVisible(false)}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={meetingPlatforms}
                      keyExtractor={item => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setMeetingPlatform(item);
                            setPlatformDropdownVisible(false);
                          }}
                        >
                          <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border }} />}
                      style={{ maxHeight: 300 }}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* Meeting Link */}
              <Text style={styles.label}>Meeting Link</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter meeting link (Zoom, Google Meet, etc.)"
                placeholderTextColor={COLORS.muted}
                value={meetingLink}
                onChangeText={setMeetingLink}
                autoCapitalize="none"
                keyboardType="url"
              />
            </>
          )}
          
          <TouchableOpacity style={styles.scheduleBtn} onPress={handleSchedule} activeOpacity={0.85}>
            <Text style={styles.scheduleBtnText}>Schedule Meeting</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: COLORS.background,
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 16,
    fontWeight: '600',
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 8,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  datePickerBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
    marginTop: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 18,
    minHeight: 48,
  },
  scheduleBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  virtualToggleContainer: {
    marginBottom: 8,
  },
  toggleButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  toggleTextActive: {
    color: '#fff',
  },
}); 