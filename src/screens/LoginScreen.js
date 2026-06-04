import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { authService, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AirInput, AirButton } from '../components';
import { colors, spacing, radius } from '../theme';

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
    console.log('LOGIN ERROR:', JSON.stringify(err.message));
    Alert.alert('Falha no login', err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <Text style={styles.logoEmoji}>🛰️</Text>
          </View>
          <Text style={styles.appName}>AirWatch</Text>
          <Text style={styles.appTagline}>Monitoramento da Qualidade do Ar</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AirInput label="E-mail" value={email} onChangeText={setEmail}
            placeholder="seu@email.com" keyboardType="email-address"
            autoCapitalize="none" error={errors.email} />
          <AirInput label="Senha" value={password} onChangeText={setPassword}
            placeholder="••••••••" secureTextEntry error={errors.password} />

          <AirButton title="ENTRAR" onPress={handleLogin} loading={loading}
            style={{ marginTop: spacing.sm }} />

          <TouchableOpacity style={styles.registerLink}
            onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.registerLinkText}>
              Não tem conta?{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Grupo Solsticio · FIAP 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex:1, backgroundColor:colors.bg },
  content: { flexGrow:1, padding:spacing.md, justifyContent:'center' },
  hero:    { alignItems:'center', marginBottom:spacing.xl },
  logoRing:{ width:90, height:90, borderRadius:45, backgroundColor:colors.primaryGlow, borderWidth:2, borderColor:colors.primaryBorder, alignItems:'center', justifyContent:'center', marginBottom:spacing.md },
  logoEmoji:{ fontSize:38 },
  appName:  { color:colors.primary, fontSize:32, fontWeight:'800', letterSpacing:6 },
  appTagline:{ color:colors.textSecondary, fontSize:12, marginTop:6, letterSpacing:0.5 },
  form:        { backgroundColor:colors.bgCard, borderRadius:radius.xl, borderWidth:1, borderColor:colors.border, padding:spacing.lg },
  registerLink:{ alignItems:'center', marginTop:spacing.lg },
  registerLinkText:{ color:colors.textMuted, fontSize:14 },
  version:  { color:colors.textMuted, fontSize:10, textAlign:'center', marginTop:spacing.xl, letterSpacing:1 },
});
