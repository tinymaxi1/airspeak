import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import { Home, BookOpen, Brain, Trophy, User, Library } from '@tamagui/lucide-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useUnreadCount } from '@/features/notifications/api';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const unreadCount = useUnreadCount(userId);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary?.val,
        tabBarInactiveTintColor: theme.textSecondary?.val,
        tabBarStyle: {
          backgroundColor: theme.surface?.val,
          borderTopColor: theme.border?.val,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home', 'Ana sayfa'),
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          tabBarAccessibilityLabel: t('tabs.home', 'Ana sayfa'),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('tabs.learn', 'Öğren'),
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
          tabBarAccessibilityLabel: t('tabs.learn', 'Öğren'),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t('tabs.practice', 'Pratik'),
          tabBarIcon: ({ color }) => <Brain color={color} size={24} />,
          tabBarAccessibilityLabel: t('tabs.practice', 'Pratik'),
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: t('tabs.dictionary', 'Sözlük'),
          tabBarIcon: ({ color }) => <Library color={color} size={24} />,
          tabBarAccessibilityLabel: t('tabs.dictionary', 'Sözlük'),
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          title: t('tabs.league', 'Lig'),
          tabBarIcon: ({ color }) => <Trophy color={color} size={24} />,
          tabBarAccessibilityLabel: t('tabs.league', 'Lig'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile', 'Profil'),
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
          tabBarAccessibilityLabel: t('tabs.profile', 'Profil'),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: '#E63946', color: '#FFFFFF', fontSize: 10 },
        }}
      />
    </Tabs>
  );
}
