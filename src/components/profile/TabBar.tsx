/**
 * TabBar — segmented control (horizontal scroll, 5 chip).
 *
 * Profile edit ekranlarında multi-tab navigation için.
 */
import { ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { FONTS } from '@/components/airspeak';

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  emoji?: string;
}

export function TabBar<K extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem<K>[];
  active: K;
  onChange: (key: K) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EDEFF3',
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
      >
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => onChange(t.key)}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isActive ? '#0F1E47' : '#F4F2EC',
                borderWidth: 1,
                borderColor: isActive ? '#0F1E47' : '#E9E6DD',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: isActive ? '#FFFFFF' : '#5A6478',
                }}
              >
                {t.emoji ? `${t.emoji}  ` : ''}
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
