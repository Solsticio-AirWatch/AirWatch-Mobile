import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { sensorService, cityService } from '../services/api';
import { AirButton, AirInput, SectionTitle, EmptyState, LoadingState, AirBadge, Icon } from '../components';
import { colors, spacing, radius } from '../theme';

const SENSOR_TYPES    = ['IoT', 'Satellite', 'Government', 'OpenAQ'];
const SENSOR_STATUSES = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

function SensorModal({ visible, initial, cities, onClose, onSave }) {
  const [cityId,   setCityId]   = useState(initial?.cityId   ?? null);
  const [name,     setName]     = useState(initial?.name     ?? '');
  const [type,     setType]     = useState(initial?.type     ?? 'IoT');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [source,   setSource]   = useState(initial?.source   ?? '');
  const [status,   setStatus]   = useState(initial?.status   ?? 'ACTIVE');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  React.useEffect(() => {
    if (visible) {
      setCityId(initial?.cityId ?? null);
      setName(initial?.name ?? '');
      setType(initial?.type ?? 'IoT');
      setLocation(initial?.location ?? '');
      setSource(initial?.source ?? '');
      setStatus(initial?.status ?? 'ACTIVE');
      setErrors({});
    }
  }, [visible]);

  const validate = () => {
    const e = {};
    if (!cityId)      e.city = 'Selecione uma cidade';
    if (!name.trim()) e.name = 'Nome obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({ cityId, name: name.trim(), type, location: location.trim() || null, source: source.trim() || null, status });
      onClose();
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>{initial ? 'Editar Sensor' : 'Novo Sensor'}</Text>
          <ScrollView>
            {errors.city ? <Text style={ms.err}>{errors.city}</Text> : null}
            <SectionTitle icon="city">Cidade</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {cities.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setCityId(c.id)}
                  style={[ms.chip, cityId === c.id && ms.chipActive]}>
                  <Text style={[ms.chipText, cityId === c.id && ms.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <AirInput label="Nome do sensor" value={name} onChangeText={setName}
              placeholder="Ex: Sensor Centro SP" error={errors.name} />
            <SectionTitle icon="sensor">Tipo</SectionTitle>
            <View style={ms.chips}>
              {SENSOR_TYPES.map(t => (
                <TouchableOpacity key={t} onPress={() => setType(t)}
                  style={[ms.chipInline, type === t && ms.chipInlineActive]}>
                  <Text style={[ms.chipInlineText, type === t && ms.chipInlineTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AirInput label="Localização (opcional)" value={location} onChangeText={setLocation}
              placeholder="Ex: Av. Paulista, 1000" />
            <AirInput label="Fonte (opcional)" value={source} onChangeText={setSource}
              placeholder="Ex: CETESB" />
            <SectionTitle>Status</SectionTitle>
            <View style={ms.chips}>
              {SENSOR_STATUSES.map(st => (
                <TouchableOpacity key={st} onPress={() => setStatus(st)}
                  style={[ms.chipInline, status === st && ms.chipInlineActive]}>
                  <Text style={[ms.chipInlineText, status === st && ms.chipInlineTextActive]}>{st}</Text>
                </TouchableOpacity>
              ))}
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

export function SensorsScreen({ route }) {
  const cityFilter = route?.params?.city ?? null;
  const [sensors,  setSensors]  = useState([]);
  const [cities,   setCities]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState({ visible: false, item: null });

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const [s, c] = await Promise.all([
        cityFilter ? sensorService.getByCity(cityFilter.id) : sensorService.getAll(),
        cityService.getAll(),
      ]);
      setSensors(s);
      setCities(c);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    if (modal.item) await sensorService.update(modal.item.id, data);
    else            await sensorService.create(data);
    load();
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir Sensor', `Remover "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await sensorService.delete(item.id); load(); }
        catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  const statusColor = (st) =>
    st === 'ACTIVE' ? colors.primary : st === 'MAINTENANCE' ? colors.warning : colors.danger;

  if (loading) return <LoadingState text="CARREGANDO SENSORES..." />;

  return (
    <View style={ss.container}>
      {cityFilter && (
        <View style={ss.filterBar}>
          <Icon name="location" size={13} color={colors.accent} />
          <Text style={ss.filterLabel}>  Filtrando: {cityFilter.name}</Text>
        </View>
      )}
      <FlatList
        data={sensors}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={ss.list}
        ListEmptyComponent={<EmptyState iconName="sensor" title="NENHUM SENSOR" desc="Cadastre o primeiro sensor" />}
        renderItem={({ item }) => (
          <View style={ss.card}>
            <View style={[ss.cardBar, { backgroundColor: statusColor(item.status) }]} />
            <View style={ss.cardBody}>
              <View style={ss.row}>
                <Text style={ss.name}>{item.name}</Text>
                <AirBadge label={item.status} color={statusColor(item.status)} bgColor={statusColor(item.status) + '22'} />
              </View>
              <Text style={ss.sub}>{item.type} · {item.cityName}</Text>
              {item.location ? (
                <View style={ss.locRow}>
                  <Icon name="location" size={11} color={colors.textMuted} />
                  <Text style={ss.loc}>  {item.location}</Text>
                </View>
              ) : null}
            </View>
            <View style={ss.actions}>
              <TouchableOpacity onPress={() => setModal({ visible: true, item })} style={ss.actionBtn}>
                <Icon name="edit" size={16} color={colors.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={ss.actionBtn}>
                <Icon name="trash" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={ss.fab} onPress={() => setModal({ visible: true, item: null })} activeOpacity={0.85}>
        <Text style={ss.fabIcon}>+</Text>
      </TouchableOpacity>
      <SensorModal
        visible={modal.visible}
        initial={modal.item}
        cities={cities}
        onClose={() => setModal({ visible: false, item: null })}
        onSave={handleSave}
      />
    </View>
  );
}

const ss = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bg },
  filterBar:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.md },
  filterLabel:{ color: colors.accent, fontSize: 12, fontWeight: '600' },
  list:       { padding: spacing.md, paddingBottom: 100 },
  card:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  cardBar:    { width: 4, alignSelf: 'stretch' },
  cardBody:   { flex: 1, padding: spacing.md },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name:       { color: colors.textPrimary, fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  sub:        { color: colors.textMuted, fontSize: 12 },
  locRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  loc:        { color: colors.textMuted, fontSize: 11 },
  actions:    { flexDirection: 'row', paddingRight: spacing.sm, gap: 4 },
  actionBtn:  { padding: 8 },
  fab:        { position: 'absolute', bottom: 28, right: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 8 },
  fabIcon:    { color: colors.textInverse, fontSize: 28, fontWeight: '300', lineHeight: 32 },
});

const ms = StyleSheet.create({
  overlay:              { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:                { backgroundColor: colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, maxHeight: '90%' },
  title:                { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: spacing.lg },
  err:                  { color: colors.danger, fontSize: 12, marginBottom: 8 },
  chips:                { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip:                 { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.round, borderWidth: 1, borderColor: colors.border, marginRight: 8, marginBottom: 4 },
  chipActive:           { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  chipText:             { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive:       { color: colors.primary },
  chipInline:           { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.round, borderWidth: 1, borderColor: colors.border },
  chipInlineActive:     { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  chipInlineText:       { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  chipInlineTextActive: { color: colors.primary },
  actions:              { flexDirection: 'row', marginTop: spacing.md },
});