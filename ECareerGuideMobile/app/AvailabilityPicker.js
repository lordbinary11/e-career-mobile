import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function AvailabilityPicker({ onChange }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});
  const [showPicker, setShowPicker] = useState({ day: null, type: null }); // type: 'start' | 'end'
  const [pickerValue, setPickerValue] = useState(new Date());

  // Toggle day selection
  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    if (!timeSlots[day]) {
      setTimeSlots({ ...timeSlots, [day]: { start: '09:00', end: '17:00' } });
    }
  };

  // Show time picker
  const openTimePicker = (day, type) => {
    setShowPicker({ day, type });
    setPickerValue(
      new Date(`2020-01-01T${timeSlots[day]?.[type] || '09:00'}:00`)
    );
  };

  // Handle time picked
  const onTimePicked = (event, selectedDate) => {
    if (event.type === 'set' && showPicker.day) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setTimeSlots((prev) => ({
        ...prev,
        [showPicker.day]: {
          ...prev[showPicker.day],
          [showPicker.type]: `${hours}:${minutes}`
        }
      }));
      setShowPicker({ day: null, type: null });
    } else {
      setShowPicker({ day: null, type: null });
    }
  };

  // Prepare availability array for backend
  const availability = selectedDays.map(day => ({
    day,
    start: timeSlots[day]?.start || '09:00',
    end: timeSlots[day]?.end || '17:00'
  }));

  // Pass up to parent if needed
  useEffect(() => {
    if (onChange) onChange(availability);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(availability)]);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Select Availability</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {daysOfWeek.map(day => (
          <TouchableOpacity
            key={day}
            style={{
              backgroundColor: selectedDays.includes(day) ? '#667eea' : '#e2e8f0',
              borderRadius: 16,
              padding: 8,
              margin: 4
            }}
            onPress={() => toggleDay(day)}
          >
            <Text style={{ color: selectedDays.includes(day) ? '#fff' : '#1a202c' }}>{day.slice(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedDays.map(day => (
        <View key={day} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ width: 80 }}>{day}:</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#f7fafc', padding: 8, borderRadius: 8, marginRight: 8 }}
            onPress={() => openTimePicker(day, 'start')}
          >
            <Text>Start: {timeSlots[day]?.start || '09:00'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#f7fafc', padding: 8, borderRadius: 8 }}
            onPress={() => openTimePicker(day, 'end')}
          >
            <Text>End: {timeSlots[day]?.end || '17:00'}</Text>
          </TouchableOpacity>
        </View>
      ))}
      {showPicker.day && (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimePicked}
        />
      )}
    </View>
  );
} 