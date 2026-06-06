import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { colors, spacing, radius } from '../theme';

export const Icon = ({ name, size = 20, color = colors.primary, strokeWidth = 1.8 }) => {
  const s = { width: size, height: size };
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'satellite':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M13 11l9-9M6.5 6.5l11 11M2 2l4 4M18 18l4 4M9 4l-5 5 7 7 5-5-7-7zM4 16l4 4" /></Svg>;
    case 'globe':
      return <Svg viewBox="0 0 24 24" {...s}><Circle {...p} cx="12" cy="12" r="10"/><Line {...p} x1="2" y1="12" x2="22" y2="12"/><Path {...p} d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Svg>;
    case 'city':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 9h1v1H9zm0 4h1v1H9zm5-4h1v1h-1zm0 4h1v1h-1z"/></Svg>;
    case 'sensor':
      return <Svg viewBox="0 0 24 24" {...s}><Circle {...p} cx="12" cy="12" r="3"/><Path {...p} d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M3.5 3.5a13 13 0 0 0 0 17M20.5 3.5a13 13 0 0 1 0 17"/></Svg>;
    case 'chart':
      return <Svg viewBox="0 0 24 24" {...s}><Line {...p} x1="18" y1="20" x2="18" y2="10"/><Line {...p} x1="12" y1="20" x2="12" y2="4"/><Line {...p} x1="6" y1="20" x2="6" y2="14"/></Svg>;
    case 'alert':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><Line {...p} x1="12" y1="9" x2="12" y2="13"/><Line {...p} x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
    case 'bell':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></Svg>;
    case 'users':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><Circle {...p} cx="9" cy="7" r="4"/><Path {...p} d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
    case 'user':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><Circle {...p} cx="12" cy="7" r="4"/></Svg>;
    case 'map':
      return <Svg viewBox="0 0 24 24" {...s}><Polyline {...p} points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><Line {...p} x1="9" y1="3" x2="9" y2="18"/><Line {...p} x1="15" y1="6" x2="15" y2="21"/></Svg>;
    case 'location':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><Circle {...p} cx="12" cy="10" r="3"/></Svg>;
    case 'edit':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><Path {...p} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>;
    case 'trash':
      return <Svg viewBox="0 0 24 24" {...s}><Polyline {...p} points="3 6 5 6 21 6"/><Path {...p} d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/><Path {...p} d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Svg>;
    case 'arrow-right':
      return <Svg viewBox="0 0 24 24" {...s}><Line {...p} x1="5" y1="12" x2="19" y2="12"/><Polyline {...p} points="12 5 19 12 12 19"/></Svg>;
    case 'arrow-left':
      return <Svg viewBox="0 0 24 24" {...s}><Line {...p} x1="19" y1="12" x2="5" y2="12"/><Polyline {...p} points="12 19 5 12 12 5"/></Svg>;
    case 'check':
      return <Svg viewBox="0 0 24 24" {...s}><Polyline {...p} points="20 6 9 17 4 12"/></Svg>;
    case 'leaf':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><Path {...p} d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></Svg>;
    case 'logout':
      return <Svg viewBox="0 0 24 24" {...s}><Path {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><Polyline {...p} points="16 17 21 12 16 7"/><Line {...p} x1="21" y1="12" x2="9" y2="12"/></Svg>;
    case 'readings':
      return <Svg viewBox="0 0 24 24" {...s}><Polyline {...p} points="22 12 18 12 15 21 9 3 6 12 2 12"/></Svg>;
    default:
      return <Svg viewBox="0 0 24 24" {...s}><Circle {...p} cx="12" cy="12" r="10"/></Svg>;
  }
};

