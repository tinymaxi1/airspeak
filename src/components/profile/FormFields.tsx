/**
 * FormFields — paylaşılan input/textarea/select primitives.
 *
 * profile-edit + CrudListEditor modal'ları kullanır.
 */
import { ReactNode } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FONTS, Mono, Body } from '@/components/airspeak';

export function FieldText({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  multiline,
  rows,
  mono,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
          {label.toUpperCase()}
        </Mono>
        {hint && (
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8 }}>
            {hint}
          </Mono>
        )}
      </View>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: '#DCE0E8',
          paddingHorizontal: 14,
          paddingVertical: multiline ? 10 : 11,
          marginTop: 6,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          style={{
            fontFamily: mono ? FONTS.mono700 : FONTS.body,
            fontSize: mono ? 14 : 15,
            color: '#0E1116',
            minHeight: multiline ? (rows ?? 2) * 22 : undefined,
          }}
        />
      </View>
    </View>
  );
}

export function FieldNumber({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  min,
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  min?: number;
}) {
  function handle(v: string) {
    if (v === '') {
      onChangeText('');
      return;
    }
    const num = Number(v.replace(/[^0-9]/g, ''));
    if (Number.isNaN(num)) return;
    if (min !== undefined && num < min) return;
    onChangeText(String(num));
  }
  return (
    <FieldText
      label={label}
      hint={hint}
      value={value}
      onChangeText={handle}
      placeholder={placeholder}
      keyboardType="numeric"
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

export function FieldRadio<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
}) {
  return (
    <View>
      <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
        {label.toUpperCase()}
      </Mono>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(active ? null : opt.value)}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? '#0F1E47' : '#FFFFFF',
                borderWidth: 1.5,
                borderColor: active ? '#0F1E47' : '#DCE0E8',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: active ? '#FFFFFF' : '#0E1116',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function FieldSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View>
      <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
        {label.toUpperCase()}
      </Mono>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 8,
                backgroundColor: active ? '#0F1E47' : '#FFFFFF',
                borderWidth: 1.5,
                borderColor: active ? '#0F1E47' : '#DCE0E8',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 12,
                  color: active ? '#FFFFFF' : '#0E1116',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function FieldToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onChange(!value)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDEFF3',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
          {label}
        </Text>
        {description && (
          <Body color="#5A6478" style={{ fontSize: 11, marginTop: 2 }}>
            {description}
          </Body>
        )}
      </View>
      <View
        style={{
          width: 40,
          height: 23,
          borderRadius: 12,
          backgroundColor: value ? '#2DBE6C' : '#DCE0E8',
          padding: 2,
        }}
      >
        <View
          style={{
            width: 19,
            height: 19,
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: value ? 17 : 0 }],
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

/** Boş kayıt CTA bölümü — empty state için */
export function EmptyHint({
  emoji,
  text,
  cta,
  onPress,
}: {
  emoji: string;
  text: string;
  cta?: string;
  onPress?: () => void;
}) {
  const inner: ReactNode = (
    <View
      style={{
        padding: 20,
        backgroundColor: '#F4F2EC',
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Body color="#5A6478" style={{ fontSize: 12, textAlign: 'center' }}>
        {text}
      </Body>
      {cta ? (
        <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 1.2, marginTop: 4 }}>
          {cta}
        </Mono>
      ) : null}
    </View>
  );
  if (!onPress) return inner;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {inner}
    </TouchableOpacity>
  );
}
