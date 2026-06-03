import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { authService, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AirInput, AirButton, AirCard, SectionTitle } from '../components';
import { colors, spacing, radius } from '../theme';

const ROLES = ['USER', 'ADMIN', 'ANALYST'];

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [phone,    setPhone]    = useState('');
  const [role,     setRole]     = useState('USER');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())     e.name     = 'Nome obrigatório';
    if (!email.trim())    e.email    = 'E-mail obrigatório';
    if (!password.trim()) e.password = 'Senha obrigatória (mín. 6 chars)';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await authService.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || null, role });
      const res = await authService.login({ email: email.trim(), password });
      setAuthToken(res.token);
      await login(res.token, { email: res.email, role: res.role });
    } catch (err) {
      Alert.alert('Erro ao cadastrar', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Plataforma AirWatch — FIAP 2026</Text>

        <AirCard>
          <SectionTitle>👤 Dados Pessoais</SectionTitle>
          <AirInput label="Nome completo" value={name} onChangeText={setName}
            placeholder="Seu nome" autoCapitalize="words" error={errors.name} />
          <AirInput label="E-mail" value={email} onChangeText={setEmail}
            placeholder="seu@email.com" keyboardType="email-address"
            autoCapitalize="none" error={errors.email} />
          <AirInput label="Senha" value={password} onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres" secureTextEntry error={errors.password} />
          <AirInput label="Telefone (opcional)" value={phone} onChangeText={setPhone}
            placeholder="+55 11 99999-9999" keyboardType="phone-pad" />
        </AirCard>

        <AirCard>
          <SectionTitle>🔐 Perfil de Acesso</SectionTitle>
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <Text key={r} onPress={() => setRole(r)}
                style={[styles.roleChip, role === r && styles.roleChipActive]}>
                {r}
              </Text>
            ))}
          </View>
        </AirCard>

        <AirButton title="CRIAR CONTA" onPress={handleRegister} loading={loading} />

        <Text onPress={() => navigation.goBack()} style={styles.backLink}>
          ← Já tenho uma conta
        </Text>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:      { flex:1, backgroundColor:colors.bg },
  content:   { padding:spacing.md },
  title:     { color:colors.primary, fontSize:26, fontWeight:'800', letterSpacing:2, marginBottom:4, marginTop:spacing.lg },
  subtitle:  { color:colors.textMuted, fontSize:12, marginBottom:spacing.lg },
  roleRow:   { flexDirection:'row', flexWrap:'wrap', gap:8 },
  roleChip:  { paddingHorizontal:14, paddingVertical:8, borderRadius:radius.round, borderWidth:1, borderColor:colors.border, color:colors.textSecondary, fontSize:12, fontWeight:'700', letterSpacing:1, overflow:'hidden' },
  roleChipActive: { backgroundColor:colors.primaryGlow, borderColor:colors.primaryBorder, color:colors.primary },
  backLink:  { color:colors.primary, textAlign:'center', marginTop:spacing.lg, fontSize:14, fontWeight:'600' },
});
