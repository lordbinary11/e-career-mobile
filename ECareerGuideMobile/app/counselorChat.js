import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { messagingAPI } from '../services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import COLORS from './theme';

export default function CounselorChat() {
  const { userId, studentName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counselorId, setCounselorId] = useState(null);
  const scrollViewRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get counselor ID from JWT token (this will be handled by the backend)
        const messagesRes = await messagingAPI.getMessages({ 
          user_id: userId, 
          counselor_id: 'me' // Backend will get counselor ID from JWT
        });
        if (messagesRes.success) {
          setMessages(messagesRes.messages);
          // Extract counselor ID from the first message
          if (messagesRes.messages.length > 0) {
            setCounselorId(messagesRes.messages[0].counselor_id);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      // Use the counselor-specific message sending endpoint
      await messagingAPI.sendCounselorMessage({ 
        user_id: userId, 
        message: newMessage 
      });
      setNewMessage('');
      // Refresh messages
      const messagesRes = await messagingAPI.getMessages({ 
        user_id: userId, 
        counselor_id: 'me' 
      });
      if (messagesRes.success) setMessages(messagesRes.messages);
      // Scroll to bottom
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      alert(err.message || 'Failed to send message');
    }
  };

  // Helper to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = dayjs(msg.timestamp || msg.created_at).format('YYYY-MM-DD');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  // Helper to format date header
  const formatDateHeader = (dateStr) => {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return dayjs(dateStr).format('MMM D, YYYY');
  };

  // Helper to get initials from name
  function getInitials(name) {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase()
      : '';
  }

  // Group messages by date
  const grouped = groupMessagesByDate(messages);
  const sortedDates = Object.keys(grouped).sort();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: '#4a5568' }}>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' }}>
        <Text style={{ color: '#e53e3e', textAlign: 'center', marginBottom: 16 }}>Error: {error}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }}
          onPress={() => window.location.reload()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#1a202c" />
        </TouchableOpacity>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{getInitials(studentName)}</Text>
        </View>
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{studentName || 'Student'}</Text>
          <Text style={{ color: '#4a5568', fontSize: 12 }}>Student</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <Ionicons name="chatbubbles-outline" size={64} color="#a0aec0" />
            <Text style={{ marginTop: 16, color: '#4a5568', fontSize: 16 }}>No messages yet</Text>
            <Text style={{ color: '#a0aec0', fontSize: 14, textAlign: 'center' }}>Start a conversation with this student</Text>
          </View>
        ) : (
          sortedDates.map(dateStr => (
            <View key={dateStr}>
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ backgroundColor: '#e2e8f0', color: '#4a5568', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12 }}>{formatDateHeader(dateStr)}</Text>
              </View>
              {grouped[dateStr].map((msg, idx) => {
                const isCounselor = msg.counselor_id == counselorId;
                const time = dayjs(msg.timestamp || msg.created_at).format('HH:mm');
                return (
                  <View
                    key={msg.id || idx}
                    style={{
                      alignSelf: isCounselor ? 'flex-end' : 'flex-start',
                      backgroundColor: isCounselor ? COLORS.primary : '#fff',
                      borderRadius: 16,
                      padding: 12,
                      marginBottom: 10,
                      maxWidth: '80%',
                      shadowColor: isCounselor ? COLORS.primary : '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                    }}
                  >
                    <Text style={{ color: isCounselor ? '#fff' : '#1a202c', fontSize: 15 }}>{msg.reply || msg.message}</Text>
                    <Text style={{ color: '#a0aec0', fontSize: 10, marginTop: 4, textAlign: 'right' }}>{time}</Text>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
          <TextInput
            style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 10, marginRight: 8, backgroundColor: '#f7fafc' }}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={{ backgroundColor: COLORS.primary, borderRadius: 20, padding: 10 }} 
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 