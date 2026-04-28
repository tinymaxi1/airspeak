/**
 * Composite components — yüksek seviyeli pattern'lerin tekrar kullanılabilir hâli.
 *
 * NavCard      — icon + eyebrow + title + subtitle + chevron (search/career/conversation)
 * EmptyState   — dashed empty placeholder (9+ ekranda tekrar eden pattern)
 * SettingsRow  — settings + profile + privacy + help row pattern
 * SearchBar    — global search ve vocab search'te ortak
 * ScreenHeader — back arrow + eyebrow + title + opsiyonel right slot
 */
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import type { ReactNode } from 'react';
import { Body, Eyebrow, Mono, FONTS } from './typography';

interface NavCardProps {
  icon: string;
  iconBg?: string;
  iconBoxSize?: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
  onPress: () => void;
  /** Dark theme (navy bg) için */
  dark?: boolean;
  /** Opsiyonel sağ aksesuar (default chevron ›) */
  right?: ReactNode;
  /** Highlight border (örn cohort joined yeşil) */
  accent?: string;
}

export function NavCard({
  icon,
  iconBg,
  iconBoxSize = 56,
  eyebrow,
  title,
  subtitle,
  badgeText,
  badgeColor,
  onPress,
  dark,
  right,
  accent,
}: NavCardProps) {
  const cardBg = dark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
  const borderColor = accent ?? (dark ? 'rgba(255,255,255,0.12)' : '#DCE0E8');
  const titleColor = dark ? '#FFFFFF' : '#0E1116';
  const subColor = dark ? 'rgba(255,255,255,0.7)' : '#5A6478';
  const eyeColor = dark ? 'rgba(255,255,255,0.7)' : '#5A6478';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
      style={{
        backgroundColor: cardBg,
        borderRadius: 14,
        borderWidth: accent ? 2 : 1.5,
        borderColor,
        borderBottomWidth: dark ? 1.5 : 4,
        borderBottomColor: accent ?? borderColor,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          borderRadius: 14,
          backgroundColor: iconBg ?? '#EDEFF3',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: iconBoxSize * 0.5 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <Mono style={{ fontSize: 10, color: eyeColor, letterSpacing: 1.8 }}>
            {eyebrow}
          </Mono>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              fontFamily: FONTS.body800,
              fontSize: 15,
              color: titleColor,
              marginTop: eyebrow ? 4 : 0,
            }}
          >
            {title}
          </Text>
          {badgeText && (
            <View
              style={{
                backgroundColor: badgeColor ?? '#FFD56B',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Mono
                style={{
                  fontSize: 9,
                  color: badgeColor === '#0F1E47' ? '#FFFFFF' : '#0A1430',
                  letterSpacing: 0.81,
                }}
              >
                {badgeText}
              </Mono>
            </View>
          )}
        </View>
        {subtitle && (
          <Body color={subColor} style={{ fontSize: 12, marginTop: 4 }}>
            {subtitle}
          </Body>
        )}
      </View>
      {right ?? <Text style={{ fontSize: 22, color: dark ? 'rgba(255,255,255,0.5)' : '#8A93A6' }}>›</Text>}
    </TouchableOpacity>
  );
}

interface EmptyStateProps {
  icon?: string;
  message: string;
  hint?: string;
  /** Dashed border (default) veya solid */
  dashed?: boolean;
  dark?: boolean;
}

export function EmptyState({ icon = '🔍', message, hint, dashed = true, dark }: EmptyStateProps) {
  return (
    <View
      style={{
        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
        borderWidth: 1.5,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: dark ? 'rgba(255,255,255,0.18)' : '#DCE0E8',
        borderRadius: 14,
        padding: 24,
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 36 }}>{icon}</Text>
      <Body
        color={dark ? 'rgba(255,255,255,0.7)' : '#5A6478'}
        style={{ fontSize: 14, textAlign: 'center' }}
      >
        {message}
      </Body>
      {hint && (
        <Mono style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : '#8A93A6', textAlign: 'center' }}>
          {hint}
        </Mono>
      )}
    </View>
  );
}

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  right?: ReactNode;
  /** "ACTIVE" tarzı gold badge */
  rightBadge?: string;
  rightBadgeTone?: 'gold' | 'mono' | 'green';
  danger?: boolean;
  onPress?: () => void;
  /** Tek başına son satır ise (border-bottom yok) */
  last?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  right,
  rightBadge,
  rightBadgeTone = 'gold',
  danger,
  onPress,
  last,
}: SettingsRowProps) {
  const badgeBg =
    rightBadgeTone === 'gold' ? '#FFD56B' : rightBadgeTone === 'green' ? '#2DBE6C' : '#EDEFF3';
  const badgeFg = rightBadgeTone === 'mono' ? '#5A6478' : '#0A1430';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}${value ? `, ${value}` : ''}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: '#EDEFF3',
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger ? '#FFE4E7' : '#EDEFF3',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18, color: danger ? '#E63946' : '#0F1E47' }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 15,
            color: danger ? '#E63946' : '#0E1116',
            lineHeight: 18,
          }}
        >
          {label}
        </Text>
        {value && (
          <Text style={{ fontSize: 12, color: '#8A93A6', marginTop: 2, fontFamily: FONTS.body }}>
            {value}
          </Text>
        )}
      </View>
      {right ??
        (rightBadge ? (
          <View
            style={{
              backgroundColor: badgeBg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Mono style={{ fontSize: 10, color: badgeFg, letterSpacing: 0.9 }}>
              {rightBadge}
            </Mono>
          </View>
        ) : onPress ? (
          <Text style={{ fontSize: 18, color: '#8A93A6' }}>›</Text>
        ) : null)}
    </TouchableOpacity>
  );
}

interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder, autoFocus }: SearchBarProps) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 18 }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A93A6"
        style={{
          flex: 1,
          fontFamily: FONTS.body,
          fontSize: 15,
          color: '#0E1116',
        }}
        autoCapitalize="none"
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          accessibilityLabel="Temizle"
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 18, color: '#8A93A6' }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface ScreenHeaderProps {
  onBack?: () => void;
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  dark?: boolean;
}

export function ScreenHeader({ onBack, eyebrow, title, right, dark }: ScreenHeaderProps) {
  const fg = dark ? '#FFFFFF' : '#0E1116';
  const eyeColor = dark ? 'rgba(255,255,255,0.7)' : '#5A6478';
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {onBack && (
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Geri">
          <Text style={{ fontSize: 22, color: fg }}>←</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: eyeColor }}>
            {eyebrow}
          </Mono>
        )}
        <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: fg, marginTop: eyebrow ? 2 : 0 }}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}
