/**
 * Learn Screen — Runway-styled lesson tree
 *
 * Tasarım birebir uygulandı (screens-learn.jsx):
 * - Red header (boarding pass + dashed route stroke + UNIT 04 badge)
 * - Progress bar (5/9 white on red)
 * - Chip row (Holding & approach, Taxi, Departure, Emergency)
 * - Runway-curve lesson tree (zig-zag x-offset + dashed bg path)
 * - Lesson nodes: done (green) + current (red pulsing + START tag)
 * - Locked (gray + lock icon), checkpoint (gold), boss (navy + trophy)
 * - Section closer (navy boss card + trophy bg)
 */
import { ScrollView, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProgressStore } from '@/stores/progressStore';
import { useLessonProgressStore } from '@/stores/lessonProgressStore';
import { useUnitIntroStore } from '@/stores/unitIntroStore';
import { useModules } from '@/features/content/api';
import { UnitIntroModal } from '@/components/learn/UnitIntroModal';
import type { UserRole } from '@/types/profile';
import {
  HHero,
  H2,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  ProgressBar,
} from '@/components/airspeak';

interface TreeNode {
  id: string; // lesson id (gerçek)
  type: 'lesson' | 'checkpoint' | 'boss';
  state: 'done' | 'current' | 'locked';
  iconLabel: string;
  x: number;
  startTag?: boolean;
  /** Tıklandığında nereye gidilecek (lesson id) */
  lessonId?: string;
}

const LESSON_ICON: Record<string, string> = {
  vocabulary: '📖',
  dialogue: '💬',
  listening: '🎧',
  pronunciation: '🎙',
  quiz: '⭐',
};

