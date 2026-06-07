import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { authService, setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AirInput, AirButton, Icon } from '../components';
import { colors, spacing, radius } from '../theme';

const ROLES = [
  { value: 'CITIZEN',    label: 'Cidadão',       desc: 'Visualiza qualidade do ar',          icon: 'user',      color: colors.textSecondary },
  { value: 'TECHNICIAN', label: 'Técnico',        desc: 'Gerencia sensores e leituras',       icon: 'sensor',    color: colors.primary },
  { value: 'MANAGER',    label: 'Gerente',        desc: 'Gerencia cidades e alertas',         icon: 'map',       color: colors.accent },
  { value: 'ADMIN',      label: 'Administrador',  desc: 'Acesso total ao sistema',            icon: 'users',     color: colors.warning },
];

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('CITIZEN');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())              e.name     = 'Nome obrigatório';
    if (!email.trim())             e.email    = 'E-mail obrigatório';
    else if (!email.includes('@')) e.email    = 'E-mail inválido';
    if (!password.trim())          e.password = 'Senha obrigatória';
    else if (password.length < 6)  e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await authService.register({ name: name.trim(), email: email.trim(), password, role });
      if (res?.token) {
        setAuthToken(res.token);
        await login(res.token, { email: res.email ?? email.trim(), role: res.role ?? role });
      } else {
        Alert.alert('Conta criada!', 'Faça login para continuar.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (err) {
      Alert.alert('Erro no cadastro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Criar Conta</Text>
        <Text style={s.subtitle}>Preencha os dados para se cadastrar</Text>

        <View style={s.form}>
          <AirInput label="Nome completo" value={name} onChangeText={setName}
            placeholder="Seu nome" autoCapitalize="words" error={errors.name} />
          <AirInput label="E-mail" value={email} onChangeText={setEmail}
            placeholder="seu@email.com" keyboardType="email-address"
            autoCapitalize="none" error={errors.email} />
          <AirInput label="Senha" value={password} onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres" secureTextEntry error={errors.password} />

          <Text style={s.roleLabel}>TIPO DE PERFIL</Text>
          {ROLES.map(r => (
            <TouchableOpacity key={r.value} onPress={() => setRole(r.value)} activeOpacity={0.8}
              style={[s.roleCard, role === r.value && { borderColor: r.color, backgroundColor: r.color + '11' }]}>
              <View style={[s.roleIcon, { backgroundColor: r.color + '22', borderColor: r.color + '33' }]}>
                <Icon name={r.icon} size={18} color={r.color} strokeWidth={1.8} />
              </View>
              <View style={s.roleBody}>
                <Text style={[s.roleTitle, role === r.value && { color: r.color }]}>{r.label}</Text>
                <Text style={s.roleDesc}>{r.desc}</Text>
              </View>
              {role === r.value && <Icon name="check" size={16} color={r.color} strokeWidth={2.5} />}
            </TouchableOpacity>
          ))}

          <AirButton title="CRIAR CONTA" onPress={handleRegister} loading={loading}
            style={{ marginTop: spacing.md }} />
        </View>

        <Text style={s.loginLink}>
          Já tem conta?{' '}
          <Text style={s.loginLinkBold} onPress={() => navigation.navigate('Login')}>Entrar</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.bg },
  content:       { flexGrow: 1, padding: spacing.md, justifyContent: 'center' },
  title:         { color: colors.textPrimary, fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle:      { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xl },
  form:          { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  roleLabel:     { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.sm },
  roleCard:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.sm },
  roleIcon:      { width: 40, height: 40, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  roleBody:      { flex: 1 },
  roleTitle:     { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  roleDesc:      { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  loginLink:     { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.lg },
  loginLinkBold: { color: colors.primary, fontWeight: '700' },
});