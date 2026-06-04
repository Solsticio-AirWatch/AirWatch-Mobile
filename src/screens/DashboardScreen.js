import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, FlatList,
} from 'react-native';
import { airReadingService, cityService, openAQService } from '../services/api';
import { AirCard, SectionTitle, AirBadge, EmptyState } from '../components';
import { colors, spacing, radius, getAqiInfo } from '../theme';
import { usePermissions } from '../../App';

export default function DashboardScreen({ navigation }) {
  const { canWrite, isCitizen } = usePermissions();
  const [cities,    setCities]    = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [readings,  setReadings]  = useState([]);
  const [openAQAqi, setOpenAQAqi] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    cityService.getAll().then(setCities).catch(() => {});
  }, []);

  const selectCity = async (city) => {
    setSelected(city);
    setReadings([]);
    setOpenAQAqi(null);
    setLoading(true);
    try {
      const [r] = await Promise.allSettled([
        airReadingService.getByCity(city.id),
        openAQService.fetchByCity(city.name).then(locs => {
          if (locs[0]) setOpenAQAqi(locs[0]);
        }),
      ]);
      if (r.status === 'fulfilled') setReadings(r.value);
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  const latest = readings[0];
  const aqiInfo = getAqiInfo(latest?.aqi);
  const filtered = cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Busca de cidade */}
      <TextInput style={styles.search} placeholder="Buscar cidade cadastrada..."
        placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />

      {/* Lista de cidades */}
      {!selected && (
        <>
          <SectionTitle>🌍 Cidades Monitoradas</SectionTitle>
          {filtered.length === 0
            ? <EmptyState icon="🏙️" title="NENHUMA CIDADE" desc="Cadastre cidades na aba Cidades" />
            : filtered.map(c => (
              <TouchableOpacity key={c.id} style={styles.cityCard}
                onPress={() => selectCity(c)} activeOpacity={0.75}>
                <View style={styles.cityCardLeft}>
                  <Text style={styles.cityName}>{c.name}</Text>
                  <Text style={styles.cityState}>{c.state} · {c.countryName}</Text>
                </View>
                <Text style={styles.cityArrow}>›</Text>
              </TouchableOpacity>
            ))
          }
        </>
      )}

      {/* Dashboard da cidade selecionada */}
      {selected && (
        <>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Trocar cidade</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>  Buscando dados...</Text>
            </View>
          )}

          {/* AQI card */}
          {latest && (
            <View style={[styles.aqiCard, { backgroundColor: aqiInfo.bg, borderColor: aqiInfo.color + '44' }]}>
              <Text style={styles.aqiEmoji}>{aqiInfo.emoji}</Text>
              <Text style={[styles.aqiVal, { color: aqiInfo.color }]}>{latest.aqi ?? '—'}</Text>
              <Text style={styles.aqiUnit}>AQI</Text>
              <View style={[styles.aqiBadge, { backgroundColor: aqiInfo.color + '22', borderColor: aqiInfo.color + '44' }]}>
                <Text style={[styles.aqiBadgeText, { color: aqiInfo.color }]}>{aqiInfo.label}</Text>
              </View>
              <Text style={styles.aqiCity}>📍 {selected.name}</Text>
              <Text style={styles.aqiSource}>Fonte: {latest.source}</Text>
            </View>
          )}

          {/* Últimas leituras */}
          <AirCard>
            <View style={styles.cardHeaderRow}>
              <SectionTitle>📊 Últimas Leituras</SectionTitle>
              <TouchableOpacity onPress={() => navigation.navigate('AirReadings', { city: selected })}>
                <Text style={styles.verTudoText}>Ver todas →</Text>
              </TouchableOpacity>
            </View>
            {readings.length === 0 && !loading
              ? <Text style={styles.noData}>Nenhuma leitura registrada para {selected.name}</Text>
              : readings.slice(0, 3).map(r => (
                <View key={r.id} style={styles.readingRow}>
                  <View>
                    <Text style={styles.readingCat}>{r.category ?? 'Sem categoria'}</Text>
                    <Text style={styles.readingDate}>{r.readingAt ? new Date(r.readingAt).toLocaleString('pt-BR') : '—'}</Text>
                  </View>
                  <AirBadge label={`AQI ${r.aqi ?? '—'}`}
                    color={getAqiInfo(r.aqi).color}
                    bgColor={getAqiInfo(r.aqi).color + '22'} />
                </View>
              ))
            }
          </AirCard>

          {/* Atalhos — visíveis conforme role */}
          <View style={styles.shortcutRow}>
            <TouchableOpacity style={styles.shortcut}
              onPress={() => navigation.navigate('AirReadings', { city: selected })} activeOpacity={0.8}>
              <Text style={styles.shortcutEmoji}>📈</Text>
              <Text style={styles.shortcutLabel}>Leituras</Text>
            </TouchableOpacity>
            {canWrite && (
              <TouchableOpacity style={styles.shortcut}
                onPress={() => navigation.navigate('Sensors', { city: selected })} activeOpacity={0.8}>
                <Text style={styles.shortcutEmoji}>📡</Text>
                <Text style={styles.shortcutLabel}>Sensores</Text>
              </TouchableOpacity>
            )}
            {canWrite && (
              <TouchableOpacity style={styles.shortcut}
                onPress={() => navigation.navigate('AlertEvents', { city: selected })} activeOpacity={0.8}>
                <Text style={styles.shortcutEmoji}>⚠️</Text>
                <Text style={styles.shortcutLabel}>Alertas</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:colors.bg },
  content:   { padding:spacing.md },
  search:    { backgroundColor:colors.bgInput, borderWidth:1, borderColor:colors.border, borderRadius:radius.md, paddingHorizontal:spacing.md, paddingVertical:13, color:colors.textPrimary, fontSize:15, marginBottom:spacing.md },
  cityCard:  { flexDirection:'row', alignItems:'center', backgroundColor:colors.bgCard, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing.md, marginBottom:spacing.sm },
  cityCardLeft:{ flex:1 },
  cityName:  { color:colors.textPrimary, fontSize:15, fontWeight:'700' },
  cityState: { color:colors.textMuted, fontSize:12, marginTop:2 },
  cityArrow: { color:colors.primary, fontSize:22 },
  backBtn:   { marginBottom:spacing.md },
  backBtnText:{ color:colors.primary, fontSize:14, fontWeight:'600' },
  loadingRow: { flexDirection:'row', alignItems:'center', marginBottom:spacing.md },
  loadingText:{ color:colors.textSecondary, fontSize:13 },
  aqiCard:   { borderRadius:radius.xl, borderWidth:1, padding:spacing.lg, alignItems:'center', marginBottom:spacing.md },
  aqiEmoji:  { fontSize:52, marginBottom:8 },
  aqiVal:    { fontSize:72, fontWeight:'800', lineHeight:78 },
  aqiUnit:   { color:colors.textMuted, fontSize:13, letterSpacing:3, marginBottom:10 },
  aqiBadge:  { paddingHorizontal:16, paddingVertical:5, borderRadius:radius.round, borderWidth:1, marginBottom:12 },
  aqiBadgeText:{ fontSize:13, fontWeight:'800', letterSpacing:2 },
  aqiCity:   { color:colors.textPrimary, fontSize:15, fontWeight:'600', marginBottom:4 },
  aqiSource: { color:colors.textMuted, fontSize:11 },
  cardHeaderRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  verTudoText:{ color:colors.primary, fontSize:12, fontWeight:'600' },
  readingRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:9, borderBottomWidth:1, borderBottomColor:colors.borderLight },
  readingCat: { color:colors.textPrimary, fontSize:13, fontWeight:'600' },
  readingDate:{ color:colors.textMuted, fontSize:11, marginTop:2 },
  noData:    { color:colors.textMuted, fontSize:13, textAlign:'center', paddingVertical:spacing.md },
  shortcutRow:{ flexDirection:'row', gap:spacing.sm, marginBottom:spacing.md },
  shortcut:  { flex:1, backgroundColor:colors.bgCard, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, padding:spacing.md, alignItems:'center' },
  shortcutEmoji:{ fontSize:26, marginBottom:4 },
  shortcutLabel:{ color:colors.textSecondary, fontSize:11, fontWeight:'600' },
});
