import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { authService } from '../services/api';
import { AirInput, AirButton } from '../components';
import { colors, spacing, radius } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim())              e.email    = 'E-mail obrigatório';
    else if (!email.includes('@'))  e.email    = 'E-mail inválido';
    if (!password.trim())           e.password = 'Senha obrigatória';
    else if (password.length < 6)   e.password = 'Mínimo 6 caracteres';
    if (!confirm.trim())            e.confirm  = 'Confirme a senha';
    else if (confirm !== password)  e.confirm  = 'As senhas não coincidem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await authService.register({ email: email.trim(), password });
      Alert.alert('Conta criada!', 'Faça login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
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
        <Text style={s.subtitle}>Preencha os dados para se cadastrar na plataforma</Text>

        <View style={s.form}>
          <AirInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <AirInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={errors.password}
          />
          <AirInput
            label="Confirmar Senha"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repita a senha"
            secureTextEntry
            error={errors.confirm}
          />
          <AirButton
            title="CRIAR CONTA"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <Text style={s.loginLink}>
          Já tem conta?{' '}
          <Text style={s.loginLinkBold} onPress={() => navigation.navigate('Login')}>
            Entrar
          </Text>
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
  loginLink:     { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.lg },
  loginLinkBold: { color: colors.primary, fontWeight: '700' },
});