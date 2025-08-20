import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { aiAPI } from '../../services/api';
import COLORS from '../theme';
import Markdown from 'react-native-markdown-display';

export default function AIChat() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI career assistant. I can help you with career guidance, resume tips, interview preparation, and more. What would you like to know?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);

  const quickQuestions = [
    "How do I write a good resume?",
    "What are the best interview tips?",
    "How do I choose a career path?",
    "What skills are in demand?",
    "How do I negotiate salary?",
  ];

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.askAI(message.trim());
      
      if (response.reply) {
        const aiResponse = {
          id: Date.now() + 1,
          text: response.reply,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback to local response if API fails
        const aiResponse = {
          id: Date.now() + 1,
          text: generateAIResponse(message.trim()),
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('AI API error:', error);
      // Fallback to local response
      const aiResponse = {
        id: Date.now() + 1,
        text: generateAIResponse(message.trim()),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      return "Here are some key tips for writing a great resume:\n\n1. Start with a strong summary\n2. Use action verbs and quantifiable achievements\n3. Tailor it to the specific job\n4. Keep it concise (1-2 pages)\n5. Proofread carefully\n\nWould you like me to help you with a specific section?";
    }
    
    if (lowerMessage.includes('interview')) {
      return "Great question! Here are essential interview tips:\n\n1. Research the company thoroughly\n2. Practice common questions\n3. Prepare your own questions\n4. Dress appropriately\n5. Show enthusiasm and confidence\n6. Follow up with a thank-you note\n\nWhat type of interview are you preparing for?";
    }
    
    if (lowerMessage.includes('career') || lowerMessage.includes('path')) {
      return "Choosing a career path is a big decision! Consider:\n\n1. Your interests and passions\n2. Your skills and strengths\n3. Market demand and growth potential\n4. Work-life balance preferences\n5. Salary expectations\n\nWhat fields interest you most?";
    }
    
    if (lowerMessage.includes('skill')) {
      return "Currently in-demand skills include:\n\n• Data Science & Analytics\n• Digital Marketing\n• Cybersecurity\n• Cloud Computing\n• AI & Machine Learning\n• Project Management\n• Soft Skills (Communication, Leadership)\n\nWhat industry are you interested in?";
    }
    
    if (lowerMessage.includes('salary') || lowerMessage.includes('negotiate')) {
      return "Salary negotiation tips:\n\n1. Research market rates for your role\n2. Know your worth and achievements\n3. Practice your pitch\n4. Consider the full compensation package\n5. Be confident but respectful\n6. Have a backup plan\n\nWhat's your current situation?";
    }
    
    return "That's an interesting question! I'd be happy to help you with career guidance. Could you provide more specific details about what you'd like to know? I can help with resume writing, interview preparation, career planning, skill development, and more.";
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        {item.sender === 'ai' ? (
          <Markdown style={{ body: styles.aiMessageText }}>{item.text}</Markdown>
        ) : (
          <Text style={[styles.messageText, styles.userMessageText]}>{item.text}</Text>
        )}
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>

        <View style={styles.headerAbsoluteCenter}>
          <Text style={styles.headerTitle}>AI Career Assistant</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

      </View>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
          <View style={styles.quickQuestionsList}>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickQuestionButton}
                onPress={() => handleQuickQuestion(question)}
              >
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBubble}>
            <Text style={styles.loadingText}>AI is typing...</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#a0aec0"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim() ? '#fff' : '#a0aec0'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ad79e3',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#48bb78',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#48bb78',
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 12,
  },
  quickQuestionsList: {
    gap: 8,
  },
  quickQuestionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#4a5568',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#1a202c',
  },
  timestamp: {
    fontSize: 11,
    color: '#a0aec0',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  loadingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#a0aec0',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f7fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a202c',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  headerAbsoluteCenter: {
    position: 'absolute',
    left: 0,
    paddingTop: 15,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 