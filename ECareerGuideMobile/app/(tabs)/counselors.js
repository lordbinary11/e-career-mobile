import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { counselorsAPI } from '../../services/api';
import COLORS from '../theme';

export default function Counselors() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const specialties = ['All', 'Technology', 'Healthcare', 'Business', 'Education', 'Arts', 'Engineering'];

  useEffect(() => {
    loadCounselors();
  }, []);

  const loadCounselors = async () => {
    try {
      setIsLoading(true);
      const response = await counselorsAPI.getAllCounselors();
      
      if (response.success) {
        setCounselors(response.counselors || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load counselors');
      }
    } catch (error) {
      console.error('Error loading counselors:', error);
      Alert.alert('Error', 'Failed to load counselors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         counselor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || counselor.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const renderCounselorCard = ({ item }) => (
    <View style={styles.counselorCard}>
      <View style={styles.counselorHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👨‍💼</Text>
        </View>
        <View style={styles.counselorInfo}>
          <Text style={styles.counselorName}>{item.name}</Text>
          <Text style={styles.counselorSpecialty}>{item.specialization}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Text style={styles.rating}>{item.rating || 4.5}</Text>
            <Text style={styles.reviews}>({item.reviews || 0} reviews)</Text>
          </View>
          {/* Responsive available days UI */}
          {item.availability && Array.isArray(item.availability) && item.availability.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
              {item.availability.map((slot, idx) => (
                <View key={idx} style={{
                  backgroundColor: '#667eea',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  marginRight: 6,
                  marginBottom: 4,
                }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>{slot.day.slice(0, 3)} {slot.start}-{slot.end}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityDot} />
          <Text style={styles.availability}>{item.availability && item.availability.length > 0 ? 'Available' : 'Unavailable'}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.bio || 'Professional career counselor with expertise in various fields.'}</Text>

      <View style={styles.counselorDetails}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 }}>
            <Ionicons name="time-outline" size={16} color="#4a5568" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#4a5568' }}>{item.experience} yrs</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 }}>
            <Ionicons name="call-outline" size={16} color="#4a5568" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#4a5568' }}>{item.phone}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="mail-outline" size={16} color="#4a5568" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#4a5568' }}>{item.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push({ pathname: '/userChat', params: { counselorId: item.id } })}
        >
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => router.push({ pathname: '/scheduleMeeting', params: { counselorId: item.id } })}
        >
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text style={styles.scheduleButtonText}>Schedule Meeting</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Career Counselors</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#a0aec0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search counselors..."
            placeholderTextColor="#a0aec0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Specialty Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {specialties.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.filterChip,
                selectedSpecialty === specialty && styles.filterChipActive
              ]}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Text style={[
                styles.filterChipText,
                selectedSpecialty === specialty && styles.filterChipTextActive
              ]}>
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Counselors List */}
      <FlatList
        data={filteredCounselors}
        renderItem={renderCounselorCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.counselorsList}
        showsVerticalScrollIndicator={false}
      />
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
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1a202c',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  counselorsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  counselorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  counselorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatar: {
    fontSize: 32,
  },
  counselorInfo: {
    flex: 1,
  },
  counselorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  counselorSpecialty: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 4,
  },
  availabilityContainer: {
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48bb78',
    marginBottom: 4,
  },
  availability: {
    fontSize: 12,
    color: '#48bb78',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  counselorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#4a5568',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 6,
  },
  messageButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ad79e3',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 