export const AirButton = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  const isDanger    = variant === 'danger';
  const isSecondary = variant === 'secondary';
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.75}
      style={[s.btn, isDanger && s.btnDanger, isSecondary && s.btnSecondary, (disabled || loading) && s.btnDisabled, style]}>
      {loading
        ? <ActivityIndicator size="small" color={isDanger ? colors.danger : colors.textInverse} />
        : <Text style={[s.btnText, isDanger && s.btnTextDanger, isSecondary && s.btnTextSecondary]}>{title}</Text>}
    </TouchableOpacity>
  );
};

export const AirInput = ({ label, error, containerStyle, ...props }) => (
  <View style={[s.inputWrap, containerStyle]}>
    {label ? <Text style={s.inputLabel}>{label}</Text> : null}
    <TextInput placeholderTextColor={colors.textMuted} style={[s.input, error && s.inputErr]} {...props} />
    {error ? <Text style={s.inputErrText}>{error}</Text> : null}
  </View>
);

export const AirCard = ({ children, style }) => (
  <View style={[s.card, style]}>{children}</View>
);

export const AirBadge = ({ label, color, bgColor }) => (
  <View style={[s.badge, { backgroundColor: bgColor || colors.primaryGlow, borderColor: color || colors.primaryBorder }]}>
    <Text style={[s.badgeText, { color: color || colors.primary }]}>{label}</Text>
  </View>
);

export const StatusDot = ({ active }) => (
  <View style={[s.dot, { backgroundColor: active ? colors.primary : colors.danger }]} />
);

export const Divider = () => <View style={s.divider} />;

export const SectionTitle = ({ children, icon }) => (
  <View style={s.sectionRow}>
    {icon && <Icon name={icon} size={13} color={colors.textSecondary} strokeWidth={2} />}
    <Text style={[s.sectionTitle, icon && { marginLeft: 6 }]}>{children}</Text>
  </View>
);

export const InfoRow = ({ label, value }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value ?? '—'}</Text>
  </View>
);

export const EmptyState = ({ iconName = 'sensor', title, desc }) => (
  <View style={s.empty}>
    <View style={s.emptyIconWrap}>
      <Icon name={iconName} size={28} color={colors.textMuted} />
    </View>
    <Text style={s.emptyTitle}>{title}</Text>
    {desc ? <Text style={s.emptyDesc}>{desc}</Text> : null}
  </View>
);

export const LoadingState = ({ text = 'CARREGANDO...' }) => (
  <View style={s.centered}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={s.loadingText}>{text}</Text>
  </View>
);

const s = StyleSheet.create({
  btn:              { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: spacing.lg, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  btnDanger:        { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
  btnSecondary:     { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primaryBorder },
  btnDisabled:      { opacity: 0.4 },
  btnText:          { color: colors.textInverse, fontWeight: '700', fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' },
  btnTextDanger:    { color: colors.danger },
  btnTextSecondary: { color: colors.primary },
  inputWrap:        { marginBottom: spacing.md },
  inputLabel:       { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.xs },
  input:            { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13, color: colors.textPrimary, fontSize: 15 },
  inputErr:         { borderColor: colors.danger },
  inputErrText:     { color: colors.danger, fontSize: 12, marginTop: 4 },
  card:             { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.round, borderWidth: 1 },
  badgeText:        { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  dot:              { width: 8, height: 8, borderRadius: 4 },
  divider:          { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle:     { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2.5, textTransform: 'uppercase' },
  infoRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel:        { color: colors.textMuted, fontSize: 12 },
  infoValue:        { color: colors.textPrimary, fontSize: 12, flex: 2, textAlign: 'right' },
  empty:            { alignItems: 'center', paddingVertical: 60 },
  emptyIconWrap:    { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.bgMuted, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:       { color: colors.textMuted, fontSize: 11, letterSpacing: 3, fontWeight: '700' },
  emptyDesc:        { color: colors.textMuted, fontSize: 11, marginTop: 6, opacity: 0.7, textAlign: 'center' },
  centered:         { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:      { color: colors.textSecondary, fontSize: 11, letterSpacing: 3 },
});