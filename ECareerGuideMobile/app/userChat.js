import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { messagingAPI, counselorsAPI } from '../services/api';
import { getUserData } from '../services/storage';
import { useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import COLORS from './theme';

export default function UserChat() {
  const { counselorId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counselor, setCounselor] = useState(null);
  const [userId, setUserId] = useState(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await getUserData();
        setUserId(user.id);
        const counselorRes = await counselorsAPI.getCounselor(counselorId);
        if (counselorRes.success) setCounselor(counselorRes.counselor);
        const messagesRes = await messagingAPI.getMessages({ user_id: user.id, counselor_id: counselorId });
        if (messagesRes.success) setMessages(messagesRes.messages);
      } catch (err) {
        setError(err.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [counselorId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await messagingAPI.sendMessage({ user_id: userId, counselor_id: counselorId, message: newMessage });
      setNewMessage('');
      // Refresh messages
      const messagesRes = await messagingAPI.getMessages({ user_id: userId, counselor_id: counselorId });
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

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (error) return <Text>{error}</Text>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{getInitials(counselor?.name)}</Text>
        </View>
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{counselor?.name || 'Counselor'}</Text>
          <Text style={{ color: '#4a5568', fontSize: 12 }}>{counselor?.specialization}</Text>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <Text>No messages yet.</Text>
        ) : (
          sortedDates.map(dateStr => (
            <View key={dateStr}>
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ backgroundColor: '#e2e8f0', color: '#4a5568', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12 }}>{formatDateHeader(dateStr)}</Text>
              </View>
              {grouped[dateStr].map((msg, idx) => {
                const isUser = msg.user_id == userId;
                const time = dayjs(msg.timestamp || msg.created_at).format('HH:mm');
                return (
                  <View
                    key={msg.id || idx}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      backgroundColor: isUser ? COLORS.primary : '#fff',
                      borderRadius: 16,
                      padding: 12,
                      marginBottom: 10,
                      maxWidth: '80%',
                      shadowColor: isUser ? COLORS.primary : '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                    }}
                  >
                    <Text style={{ color: isUser ? '#fff' : '#1a202c', fontSize: 15 }}>{msg.reply || msg.message}</Text>
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
          <TouchableOpacity style={{ backgroundColor: COLORS.primary, borderRadius: 20, padding: 10 }} onPress={handleSend}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 