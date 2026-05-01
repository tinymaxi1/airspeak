/**
 * Detaylı istatistik info kartları.
 *
 * - GoalsCard: 3 progress bar (daily/weekly/monthly) — edit butonu opsiyonel.
 * - PeerCard: role+level grubunda percentile + motivasyonel mesaj.
 * - MonthlyCards: son 3 ay özet (lessons, xp, accuracy).
 */
import { View, Text, TouchableOpacity } from 'react-native';
import type { GoalsProgress, PeerComparison, MonthlyStat } from '@/features/stats/api';
import { FONTS, Mono, Body } from '@/components/airspeak';

// ═══════════════════════════════════════════════════════════════════════
// GoalsCard
// ═══════════════════════════════════════════════════════════════════════
export function GoalsCard({
  goals,
  onEdit,
}: {
  goals: GoalsProgress;
  onEdit?: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        padding: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2 }}>
          🎯 HEDEFLER
        </Mono>
        {onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 1 }}>DÜZENLE</Mono>
          </TouchableOpacity>
        )}
      </View>

      <GoalRow
        label="BUGÜN"
        progress={goals.daily_progress_pct}
        current={goals.today_minutes}
        target={goals.daily_goal_minutes}
        unit="dk"
        color="#E63946"
      />
      <GoalRow
        label="BU HAFTA"
        progress={goals.weekly_progress_pct}
        current={goals.week_xp}
        target={goals.weekly_goal_xp}
        unit="XP"
        color="#F2C14E"
      />
      <GoalRow
        label="BU AY"
        progress={goals.monthly_progress_pct}
        current={goals.month_lessons}
        target={goals.monthly_goal_lessons}
        unit="ders"
        color="#2DBE6C"
        last
      />
    </View>
  );
}

function GoalRow({
  label,
  progress,
  current,
  target,
  unit,
  color,
  last,
}: {
  label: string;
  progress: number;
  current: number;
  target: number;
  unit: string;
  color: string;
  last?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, progress));
  const reached = pct >= 100;
  return (
    <View style={{ marginBottom: last ? 0 : 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Mono style={{ fontSize: 10, color: '#0E1116', letterSpacing: 1 }}>
          {label} {reached ? '✓' : ''}
        </Mono>
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 0.8 }}>
          {current.toLocaleString('tr-TR')} / {target.toLocaleString('tr-TR')} {unit}
        </Mono>
      </View>
      <View
        style={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#EDEFF3',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 5,
          }}
        />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PeerCard
// ═══════════════════════════════════════════════════════════════════════
export function PeerCard({ peer }: { peer: PeerComparison }) {
  const weekPct = Math.round(peer.week_xp_percentile);
  const motivational = makePeerMessage(weekPct, peer.peer_count, peer.role, peer.level);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        padding: 16,
      }}
    >
      <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2, marginBottom: 12 }}>
        👥 AKRAN KIYASLAMASI
      </Mono>

      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 56,
            fontWeight: '700',
            color: '#0E1116',
            lineHeight: 60,
          }}
        >
          %{weekPct}
        </Text>
        <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 1, marginTop: 4 }}>
          BU HAFTA XP'YE GÖRE TOP %{Math.max(1, 100 - weekPct)}
        </Mono>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: '#EDEFF3',
        }}
      >
        <PercentileChip
          label="TOPLAM XP"
          pct={Math.round(peer.total_xp_percentile)}
        />
        <PercentileChip
          label="STREAK"
          pct={Math.round(peer.streak_percentile)}
        />
      </View>

      <Body color="#5A6478" style={{ fontSize: 12, marginTop: 12, fontStyle: 'italic', lineHeight: 17 }}>
        {motivational}
      </Body>
    </View>
  );
}

function PercentileChip({ label, pct }: { label: string; pct: number }) {
  const tone = pct >= 75 ? '#2DBE6C' : pct >= 50 ? '#F2C14E' : '#E63946';
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: `${tone}11`,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: FONTS.body800, fontSize: 18, color: tone }}>%{pct}</Text>
      <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9, marginTop: 2 }}>
        {label}
      </Mono>
    </View>
  );
}

function makePeerMessage(pct: number, peerCount: number, role: string, level: string): string {
  const peerLabel = `${role.toUpperCase()} · ${level}`;
  if (peerCount < 5) {
    return `Bu ay ${peerLabel} grubunda ${peerCount} pilot var. Daha çok kıyaslama için topluluk büyüyor.`;
  }
  if (pct >= 90) {
    return `🔥 Olağanüstü! ${peerLabel} grubunda zirvedeki ilk %10'dasın. Yeni hedefler için aim for L${Number(level.replace(/\D/g, '')) + 1 || 5}.`;
  }
  if (pct >= 75) {
    return `Çok iyi gidiyorsun. ${peerLabel} grubunun üst %25'indesin. Zirveye az kaldı.`;
  }
  if (pct >= 50) {
    return `Ortalamanın üstündesin (${peerLabel}). Hız kesme — biraz daha tempo ile top %25'e ulaşırsın.`;
  }
  if (pct >= 25) {
    return `${peerLabel} grubunun ortalamasına yaklaştın. Haftalık 200 XP fazla ile üst yarıya geç.`;
  }
  return `Bu hafta sessizce başla — küçük adımlarla 7 gün içinde grubun ortalamasını yakalarsın.`;
}

// ═══════════════════════════════════════════════════════════════════════
// MonthlyCards
// ═══════════════════════════════════════════════════════════════════════
export function MonthlyCards({ rows }: { rows: MonthlyStat[] }) {
  // Son 3 ay (en yeni en sağda — rows artan sırada)
  const recent = rows.slice(-3).reverse();

  if (recent.length === 0) {
    return (
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#DCE0E8',
          padding: 16,
        }}
      >
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2 }}>📅 AYLIK ÖZET</Mono>
        <Body color="#8A93A6" style={{ fontSize: 12, marginTop: 8 }}>
          Henüz aylık veri yok.
        </Body>
      </View>
    );
  }

  return (
    <View>
      <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2, marginBottom: 8 }}>
        📅 SON {recent.length} AYIN ÖZETİ
      </Mono>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {recent.map((r, i) => {
          const d = new Date(r.month_start);
          const monthLabel = d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
          return (
            <View
              key={r.month_start}
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: i === 0 ? '#E63946' : '#DCE0E8',
                padding: 12,
              }}
            >
              <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1, marginBottom: 6 }}>
                {monthLabel.toUpperCase()}
              </Mono>
              <Text style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: '700', color: '#0E1116' }}>
                {r.total_xp.toLocaleString('tr-TR')}
              </Text>
              <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9, marginTop: 2 }}>
                XP
              </Mono>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <Mono style={{ fontSize: 10, color: '#5A6478' }}>
                  📚 {r.lessons_count}
                </Mono>
                {r.accuracy_avg !== null && (
                  <Mono style={{ fontSize: 10, color: '#5A6478' }}>
                    🎯 {Math.round(r.accuracy_avg)}%
                  </Mono>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