export default function LearnScreen() {
  const c = usePalette();
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const completedIds = useProgressStore((s) => s.completedLessonIds);
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  // DB'den modülleri çek — admin değişikliği realtime yansır
  const { data: modules = [], isLoading: modulesLoading, refetch } = useModules(role);
  const activeModule = modules[0]; // Şimdilik ilk modül
  const [activeUnitIdx, setActiveUnitIdx] = useState(0);
  // Sprint 12 — unit intro modal
  const isUnitIntroSeen = useUnitIntroStore((s) => s.isSeen);
  const markUnitIntroSeen = useUnitIntroStore((s) => s.markSeen);
  const [introOpen, setIntroOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Devam eden lesson'ları (kaldığım yer var) gösterirken işaret koymak için
  const lessonProgressMap = useLessonProgressStore((s) => s.byLessonSlug);

  const activeUnit = activeModule?.units[activeUnitIdx];

  // Gerçek lesson listesinden node'lar — ilk locked olmayan ders 'current'
  const nodes: TreeNode[] = useMemo(() => {
    if (!activeUnit) return [];
    const lessons = activeUnit.lessons ?? [];
    const xs = [0, -40, -20, 30, 50, 20, -20, -50, 0]; // zig-zag
    let firstUndoneFound = false;
    return lessons.map((l: any, idx: number) => {
      const isDone = completedSet.has(l.slug);
      const isLast = idx === lessons.length - 1;
      let state: TreeNode['state'];
      if (isDone) {
        state = 'done';
      } else if (!firstUndoneFound) {
        state = 'current';
        firstUndoneFound = true;
      } else {
        state = 'locked';
      }
      return {
        id: l.slug,
        type: isLast ? 'boss' : l.type === 'quiz' ? 'checkpoint' : 'lesson',
        state,
        iconLabel: isLast ? '🏆' : LESSON_ICON[l.type] ?? '✈',
        x: xs[idx % xs.length] ?? 0,
        startTag: state === 'current',
        lessonId: l.slug,
      };
    });
  }, [activeUnit, completedSet]);

  const completedCount = nodes.filter((n) => n.state === 'done').length;

  // Loading state
  if (modulesLoading && modules.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={{ marginTop: 12, color: '#5A6478' }}>Modüller yükleniyor…</Text>
      </View>
    );
  }
  if (!modulesLoading && modules.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg, padding: 24 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>📚</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0E1116', marginBottom: 8 }}>
          Henüz modül yok
        </Text>
        <Text style={{ fontSize: 13, color: '#5A6478', textAlign: 'center' }}>
          Admin yakında bu role uygun ders ekleyecek.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* ═══════════ HEADER — Red boarding pass ═══════════ */}
      <View style={{ backgroundColor: '#E63946', position: 'relative', overflow: 'hidden' }}>
        <SafeAreaView edges={['top']}>
          {/* Dashed route stroke */}
          <View style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
            <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 100">
              <Path d="M0 80 Q200 0 400 60" stroke="white" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              <Circle cx={20} cy={78} r={3} fill="white" />
              <Circle cx={380} cy={62} r={3} fill="white" />
            </Svg>
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#FFFFFF', fontSize: 20 }}>‹</Text>
                  </TouchableOpacity>
                  <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.8 }}>
                    SECTION {activeModule?.number ?? 1} · UNIT {(activeUnit?.number ?? 1)}
                  </Mono>
                </View>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 24,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    lineHeight: 26,
                    letterSpacing: -0.48,
                  }}
                >
                  {activeUnit?.title_tr ?? activeUnit?.title ?? activeModule?.title_tr ?? activeModule?.title ?? ''}
                </Text>
                <Mono style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
                  ICAO descriptors: Comprehension · Vocabulary
                </Mono>
              </View>

              {/* Sprint 12 — Intro tekrar açma butonu (sadece intro_md doluysa) */}
              {activeUnit?.intro_md && (
                <TouchableOpacity
                  onPress={() => setIntroOpen(true)}
                  hitSlop={10}
                  accessibilityLabel="Ünite girişini tekrar göster"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0,0,0,0.18)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 4,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>i</Text>
                </TouchableOpacity>
              )}

              {/* UNIT badge */}
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.18)',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  alignItems: 'center',
                }}
              >
                <Mono style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.9 }}>
                  UNIT
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 22,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    lineHeight: 22,
                  }}
                >
                  {String(activeUnit?.number ?? 1).padStart(2, '0')}
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 8,
                  backgroundColor: 'rgba(0,0,0,0.22)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${(completedCount / nodes.length) * 100}%`,
                    height: '100%',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </View>
              <Mono style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                {completedCount}/{nodes.length}
              </Mono>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Sprint 14.A.3 — Segment: Dersler / Pratik */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#DCE0E8',
        }}
      >
        <View
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: '#0F1E47',
            alignItems: 'center',
          }}
        >
          <Text
            style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#FFFFFF' }}
          >
            Dersler
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/practice')}
          accessibilityLabel="Pratik ekranını aç"
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            alignItems: 'center',
          }}
        >
          <Text
            style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}
          >
            Pratik
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E63946"
            colors={['#E63946']}
          />
        }
      >
        {/* Section unit chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            gap: 8,
          }}
          style={{ borderBottomWidth: 1, borderBottomColor: '#DCE0E8' }}
        >
          {(activeModule?.units ?? []).map((u, i) => {
            const isActive = i === activeUnitIdx;
            return (
              <TouchableOpacity
                key={u.id}
                activeOpacity={0.85}
                onPress={() => {
                  setActiveUnitIdx(i);
                  // Sprint 12 — ilk tıklamada intro modal'ı aç (intro_md doluysa)
                  if (u.intro_md && !isUnitIntroSeen(u.id)) {
                    setIntroOpen(true);
                  }
                }}
                style={{
                  height: 36,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: isActive ? '#0F1E47' : '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: isActive ? '#0F1E47' : '#DCE0E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body700,
                    fontSize: 13,
                    color: isActive ? '#FFFFFF' : '#0E1116',
                  }}
                >
                  {u.title_tr ?? u.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tree */}
        <View style={{ paddingVertical: 32, alignItems: 'center', position: 'relative' }}>
          {/* Bg dashed path */}
          <Svg
            style={{ position: 'absolute', inset: 0 }}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            viewBox="0 0 200 800"
          >
            <Path
              d="M100 30 C 90 80, 60 110, 60 160 S 140 230, 130 290 C 130 340, 170 380, 150 440 S 80 510, 100 570 S 90 650, 100 690"
              stroke="#B8BFCC"
              strokeWidth={2}
              strokeDasharray="5 6"
              fill="none"
            />
          </Svg>

          {nodes.map((node) => (
            <View
              key={node.id}
              style={{
                marginVertical: 6,
                transform: [{ translateX: node.x }],
                position: 'relative',
              }}
            >
              {node.startTag && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    alignSelf: 'center',
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: '#E63946',
                    borderBottomWidth: 4,
                    marginBottom: 8,
                    zIndex: 5,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.body800,
                      fontSize: 11,
                      color: '#E63946',
                      letterSpacing: 0.88,
                    }}
                  >
                    START
                  </Text>
                </View>
              )}

              {/* Star ribbon for done */}
              {node.state === 'done' && node.type === 'lesson' && (
                <View
                  style={{
                    position: 'absolute',
                    top: -6,
                    alignSelf: 'center',
                    flexDirection: 'row',
                    gap: 1,
                    zIndex: 5,
                  }}
                >
                  {[1, 2, 3].map((s) => (
                    <Text key={s} style={{ fontSize: 11, color: s <= 2 ? '#F2C14E' : 'rgba(0,0,0,0.2)' }}>
                      ★
                    </Text>
                  ))}
                </View>
              )}

              {/* Node */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={node.state === 'locked'}
                accessibilityRole="button"
                accessibilityLabel={
                  node.state === 'locked'
                    ? 'Kilitli ders'
                    : node.state === 'done'
                      ? 'Tamamlanmış ders, tekrar et'
                      : 'Dersi başlat'
                }
                onPress={() => {
                  if (node.state === 'locked') return;
                  if (!node.lessonId) return;
                  router.push({ pathname: '/lesson/[id]', params: { id: node.lessonId } });
                }}
                style={{
                  width: node.type === 'boss' ? 92 : node.type === 'checkpoint' ? 80 : 72,
                  height: node.type === 'boss' ? 92 : node.type === 'checkpoint' ? 80 : 72,
                  borderRadius: node.type === 'boss' ? 46 : node.type === 'checkpoint' ? 40 : 36,
                  backgroundColor: nodeColors(node).bg,
                  borderWidth: 3,
                  borderColor: nodeColors(node).border,
                  borderBottomWidth: nodeColors(node).shadowOffset,
                  borderBottomColor: nodeColors(node).shadow,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: node.type === 'boss' ? 38 : 30,
                    color: nodeColors(node).fg,
                  }}
                >
                  {node.state === 'locked' ? '🔒' : node.iconLabel}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Section closer — navy boss card */}
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: '#0F1E47',
              borderRadius: 14,
              padding: 16,
              borderBottomWidth: 4.5,
              borderBottomColor: '#0A1430',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Trophy bg watermark */}
            <Text
              style={{
                position: 'absolute',
                right: -8,
                bottom: -20,
                fontSize: 140,
                opacity: 0.15,
              }}
            >
              🏆
            </Text>

            <Eyebrow accent color="#FF5A66">
              UNIT BOSS
            </Eyebrow>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                fontWeight: '700',
                color: '#FFFFFF',
                marginTop: 4,
                lineHeight: 26,
                letterSpacing: -0.44,
              }}
            >
              Hold short of runway 27R.
            </Text>
            <Body color="rgba(255,255,255,0.8)" style={{ fontSize: 13, marginTop: 6 }}>
              Live ATC simulation. 8 read-backs, 2 unexpected events. Pass to unlock Section 3.
            </Body>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 16 }}>🔒</Text>
              <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 12 }}>
                Complete 4 more lessons to unlock
              </Body>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sprint 12 — Unit intro modal */}
      <UnitIntroModal
        unit={activeUnit ?? null}
        visible={introOpen}
        onClose={() => {
          if (activeUnit) markUnitIntroSeen(activeUnit.id);
          setIntroOpen(false);
        }}
        onStart={() => {
          if (activeUnit) markUnitIntroSeen(activeUnit.id);
          setIntroOpen(false);
        }}
      />
    </View>
  );
}

function nodeColors(node: TreeNode): {
  bg: string;
  border: string;
  shadow: string;
  shadowOffset: number;
  fg: string;
} {
  if (node.type === 'boss' && node.state === 'locked') {
    return { bg: '#0F1E47', border: '#0F1E47', shadow: '#0A1430', shadowOffset: 4, fg: '#FFD56B' };
  }
  if (node.type === 'checkpoint' && node.state === 'done') {
    return { bg: '#F2C14E', border: '#F2C14E', shadow: '#C49B2C', shadowOffset: 4, fg: '#0A1430' };
  }
  if (node.state === 'done') {
    return { bg: '#2DBE6C', border: '#2DBE6C', shadow: '#1FA35A', shadowOffset: 4, fg: '#FFFFFF' };
  }
  if (node.state === 'current') {
    return { bg: '#E63946', border: '#E63946', shadow: '#C8202E', shadowOffset: 6, fg: '#FFFFFF' };
  }
  // locked
  return { bg: '#E9E6DD', border: '#DCE0E8', shadow: 'transparent', shadowOffset: 0, fg: '#8A93A6' };
}
