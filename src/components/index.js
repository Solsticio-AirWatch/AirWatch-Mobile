import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

export const AirButton = ({ title, onPress, variant='primary', loading=false, disabled=false, style }) => {
  const isDanger    = variant === 'danger';
  const isSecondary = variant === 'secondary';
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled||loading} activeOpacity={0.75}
      style={[s.btn, isDanger&&s.btnDanger, isSecondary&&s.btnSecondary, (disabled||loading)&&s.btnDisabled, style]}>
      {loading
        ? <ActivityIndicator size="small" color={isDanger ? colors.danger : colors.textInverse} />
        : <Text style={[s.btnText, isDanger&&s.btnTextDanger, isSecondary&&s.btnTextSecondary]}>{title}</Text>}
    </TouchableOpacity>
  );
};

export const AirInput = ({ label, error, containerStyle, ...props }) => (
  <View style={[s.inputWrap, containerStyle]}>
    {label ? <Text style={s.inputLabel}>{label}</Text> : null}
    <TextInput placeholderTextColor={colors.textMuted}
      style={[s.input, error && s.inputErr]} {...props} />
    {error ? <Text style={s.inputErrText}>{error}</Text> : null}
  </View>
);

export const AirCard = ({ children, style }) => (
  <View style={[s.card, style]}>{children}</View>
);

export const AirBadge = ({ label, color, bgColor }) => (
  <View style={[s.badge, { backgroundColor: bgColor||colors.primaryGlow, borderColor: color||colors.primaryBorder }]}>
    <Text style={[s.badgeText, { color: color||colors.primary }]}>{label}</Text>
  </View>
);

export const StatusDot = ({ active }) => (
  <View style={[s.dot, { backgroundColor: active ? colors.primary : colors.danger }]} />
);

export const Divider = () => <View style={s.divider} />;

export const SectionTitle = ({ children }) => <Text style={s.sectionTitle}>{children}</Text>;

export const InfoRow = ({ label, value }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value ?? '—'}</Text>
  </View>
);

export const EmptyState = ({ icon='🛰️', title, desc }) => (
  <View style={s.empty}>
    <Text style={s.emptyIcon}>{icon}</Text>
    <Text style={s.emptyTitle}>{title}</Text>
    {desc ? <Text style={s.emptyDesc}>{desc}</Text> : null}
  </View>
);

export const LoadingState = ({ text='CARREGANDO...' }) => (
  <View style={s.centered}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={s.loadingText}>{text}</Text>
  </View>
);

const s = StyleSheet.create({
  btn:            { backgroundColor:colors.primary, paddingVertical:14, paddingHorizontal:spacing.lg, borderRadius:radius.md, alignItems:'center', justifyContent:'center', minHeight:50 },
  btnDanger:      { backgroundColor:'transparent', borderWidth:1, borderColor:colors.danger },
  btnSecondary:   { backgroundColor:'transparent', borderWidth:1, borderColor:colors.primaryBorder },
  btnDisabled:    { opacity:0.4 },
  btnText:        { color:colors.textInverse, fontWeight:'700', fontSize:13, letterSpacing:1.5, textTransform:'uppercase' },
  btnTextDanger:  { color:colors.danger },
  btnTextSecondary:{ color:colors.primary },

  inputWrap:    { marginBottom:spacing.md },
  inputLabel:   { color:colors.textSecondary, fontSize:11, fontWeight:'600', letterSpacing:2, textTransform:'uppercase', marginBottom:spacing.xs },
  input:        { backgroundColor:colors.bgInput, borderWidth:1, borderColor:colors.border, borderRadius:radius.md, paddingHorizontal:spacing.md, paddingVertical:13, color:colors.textPrimary, fontSize:15 },
  inputErr:     { borderColor:colors.danger },
  inputErrText: { color:colors.danger, fontSize:12, marginTop:4 },

  card:    { backgroundColor:colors.bgCard, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing.md, marginBottom:spacing.md },
  badge:   { paddingHorizontal:10, paddingVertical:4, borderRadius:radius.round, borderWidth:1 },
  badgeText:{ fontSize:10, fontWeight:'700', letterSpacing:1.5, textTransform:'uppercase' },
  dot:     { width:8, height:8, borderRadius:4 },
  divider: { height:1, backgroundColor:colors.border, marginVertical:spacing.md },
  sectionTitle: { color:colors.textSecondary, fontSize:10, fontWeight:'700', letterSpacing:2.5, textTransform:'uppercase', marginBottom:spacing.md },

  infoRow:   { flexDirection:'row', justifyContent:'space-between', paddingVertical:9, borderBottomWidth:1, borderBottomColor:colors.borderLight },
  infoLabel: { color:colors.textMuted, fontSize:12 },
  infoValue: { color:colors.textPrimary, fontSize:12, flex:2, textAlign:'right' },

  empty:      { alignItems:'center', paddingVertical:60 },
  emptyIcon:  { fontSize:40, marginBottom:12 },
  emptyTitle: { color:colors.textMuted, fontSize:12, letterSpacing:3 },
  emptyDesc:  { color:colors.textMuted, fontSize:11, marginTop:6, opacity:0.7, textAlign:'center' },

  centered:    { flex:1, backgroundColor:colors.bg, alignItems:'center', justifyContent:'center', gap:12 },
  loadingText: { color:colors.textSecondary, fontSize:11, letterSpacing:3 },
});
