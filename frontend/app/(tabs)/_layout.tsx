import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SAGE, NEUTRAL_500, NEUTRAL_300, WHITE } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: SAGE,
        tabBarInactiveTintColor: NEUTRAL_500,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: 0.5,
          borderTopColor: NEUTRAL_300,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'alert-circle' : 'alert-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'camera' : 'camera-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
