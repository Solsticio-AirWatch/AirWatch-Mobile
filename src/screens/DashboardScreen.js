import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { airReadingService, cityService } from '../services/api';
import { AirCard, SectionTitle, AirBadge, EmptyState, Icon } from '../components';
import { colors, spacing, radius, getAqiInfo } from '../theme';
import { usePermissions } from '../../App';

export default function DashboardScreen({ navigation }) {
  const { canWrite } = usePermissions();
  const [cities,   setCities]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    cityService.getAll().then(setCities).catch(() => {});
  }, []);

  const selectCity = async (city) => {
    setSelected(city);
    setReadings([]);
    setLoading(true);
    try {
      const [r] = await Promise.allSettled([airReadingService.getByCity(city.id)]);
      if (r.status === 'fulfilled') setReadings(r.value);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const latest   = readings[0];
  const aqiInfo  = getAqiInfo(latest?.aqi);
  const filtered = cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      <View style={s.searchWrap}>
        <Icon name="globe" size={16} color={colors.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar cidade monitorada..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {!selected && (
        <>
          <SectionTitle icon="globe">Cidades Monitoradas</SectionTitle>
          {filtered.length === 0
            ? <EmptyState iconName="city" title="NENHUMA CIDADE" desc="Cadastre cidades na aba Gestão" />
            : filtered.map(c => (
              <TouchableOpacity key={c.id} style={s.cityCard} onPress={() => selectCity(c)} activeOpacity={0.75}>
                <View style={s.cityCardLeft}>
                  <Text style={s.cityName}>{c.name}</Text>
                  <Text style={s.cityState}>{c.state} · {c.countryName}</Text>
                </View>
                <Icon name="arrow-right" size={18} color={colors.primary} />
              </TouchableOpacity>
            ))
          }
        </>
      )}

      {selected && (
        <>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Icon name="arrow-left" size={16} color={colors.primary} />
            <Text style={s.backBtnText}>  Trocar cidade</Text>
          </TouchableOpacity>

          {loading && (
            <View style={s.loadingRow}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={s.loadingText}>  Buscando dados...</Text>
            </View>
          )}

          {latest && (
            <View style={[s.aqiCard, { backgroundColor: aqiInfo.bg, borderColor: aqiInfo.color + '44' }]}>
              <View style={s.aqiIconWrap}>
                <Icon name="leaf" size={28} color={aqiInfo.color} strokeWidth={1.5} />
              </View>
              <Text style={[s.aqiVal, { color: aqiInfo.color }]}>{latest.aqi ?? '—'}</Text>
              <Text style={s.aqiUnit}>AQI</Text>
              <View style={[s.aqiBadge, { backgroundColor: aqiInfo.color + '22', borderColor: aqiInfo.color + '44' }]}>
                <Text style={[s.aqiBadgeText, { color: aqiInfo.color }]}>{aqiInfo.label}</Text>
              </View>
              <View style={s.aqiCityRow}>
                <Icon name="location" size={13} color={colors.textSecondary} />
                <Text style={s.aqiCity}>  {selected.name}</Text>
              </View>
              <Text style={s.aqiSource}>Fonte: {latest.source}</Text>
            </View>
          )}

          <AirCard>
            <View style={s.cardHeaderRow}>
              <SectionTitle icon="chart">Últimas Leituras</SectionTitle>
              <TouchableOpacity onPress={() => navigation.navigate('AirReadings', { city: selected })}>
                <Text style={s.verTudoText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {readings.length === 0 && !loading
              ? <Text style={s.noData}>Nenhuma leitura para {selected.name}</Text>
              : readings.slice(0, 3).map(r => (
                <View key={r.id} style={s.readingRow}>
                  <View>
                    <Text style={s.readingCat}>{r.category ?? 'Sem categoria'}</Text>
                    <Text style={s.readingDate}>{r.readingAt ? new Date(r.readingAt).toLocaleString('pt-BR') : '—'}</Text>
                  </View>
                  <AirBadge label={`AQI ${r.aqi ?? '—'}`} color={getAqiInfo(r.aqi).color} bgColor={getAqiInfo(r.aqi).color + '22'} />
                </View>
              ))
            }
          </AirCard>

          <View style={s.shortcutRow}>
            <TouchableOpacity style={s.shortcut} onPress={() => navigation.navigate('AirReadings', { city: selected })} activeOpacity={0.8}>
              <Icon name="readings" size={22} color={colors.accent} />
              <Text style={s.shortcutLabel}>Leituras</Text>
            </TouchableOpacity>
            {canWrite && (
              <TouchableOpacity style={s.shortcut} onPress={() => navigation.navigate('Sensors', { city: selected })} activeOpacity={0.8}>
                <Icon name="sensor" size={22} color={colors.primary} />
                <Text style={s.shortcutLabel}>Sensores</Text>
              </TouchableOpacity>
            )}
            {canWrite && (
              <TouchableOpacity style={s.shortcut} onPress={() => navigation.navigate('AlertEvents', { city: selected })} activeOpacity={0.8}>
                <Icon name="alert" size={22} color={colors.warning} />
                <Text style={s.shortcutLabel}>Alertas</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  content:      { padding: spacing.md },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  searchInput:  { flex: 1, paddingVertical: 13, color: colors.textPrimary, fontSize: 15, marginLeft: 8 },
  cityCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  cityCardLeft: { flex: 1 },
  cityName:     { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  cityState:    { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  backBtn:      { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  backBtnText:  { color: colors.primary, fontSize: 14, fontWeight: '600' },
  loadingRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  loadingText:  { color: colors.textSecondary, fontSize: 13 },
  aqiCard:      { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
  aqiIconWrap:  { marginBottom: 10 },
  aqiVal:       { fontSize: 72, fontWeight: '800', lineHeight: 78 },
  aqiUnit:      { color: colors.textMuted, fontSize: 13, letterSpacing: 3, marginBottom: 10 },
  aqiBadge:     { paddingHorizontal: 16, paddingVertical: 5, borderRadius: radius.round, borderWidth: 1, marginBottom: 12 },
  aqiBadgeText: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  aqiCityRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  aqiCity:      { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  aqiSource:    { color: colors.textMuted, fontSize: 11 },
  cardHeaderRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verTudoText:  { color: colors.primary, fontSize: 12, fontWeight: '600' },
  readingRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  readingCat:   { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  readingDate:  { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  noData:       { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: spacing.md },
  shortcutRow:  { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shortcut:     { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center', gap: 6 },
  shortcutLabel:{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
});