import React, { ComponentType } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppTabParamList } from '../types/navigation';
import PlantListScreen from '../screens/plants/PlantListScreen';
import NotificationScreen from '../screens/notification/NotificationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const PlantListTab = PlantListScreen as ComponentType<any>;
const NotificationTab = NotificationScreen as ComponentType<any>;
const ProfileTab = ProfileScreen as ComponentType<any>;

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarStyle: {
          backgroundColor: '#0B1C10',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'PlantsTab') {
            return <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={size} color={color} />;
          }
          if (route.name === 'NotificationsTab') {
            return <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />;
          }
          if (route.name === 'ProfileTab') {
            return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen
        name="PlantsTab"
        component={PlantListTab}
        options={{ tabBarLabel: 'Plantas' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationTab}
        options={{ tabBarLabel: 'Notificações' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileTab}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
