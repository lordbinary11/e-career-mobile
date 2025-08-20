import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../theme';
import AIChat from './ai-chat';
import DashboardUser from './dashboardUser';
import UserMessages from './userMessages';
import ProfileUser from './profileUser';
import Counselors from './counselors';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      initialRouteName="dashboardUser"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#a0aec0',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 80,
          paddingTop: 2,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'ai-chat') {
            return <MaterialCommunityIcons name={focused ? 'robot' : 'robot-outline'} size={size} color={color} />;
          }
          let iconName;
          if (route.name === 'dashboardUser') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'userMessages') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'profileUser') {
            iconName = focused ? 'person' : 'person-outline';
          }
          else if (route.name === 'counselors') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      
      <Tab.Screen name="dashboardUser" component={DashboardUser} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="counselors" component={Counselors} options={{ tabBarLabel: 'Experts' }} />
      <Tab.Screen name="ai-chat" component={AIChat} options={{ tabBarLabel: 'AI Chat' }} />
      <Tab.Screen name="userMessages" component={UserMessages} options={{ tabBarLabel: 'Chats' }} />
      <Tab.Screen name="profileUser" component={ProfileUser} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
} 