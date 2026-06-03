import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, ScrollView, Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { alertConfigService, cityService, userService } from '../services/api';
import { AirButton, AirInput, SectionTitle, EmptyState, LoadingState, AirBadge, StatusDot } from '../components';
import { colors, spacing, radius } from '../theme';

const POLLUTANTS  = ['PM25','PM10','NO2','O3','CO2','AQI'];
const COMPARATORS = ['GREATER_THAN','LESS_THAN','EQUAL'];
const SEVERITIES  = ['LOW','MEDIUM','HIGH','CRITICAL'];

function ConfigModal({ visible, initial, cities, users, onClose, onSave }) {
  const [userId,         setUserId]         = useState(initial?.userId         ?? null);
  const [cityId,         setCityId]         = useState(initial?.cityId         ?? null);
  const [pollutant,      setPollutant]      = useState(initial?.pollutant      ?? 'AQI');
  const [comparator,     setComparator]     = useState(initial?.comparator     ?? 'GREATER_THAN');
  const [threshold,      setThreshold]      = useState(initial?.threshold      ? String(initial.threshold) : '');
  const [severity,       setSeverity]       = useState(initial?.severity       ?? 'MEDIUM');
  const [notifyEmail,    setNotifyEmail]    = useState(initial?.notifyEmail    !== false);
  const [notifyPush,     setNotifyPush]     = useState(initial?.notifyPush     === true);
  const [loading,        setLoading]        = useState(false);
  const [errors,         setErrors]         = useState({});

  React.useEffect(() => {
    if (visible) {
      setUserId(initial?.userId ?? null);
      setCityId(initial?.cityId ?? null);
      setPollutant(initial?.pollutant ?? 'AQI');
      setComparator(initial?.comparator ?? 'GREATER_THAN');
      setThreshold(initial?.threshold ? String(initial.threshold) : '');
      setSeverity(initial?.severity ?? 'MEDIUM');
      setNotifyEmail(initial?.notifyEmail !== false);
      setNotifyPush(initial?.notifyPush === true);
      setErrors({});
    }
  }, [visible]);

  const validate = () => {
    const e = {};
    if (!userId)         e.user      = 'Selecione um usuário';
    if (!cityId)         e.city      = 'Selecione uma cidade';
    if (!threshold)      e.threshold = 'Limite obrigatório';
    else if (isNaN(parseFloat(threshold))) e.threshold = 'Valor numérico inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        userId, cityId, pollutant, comparator,
        threshold: parseFloat(threshold),
        severity, notifyEmail, notifyPush,
      });
      onClose();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>{initial ? 'Editar Alerta' : 'Novo Alerta'}</Text>
          <ScrollView>
            {/* Usuário */}
            <SectionTitle>Usuário *</SectionTitle>
            {errors.user ? <Text style={ms.err}>{errors.user}</Text> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {users.map(u => (
                <TouchableOpacity key={u.id} onPress={() => setUserId(u.id)}
                  style={[ms.chip, userId === u.id && ms.chipActive]}>
                  <Text style={[ms.chipText, userId === u.id && ms.chipTextActive]}>{u.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Cidade */}
            <SectionTitle>Cidade *</SectionTitle>
            {errors.city ? <Text style={ms.err}>{errors.city}</Text> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {cities.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setCityId(c.id)}
                  style={[ms.chip, cityId === c.id && ms.chipActive]}>
                  <Text style={[ms.chipText, cityId === c.id && ms.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Poluente */}
            <SectionTitle>Poluente Monitorado</SectionTitle>
            <View style={ms.chips}>
              {POLLUTANTS.map(p => (
                <Text key={p} onPress={() => setPollutant(p)}
                  style={[ms.chipInline, pollutant === p && ms.chipInlineActive]}>{p}</Text>
              ))}
            </View>

            {/* Comparador */}
            <SectionTitle>Condição</SectionTitle>
            <View style={ms.chips}>
              {COMPARATORS.map(c => (
                <Text key={c} onPress={() => setComparator(c)}
                  style={[ms.chipInline, comparator === c && ms.chipInlineActive]}>
                  {c === 'GREATER_THAN' ? '>' : c === 'LESS_THAN' ? '<' : '='}
                </Text>
              ))}
            </View>

            {/* Threshold */}
            <AirInput label="Valor limite *" value={threshold} onChangeText={setThreshold}
              placeholder="Ex: 100 (AQI), 35 (PM2.5)" keyboardType="numeric"
              error={errors.threshold} />

            {/* Severidade */}
            <SectionTitle>Severidade</SectionTitle>
            <View style={ms.chips}>
              {SEVERITIES.map(s => {
                const color = s === 'CRITICAL' ? colors.danger : s === 'HIGH' ? '#FF6B35' : s === 'MEDIUM' ? colors.warning : colors.primary;
                return (
                  <Text key={s} onPress={() => setSeverity(s)}
                    style={[ms.chipInline, severity === s && { backgroundColor: color + '22', borderColor: color + '55', color }]}>
                    {s}
                  </Text>
                );
              })}
            </View>

            {/* Notificações */}
            <SectionTitle>Notificações</SectionTitle>
            <View style={ms.toggleRow}>
              <Text style={ms.toggleLabel}>Notificar por e-mail</Text>
              <Switch value={notifyEmail} onValueChange={setNotifyEmail}
                trackColor={{ false: colors.border, true: colors.primaryDim }}
                thumbColor={notifyEmail ? colors.primary : colors.textMuted} />
            </View>
            <View style={ms.toggleRow}>
              <Text style={ms.toggleLabel}>Notificação push</Text>
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

export default function AlertConfigsScreen() {
  const [configs,  setConfigs]  = useState([]);
  const [cities,   setCities]   = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState(null);
  const [modal,    setModal]    = useState({ visible: false, item: null });

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const [cfg, c, u] = await Promise.all([
        alertConfigService.getAll(),
        cityService.getAll(),
        userService.getAll(),
      ]);
      setConfigs(cfg); setCities(c); setUsers(u);
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    if (modal.item) await alertConfigService.update(modal.item.id, data);
    else            await alertConfigService.create(data);
    load();
  };

  const handleToggle = async (item) => {
    try {
      setToggling(item.id);
      await alertConfigService.toggle(item.id);
      load();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setToggling(null); }
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir Configuração', `Remover alerta de ${item.pollutant} para ${item.cityName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await alertConfigService.delete(item.id); load(); }
        catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  const severityColor = (s) => {
    switch (s) {
      case 'CRITICAL': return colors.danger;
      case 'HIGH':     return '#FF6B35';
      case 'MEDIUM':   return colors.warning;
      default:         return colors.primary;
    }
  };

  if (loading) return <LoadingState text="CARREGANDO ALERTAS..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={configs}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="NENHUMA CONFIGURAÇÃO"
            desc="Configure alertas para monitorar poluentes" />
        }
        renderItem={({ item }) => {
          const sColor = severityColor(item.severity);
          const comparatorSymbol = item.comparator === 'GREATER_THAN' ? '>' : item.comparator === 'LESS_THAN' ? '<' : '=';
          return (
            <View style={styles.card}>
              <View style={[styles.cardBar, { backgroundColor: sColor }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    <StatusDot active={item.active} />
                    <Text style={styles.pollutant}>{item.pollutant}</Text>
                    <Text style={styles.condition}>
                      {comparatorSymbol} {item.threshold}
                    </Text>
                  </View>
                  <AirBadge label={item.severity} color={sColor} bgColor={sColor + '22'} />
                </View>

                <Text style={styles.cityUser}>
                  🏙️ {item.cityName}  ·  👤 {item.userName}
                </Text>

                <View style={styles.notifRow}>
                  {item.notifyEmail && <Text style={styles.notifTag}>📧 E-mail</Text>}
                  {item.notifyPush  && <Text style={styles.notifTag}>📲 Push</Text>}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, item.active && styles.toggleBtnActive]}
                    onPress={() => handleToggle(item)}
                    disabled={toggling === item.id}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.toggleBtnText, item.active && styles.toggleBtnTextActive]}>
                      {toggling === item.id ? '...' : item.active ? 'ATIVO' : 'INATIVO'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.iconActions}>
                    <TouchableOpacity onPress={() => setModal({ visible: true, item })} style={styles.iconBtn}>
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModal({ visible: true, item: null })} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <ConfigModal
        visible={modal.visible}
        initial={modal.item}
        cities={cities}
        users={users}
        onClose={() => setModal({ visible: false, item: null })}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.bg },
  list:            { padding: spacing.md, paddingBottom: 100 },
  card:            { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  cardBar:         { width: 4 },
  cardBody:        { flex: 1, padding: spacing.md },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTopLeft:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pollutant:       { color: colors.textPrimary, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  condition:       { color: colors.textSecondary, fontSize: 13 },
  cityUser:        { color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  notifRow:        { flexDirection: 'row', gap: 8, marginBottom: 10 },
  notifTag:        { color: colors.textSecondary, fontSize: 11, backgroundColor: colors.bgMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardActions:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleBtn:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.round, borderWidth: 1, borderColor: colors.border },
  toggleBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  toggleBtnText:   { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  toggleBtnTextActive: { color: colors.primary },
  iconActions:     { flexDirection: 'row', gap: 4 },
  iconBtn:         { padding: 8 },
  fab:             { position: 'absolute', bottom: 28, right: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 14, elevation: 8 },
  fabIcon:         { color: colors.textInverse, fontSize: 28, fontWeight: '300', lineHeight: 32 },
});

const ms = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '92%' },
  title:            { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg },
  err:              { color: colors.danger, fontSize: 12, marginBottom: 8 },
  chips:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip:             { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.round, borderWidth: 1, borderColor: colors.border, marginRight: 8, marginBottom: 4 },
  chipActive:       { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  chipText:         { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive:   { color: colors.primary },
  chipInline:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.round, borderWidth: 1, borderColor: colors.border, color: colors.textSecondary, fontSize: 11, fontWeight: '700', overflow: 'hidden' },
  chipInlineActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder, color: colors.primary },
  toggleRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  toggleLabel:      { color: colors.textPrimary, fontSize: 14 },
  actions:          { flexDirection: 'row', marginTop: spacing.md },
});
