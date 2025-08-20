import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { counselorsAPI, messagingAPI } from '../../services/api';
import { getUserData } from '../../services/storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme';

export default function UserMessages() {
  const [counselors, setCounselors] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [firstLoad, setFirstLoad] = useState(true);
  const router = useRouter();

  // Refactored fetchData to accept showSpinner argument
  const fetchData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const user = await getUserData();
      setUserId(user.id);
      setUserName(user.full_name || user.name || user.email || 'User');
      const counselorsRes = await counselorsAPI.getAllCounselors();
      if (counselorsRes.success) setCounselors(counselorsRes.counselors);
      // Fetch last message for each counselor
      const lastMsgs = {};
      for (const counselor of counselorsRes.counselors) {
        const messagesRes = await messagingAPI.getMessages({ user_id: user.id, counselor_id: counselor.id });
        if (messagesRes.success && messagesRes.messages.length > 0) {
          const lastMsg = messagesRes.messages[messagesRes.messages.length - 1];
          lastMsgs[counselor.id] = lastMsg;
        }
      }
      setLastMessages(lastMsgs);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // On initial mount, show spinner
  useEffect(() => {
    fetchData(true).then(() => setFirstLoad(false));
  }, []);

  // On focus, refresh in background (no spinner)
  useFocusEffect(
    useCallback(() => {
      if (!firstLoad) fetchData(false);
    }, [firstLoad])
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (error) return <Text>{error}</Text>;

  // Helper to format last message time
  function formatMessageTime(dateStr) {
    const date = dayjs(dateStr);
    const now = dayjs();
    if (date.isSame(now, 'day')) {
      return date.format('HH:mm');
    }
    if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    }
    return date.format('MMM D, YYYY');
  }

  // Helper to get initials from name
  function getInitials(name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  return (
    <SafeAreaView>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Hello, <Text style={{ color: COLORS.primary }}>{userName}</Text></Text>
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 }}>
          <Ionicons name="search-outline" size={20} color="#a0aec0" />
          <TextInput
            style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#1a202c' }}
            placeholder="Search chats..."
            placeholderTextColor="#a0aec0"
            // Add search logic if needed
          />
        </View>
      </View>
      <ScrollView>
        <View style={{ padding: 20, paddingTop: 0 }}>
          {/* Chat List */}
          {counselors.length === 0 ? (
            <Text>No counselors available.</Text>
          ) : (
            counselors
              .filter((counselor) => lastMessages[counselor.id])
              .map((counselor) => {
                const lastMsg = lastMessages[counselor.id];
                return (
                  <TouchableOpacity
                    key={counselor.id}
                    style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                    onPress={() => router.push({ pathname: '/userChat', params: { counselorId: counselor.id } })}
                  >
                    {/* Avatar */}
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{getInitials(counselor.name)}</Text>
                    </View>
                    {/* Chat Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{counselor.name}</Text>
                      <Text style={{ color: '#4a5568', marginTop: 4 }} numberOfLines={1}>
                        {lastMsg ? (lastMsg.reply ? `You: ${lastMsg.reply}` : lastMsg.message) : 'No messages yet.'}
                      </Text>
                    </View>
                    {/* Time */}
                    <Text style={{ color: '#a0aec0', fontSize: 12, marginLeft: 8, textAlign: 'right', minWidth: 60 }}>
                      {lastMsg ? formatMessageTime(lastMsg.timestamp || lastMsg.created_at) : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button (optional) */}
      {/* <TouchableOpacity style={{ position: 'absolute', bottom: 32, right: 32, backgroundColor: COLORS.primary, borderRadius: 28, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 5 }}>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
} 