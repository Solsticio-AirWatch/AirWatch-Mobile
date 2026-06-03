import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { alertEventService, cityService, userService, alertConfigService } from '../services/api';
import { AirButton, AirInput, SectionTitle, EmptyState, LoadingState, AirBadge } from '../components';
import { colors, spacing, radius } from '../theme';

const STATUSES   = ['PENDING','SENT','IGNORED'];
const SEVERITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

const statusColor = (s) => {
  switch (s) {
    case 'SENT':    return colors.primary;
    case 'IGNORED': return colors.textMuted;
    default:        return colors.warning;   // PENDING
  }
};

const severityColor = (s) => {
  switch (s) {
    case 'CRITICAL': return colors.danger;
    case 'HIGH':     return '#FF6B35';
    case 'MEDIUM':   return colors.warning;
    default:         return colors.primary;
  }
};

function EventModal({ visible, cities, users, configs, onClose, onSave }) {
  const [cityId,      setCityId]      = useState(null);
  const [userId,      setUserId]      = useState(null);
  const [configId,    setConfigId]    = useState(null);
  const [message,     setMessage]     = useState('');
  const [severity,    setSeverity]    = useState('MEDIUM');
  const [status,      setStatus]      = useState('PENDING');
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});

  React.useEffect(() => {
    if (visible) {
      setCityId(null); setUserId(null); setConfigId(null);
      setMessage(''); setSeverity('MEDIUM'); setStatus('PENDING'); setErrors({});
    }
  }, [visible]);

  const validate = () => {
    const e = {};
    if (!cityId)       e.city    = 'Selecione uma cidade';
    if (!userId)       e.user    = 'Selecione um usuário';
    if (!message.trim()) e.message = 'Mensagem obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        cityId, userId,
        alertConfigId: configId || null,
        message: message.trim(),
        severity, status,
        triggeredAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>Novo Evento de Alerta</Text>
          <ScrollView>
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

            {configs.length > 0 && (
              <>
                <SectionTitle>Configuração de Alerta (opcional)</SectionTitle>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                  {configs.map(c => (
                    <TouchableOpacity key={c.id} onPress={() => setConfigId(c.id)}
                      style={[ms.chip, configId === c.id && ms.chipActive]}>
                      <Text style={[ms.chipText, configId === c.id && ms.chipTextActive]}>
                        {c.pollutant} {c.comparator === 'GREATER_THAN' ? '>' : '<'} {c.threshold}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <AirInput label="Mensagem do alerta *" value={message} onChangeText={setMessage}
              placeholder="Ex: Qualidade do ar atingiu nível crítico em São Paulo"
              multiline numberOfLines={3} error={errors.message}
              containerStyle={{ marginBottom: spacing.md }} />

            <SectionTitle>Severidade</SectionTitle>
            <View style={ms.chips}>
              {SEVERITIES.map(s => {
                const c = severityColor(s);
                return (
                  <Text key={s} onPress={() => setSeverity(s)}
                    style={[ms.chipInline, severity === s && { backgroundColor: c + '22', borderColor: c + '55', color: c }]}>
                    {s}
                  </Text>
                );
              })}
            </View>

            <SectionTitle>Status Inicial</SectionTitle>
            <View style={ms.chips}>
              {STATUSES.map(s => (
                <Text key={s} onPress={() => setStatus(s)}
                  style={[ms.chipInline, status === s && ms.chipInlineActive]}>{s}</Text>
              ))}
            </View>
          </ScrollView>

          <View style={ms.actions}>
            <AirButton title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <View style={{ width: 8 }} />
            <AirButton title="Criar Evento" onPress={handleSave} loading={loading} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AlertEventsScreen({ route }) {
  const cityFilter = route?.params?.city ?? null;
  const [events,   setEvents]   = useState([]);
  const [cities,   setCities]   = useState([]);
  const [users,    setUsers]    = useState([]);
  const [configs,  setConfigs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);
  const [modal,    setModal]    = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const [ev, c, u, cfg] = await Promise.all([
        cityFilter ? alertEventService.getByCity(cityFilter.id) : alertEventService.getAll(),
        cityService.getAll(),
        userService.getAll(),
        alertConfigService.getAll(),
      ]);
      setEvents(ev); setCities(c); setUsers(u); setConfigs(cfg);
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  const handleMarkSent = async (item) => {
    try {
      setActing(item.id);
      await alertEventService.markAsSent(item.id);
      load();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setActing(null); }
  };

  const handleMarkIgnored = async (item) => {
    try {
      setActing(item.id);
      await alertEventService.markAsIgnored(item.id);
      load();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setActing(null); }
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir Evento', `Remover este evento de alerta?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await alertEventService.delete(item.id); load(); }
        catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  if (loading) return <LoadingState text="CARREGANDO EVENTOS..." />;

  return (
    <View style={styles.container}>
      {cityFilter && <Text style={styles.filterLabel}>📍 {cityFilter.name}</Text>}

      <FlatList
        data={events}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="🔕" title="NENHUM EVENTO" desc="Nenhum alerta disparado ainda" />
        }
        renderItem={({ item }) => {
          const sColor  = statusColor(item.status);
          const svColor = severityColor(item.severity);
          const isActing = acting === item.id;
          return (
            <View style={styles.card}>
              <View style={[styles.cardBar, { backgroundColor: svColor }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <AirBadge label={item.status}   color={sColor}  bgColor={sColor  + '22'} />
                  <AirBadge label={item.severity} color={svColor} bgColor={svColor + '22'} />
                </View>

                <Text style={styles.message}>{item.message}</Text>

                <Text style={styles.meta}>
                  🏙️ {item.cityName ?? '—'}  ·  👤 {item.userName ?? '—'}
                </Text>
                {item.triggeredAt && (
                  <Text style={styles.date}>
                    {new Date(item.triggeredAt).toLocaleString('pt-BR')}
                  </Text>
                )}

                {item.status === 'PENDING' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.sentBtn} disabled={isActing}
                      onPress={() => handleMarkSent(item)} activeOpacity={0.8}>
                      <Text style={styles.sentBtnText}>{isActing ? '...' : '✅ Marcar Enviado'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ignoreBtn} disabled={isActing}
                      onPress={() => handleMarkIgnored(item)} activeOpacity={0.8}>
                      <Text style={styles.ignoreBtnText}>{isActing ? '...' : '🔕 Ignorar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn}
                      onPress={() => handleDelete(item)}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status !== 'PENDING' && (
                  <View style={styles.actionRow}>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.deleteIconBtn}
                      onPress={() => handleDelete(item)}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <EventModal
        visible={modal}
        cities={cities}
        users={users}
        configs={configs}
        onClose={() => setModal(false)}
        onSave={async (d) => { await alertEventService.create(d); load(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.bg },
  filterLabel: { color: colors.accent, fontSize: 12, fontWeight: '600', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  list:        { padding: spacing.md, paddingBottom: 100 },
  card:        { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  cardBar:     { width: 4 },
  cardBody:    { flex: 1, padding: spacing.md },
  cardTop:     { flexDirection: 'row', gap: 8, marginBottom: 8 },
  message:     { color: colors.textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  meta:        { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  date:        { color: colors.textMuted, fontSize: 11, marginBottom: 8 },
  actionRow:   { flexDirection: 'row', gap: 8, alignItems: 'center' },
  sentBtn:     { flex: 1, backgroundColor: colors.primaryGlow, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primaryBorder, paddingVertical: 7, alignItems: 'center' },
  sentBtnText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  ignoreBtn:   { flex: 1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 7, alignItems: 'center' },
  ignoreBtnText:{ color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  deleteIconBtn:{ padding: 8 },
  fab:         { position: 'absolute', bottom: 28, right: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 14, elevation: 8 },
  fabIcon:     { color: colors.textInverse, fontSize: 28, fontWeight: '300', lineHeight: 32 },
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
  actions:          { flexDirection: 'row', marginTop: spacing.md },
});
