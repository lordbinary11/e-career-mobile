import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { messagingAPI } from '../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

export default function CounselorMessages() {
  const [students, setStudents] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await messagingAPI.getMessages({
        is_counselor_inbox: true
      });

      if (response.success && Array.isArray(response.messages)) {
        const studentMap = new Map();
        const lastMessageMap = {};

        response.messages.forEach(message => {
          const studentId = message.user_id;
          const studentName = message.student_name || `Student ${studentId}`;
          const studentEmail = message.student_email || '';

          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              id: studentId,
              name: studentName,
              email: studentEmail
            });
          }

          if (!lastMessageMap[studentId] || 
              new Date(message.timestamp) > new Date(lastMessageMap[studentId].timestamp)) {
            lastMessageMap[studentId] = message;
          }
        });

        setStudents(Array.from(studentMap.values()));
        setLastMessages(lastMessageMap);
      } else {
        setStudents([]);
        setLastMessages({});
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (dateStr) => {
    const date = dayjs(dateStr);
    const now = dayjs();
    
    if (date.isSame(now, 'day')) {
      return date.format('HH:mm');
    } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    } else if (date.isAfter(now.subtract(7, 'day'))) {
      return date.format('ddd');
    } else {
      return date.format('MMM DD');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 16, color: '#4a5568' }}>Loading messages...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f7fafc' }}>
        <Text style={{ color: '#e53e3e', textAlign: 'center', marginBottom: 16 }}>Error: {error}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#667eea', padding: 12, borderRadius: 8 }}
          onPress={fetchData}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7fafc' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a202c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#a0aec0" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>You haven't received any messages from students yet</Text>
          </View>
        }
        renderItem={({ item: student }) => {
          const lastMsg = lastMessages[student.id];
          return (
            <TouchableOpacity 
              style={styles.studentCard}
              onPress={() => {
                // Navigate to individual chat with this student
                router.push({
                  pathname: '/counselorChat',
                  params: { userId: student.id, studentName: student.name }
                });
              }}
            >
              <View style={styles.studentInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                  {lastMsg && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {lastMsg.reply || lastMsg.message}
                    </Text>
                  )}
                </View>
              </View>
              {lastMsg && (
                <View style={styles.messageInfo}>
                  <Text style={styles.messageTime}>
                    {formatMessageTime(lastMsg.timestamp)}
                  </Text>
                  {lastMsg.status === 'sent' && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>New</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
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
  listContainer: {
    padding: 20,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1a202c',
    marginBottom: 2,
  },
  studentEmail: {
    color: '#4a5568',
    fontSize: 14,
    marginBottom: 4,
  },
  lastMessage: {
    color: '#4a5568',
    fontSize: 14,
  },
  messageInfo: {
    alignItems: 'flex-end',
  },
  messageTime: {
    color: '#a0aec0',
    fontSize: 12,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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