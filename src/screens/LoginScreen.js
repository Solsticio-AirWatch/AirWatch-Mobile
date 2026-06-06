import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { authService, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AirInput, AirButton, Icon } from '../components';
import { colors, spacing, radius } from '../theme';

const GridBg = () => (
  <Svg style={StyleSheet.absoluteFill} viewBox="0 0 360 640" preserveAspectRatio="none">
    {[...Array(9)].map((_, i) => (
      <Line key={'v' + i} x1={i * 45} y1="0" x2={i * 45} y2="640" stroke={colors.gridLine} strokeWidth="1" />
    ))}
    {[...Array(15)].map((_, i) => (
      <Line key={'h' + i} x1="0" y1={i * 45} x2="360" y2={i * 45} stroke={colors.gridLine} strokeWidth="1" />
    ))}
    <Circle cx="180" cy="260" r="120" fill="none" stroke={colors.primaryBorder} strokeWidth="1" opacity="0.3" />
    <Circle cx="180" cy="260" r="70"  fill="none" stroke={colors.primaryBorder} strokeWidth="1" opacity="0.2" />
  </Svg>
);

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = 'E-mail obrigatório';
    if (!password.trim()) e.password = 'Senha obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await authService.login({ email: email.trim(), password });
      setAuthToken(res.token);
      await login(res.token, { email: res.email, role: res.role });
    } catch (err) {
      Alert.alert('Falha no login', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GridBg />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <View style={s.logoRing}>
            <Icon name="satellite" size={36} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={s.appName}>AIRWATCH</Text>
          <View style={s.taglineRow}>
            <Icon name="leaf" size={12} color={colors.textSecondary} />
            <Text style={s.appTagline}>  Monitoramento da Qualidade do Ar</Text>
          </View>
        </View>

        <View style={s.form}>
          <AirInput label="E-mail" value={email} onChangeText={setEmail}
            placeholder="seu@email.com" keyboardType="email-address"
            autoCapitalize="none" error={errors.email} />
          <AirInput label="Senha" value={password} onChangeText={setPassword}
            placeholder="••••••••" secureTextEntry error={errors.password} />
          <AirButton title="ENTRAR" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />
          <TouchableOpacity style={s.registerLink} onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={s.registerLinkText}>
              Não tem conta?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>Grupo Solsticio · FIAP 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: colors.bg },
  content:         { flexGrow: 1, padding: spacing.md, justifyContent: 'center' },
  hero:            { alignItems: 'center', marginBottom: spacing.xl },
  logoRing:        { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  appName:         { color: colors.primary, fontSize: 28, fontWeight: '800', letterSpacing: 10 },
  taglineRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  appTagline:      { color: colors.textSecondary, fontSize: 12, letterSpacing: 0.5 },
  form:            { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  registerLink:    { alignItems: 'center', marginTop: spacing.lg },
  registerLinkText:{ color: colors.textMuted, fontSize: 14 },
  version:         { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: spacing.xl, letterSpacing: 1 },
});