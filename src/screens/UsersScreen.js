import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, ScrollView, Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { userService } from '../services/api';
import { AirButton, AirInput, SectionTitle, EmptyState, LoadingState, AirBadge, StatusDot } from '../components';
import { colors, spacing, radius } from '../theme';

const ROLES = ['USER', 'ADMIN', 'ANALYST'];

function UserEditModal({ visible, initial, onClose, onSave }) {
  const [name,         setName]         = useState(initial?.name         ?? '');
  const [phone,        setPhone]        = useState(initial?.phone        ?? '');
  const [role,         setRole]         = useState(initial?.role         ?? 'USER');
  const [isActive,     setIsActive]     = useState(initial?.isActive     !== false);
  const [notifyEmail,  setNotifyEmail]  = useState(initial?.notifyEmail  !== false);
  const [notifyPush,   setNotifyPush]   = useState(initial?.notifyPush   === true);
  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState({});

  React.useEffect(() => {
    if (visible && initial) {
      setName(initial.name ?? '');
      setPhone(initial.phone ?? '');
      setRole(initial.role ?? 'USER');
      setIsActive(initial.isActive !== false);
      setNotifyEmail(initial.notifyEmail !== false);
      setNotifyPush(initial.notifyPush === true);
      setErrors({});
    }
  }, [visible]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Nome obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim() || null,
        role,
        isActive,
        notifyEmail,
        notifyPush,
      });
      onClose();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>Editar Usuário</Text>
          <ScrollView>
            <AirInput label="Nome" value={name} onChangeText={setName}
              placeholder="Nome do usuário" autoCapitalize="words" error={errors.name} />
            <AirInput label="Telefone (opcional)" value={phone} onChangeText={setPhone}
              placeholder="+55 11 99999-9999" keyboardType="phone-pad" />

            <SectionTitle>Perfil de Acesso</SectionTitle>
            <View style={ms.chips}>
              {ROLES.map(r => (
                <Text key={r} onPress={() => setRole(r)}
                  style={[ms.chipInline, role === r && ms.chipInlineActive]}>{r}</Text>
              ))}
            </View>

            <SectionTitle>Status & Notificações</SectionTitle>
            <View style={ms.toggleRow}>
              <Text style={ms.toggleLabel}>Conta ativa</Text>
              <Switch value={isActive} onValueChange={setIsActive}
                trackColor={{ false: colors.border, true: colors.primaryDim }}
                thumbColor={isActive ? colors.primary : colors.textMuted} />
            </View>
            <View style={ms.toggleRow}>
              <Text style={ms.toggleLabel}>Notificar por e-mail</Text>
              <Switch value={notifyEmail} onValueChange={setNotifyEmail}
                trackColor={{ false: colors.border, true: colors.primaryDim }}
                thumbColor={notifyEmail ? colors.primary : colors.textMuted} />
            </View>
            <View style={ms.toggleRow}>
              <Text style={ms.toggleLabel}>Notificações push</Text>
              <Switch value={notifyPush} onValueChange={setNotifyPush}
                trackColor={{ false: colors.border, true: colors.primaryDim }}
                thumbColor={notifyPush ? colors.primary : colors.textMuted} />
            </View>
          </ScrollView>

          <View style={ms.actions}>
            <AirButton title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <View style={{ width: 8 }} />
            <AirButton title="Salvar" onPress={handleSave} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function UsersScreen() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState({ visible: false, item: null });

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      setUsers(await userService.getAll());
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    await userService.update(modal.item.id, data);
    load();
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir Usuário', `Remover "${item.name}" do sistema?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await userService.delete(item.id); load(); }
        catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  const roleColor = (r) => {
    switch (r) {
      case 'ADMIN':   return colors.warning;
      case 'ANALYST': return colors.accent;
      default:        return colors.primary;
    }
  };

  if (loading) return <LoadingState text="CARREGANDO USUÁRIOS..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="👥" title="NENHUM USUÁRIO"
            desc="Cadastre usuários via tela de registro" />
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={[styles.cardBar, { backgroundColor: item.isActive !== false ? colors.primary : colors.danger }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View style={styles.cardTopLeft}>
                  <StatusDot active={item.isActive !== false} />
                  <Text style={styles.index}>#{String(index + 1).padStart(3, '0')}</Text>
                </View>
                <AirBadge label={item.role ?? 'USER'}
                  color={roleColor(item.role)}
                  bgColor={roleColor(item.role) + '22'} />
              </View>

              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>

              <View style={styles.notifRow}>
                {item.notifyEmail && <Text style={styles.notifTag}>📧 E-mail</Text>}
                {item.notifyPush  && <Text style={styles.notifTag}>📲 Push</Text>}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn}
                  onPress={() => setModal({ visible: true, item })} activeOpacity={0.7}>
                  <Text style={styles.editBtnText}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn}
                  onPress={() => handleDelete(item)} activeOpacity={0.7}>
                  <Text style={styles.deleteBtnText}>🗑️ Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <UserEditModal
        visible={modal.visible}
        initial={modal.item}
        onClose={() => setModal({ visible: false, item: null })}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  list:         { padding: spacing.md, paddingBottom: 80 },
  card:         { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  cardBar:      { width: 4 },
  cardBody:     { flex: 1, padding: spacing.md },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTopLeft:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  index:        { color: colors.textMuted, fontSize: 11, letterSpacing: 1 },
  name:         { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  email:        { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  notifRow:     { flexDirection: 'row', gap: 8, marginBottom: 10 },
  notifTag:     { color: colors.textSecondary, fontSize: 11, backgroundColor: colors.bgMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardActions:  { flexDirection: 'row', gap: 8 },
  editBtn:      { flex: 1, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primaryBorder, alignItems: 'center' },
  editBtnText:  { color: colors.primary, fontSize: 12, fontWeight: '700' },
  deleteBtn:    { flex: 1, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(255,77,106,0.3)', alignItems: 'center' },
  deleteBtnText:{ color: colors.danger, fontSize: 12, fontWeight: '700' },
});

const ms = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '85%' },
  title:            { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg },
  chips:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chipInline:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.round, borderWidth: 1, borderColor: colors.border, color: colors.textSecondary, fontSize: 11, fontWeight: '700', overflow: 'hidden' },
  chipInlineActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder, color: colors.primary },
  toggleRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  toggleLabel:      { color: colors.textPrimary, fontSize: 14 },
  actions:          { flexDirection: 'row', marginTop: spacing.md },
});
