import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from '../components';
import { colors, spacing, radius } from '../theme';
import { usePermissions } from '../../App';

const FEATURES = [
  { icon: 'satellite', color: colors.primary,  title: 'Monitor',  desc: 'Qualidade do ar em tempo real por cidade',      tab: 'DashTab' },
  { icon: 'map',       color: colors.accent,   title: 'Gestão',   desc: 'Gerencie países, cidades e sensores',           tab: 'GestaoTab',  needsManage: true },
  { icon: 'bell',      color: colors.warning,  title: 'Alertas',  desc: 'Configure e visualize alertas ambientais',      tab: 'AlertasTab', needsWrite: true },
  { icon: 'users',     color: '#BF5FFF',       title: 'Usuários', desc: 'Administre contas e permissões do sistema',     tab: 'AdminTab',   needsAdmin: true },
];

const INFO_CARDS = [
  { icon: 'globe',   color: colors.accent,   title: 'Dados de Satélite', desc: 'Sentinel-5P (ESA) via OpenAQ e Open-Meteo' },
  { icon: 'sensor',  color: colors.primary,  title: 'Sensores IoT',      desc: 'ESP32 instalados localmente nas cidades' },
  { icon: 'alert',   color: colors.warning,  title: 'Alertas Inteligentes', desc: 'Notificações para populações vulneráveis' },
  { icon: 'city',    color: colors.accent,   title: 'Pequenas Cidades',  desc: 'Monitoramento acessível para todos os municípios' },
];

export default function HomeScreen({ navigation }) {
  const { canWrite, canManage, canAdmin } = usePermissions();

  const visibleFeatures = FEATURES.filter(f => {
    if (f.needsAdmin   && !canAdmin)   return false;
    if (f.needsManage  && !canManage)  return false;
    if (f.needsWrite   && !canWrite)   return false;
    return true;
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.logoRing}>
          <Icon name="satellite" size={36} color={colors.primary} strokeWidth={1.3} />
        </View>
        <Text style={s.heroTitle}>AIRWATCH</Text>
        <Text style={s.heroSub}>Monitoramento da Qualidade do Ar</Text>
      </View>

      {/* Sobre */}
      <View style={s.aboutCard}>
        <View style={s.aboutHeader}>
          <Icon name="leaf" size={14} color={colors.primary} />
          <Text style={s.aboutLabel}>  SOBRE O APP</Text>
        </View>
        <Text style={s.aboutText}>
          Plataforma que permite cidadãos, prefeituras e órgãos ambientais acompanharem a qualidade do ar em tempo real. A poluição do ar mata ~7 milhões de pessoas por ano — dados existem, mas estão dispersos e fora do alcance da população.
        </Text>
      </View>

      {/* Cards de tecnologia */}
      <Text style={s.sectionLabel}>COMO FUNCIONA</Text>
      <View style={s.infoGrid}>
        {INFO_CARDS.map((c, i) => (
          <View key={i} style={[s.infoCard, { borderColor: c.color + '33' }]}>
            <Icon name={c.icon} size={20} color={c.color} strokeWidth={1.6} />
            <Text style={s.infoTitle}>{c.title}</Text>
            <Text style={s.infoDesc}>{c.desc}</Text>
          </View>
        ))}
      </View>

      {/* Funcionalidades */}
      <Text style={s.sectionLabel}>FUNCIONALIDADES</Text>
      {visibleFeatures.map((f, i) => (
        <TouchableOpacity key={i} style={s.featureCard}
          onPress={() => navigation.navigate(f.tab)} activeOpacity={0.8}>
          <View style={[s.featureIcon, { backgroundColor: f.color + '15', borderColor: f.color + '33' }]}>
            <Icon name={f.icon} size={22} color={f.color} strokeWidth={1.6} />
          </View>
          <View style={s.featureBody}>
            <Text style={s.featureTitle}>{f.title}</Text>
            <Text style={s.featureDesc}>{f.desc}</Text>
          </View>
          <Icon name="arrow-right" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      ))}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  content:      { padding: spacing.md },

  hero:         { alignItems: 'center', paddingVertical: spacing.xl },
  logoRing:     { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  heroTitle:    { color: colors.primary, fontSize: 26, fontWeight: '800', letterSpacing: 10 },
  heroSub:      { color: colors.textSecondary, fontSize: 12, marginTop: 6, letterSpacing: 0.5 },

  aboutCard:    { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  aboutHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  aboutLabel:   { color: colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  aboutText:    { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  sectionLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2.5, marginBottom: spacing.sm, marginTop: spacing.sm },

  infoGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  infoCard:     { width: '47%', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: 6 },
  infoTitle:    { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  infoDesc:     { color: colors.textMuted, fontSize: 11, lineHeight: 16 },

  featureCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  featureIcon:  { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  featureBody:  { flex: 1 },
  featureTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  featureDesc:  { color: colors.textMuted, fontSize: 12 },
});