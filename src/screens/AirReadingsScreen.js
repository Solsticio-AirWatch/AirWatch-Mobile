import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { airReadingService, cityService, sensorService } from '../services/api';
import { AirButton, AirInput, SectionTitle, EmptyState, LoadingState, AirBadge } from '../components';
import { colors, spacing, radius, getAqiInfo } from '../theme';

const CATEGORIES = ['BOA','MODERADA','RUIM','MUITO RUIM','PERIGOSA'];
const SOURCES    = ['IoT','OpenAQ','Satellite','Manual','CETESB'];

function ReadingModal({ visible, cities, onClose, onSave }) {
  const [cityId,      setCityId]      = useState(null);
  const [sensorId,    setSensorId]    = useState(null);
  const [sensors,     setSensors]     = useState([]);
  const [pm25,        setPm25]        = useState('');
  const [pm10,        setPm10]        = useState('');
  const [co2,         setCo2]         = useState('');
  const [no2,         setNo2]         = useState('');
  const [o3,          setO3]          = useState('');
  const [aqi,         setAqi]         = useState('');
  const [category,    setCategory]    = useState('BOA');
  const [source,      setSource]      = useState('Manual');
  const [temperature, setTemperature] = useState('');
  const [humidity,    setHumidity]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});

  React.useEffect(() => {
    if (visible) {
      setCityId(null); setSensorId(null); setSensors([]);
      setPm25(''); setPm10(''); setCo2(''); setNo2(''); setO3('');
      setAqi(''); setCategory('BOA'); setSource('Manual');
      setTemperature(''); setHumidity(''); setErrors({});
    }
  }, [visible]);

  const onCityChange = async (id) => {
    setCityId(id); setSensorId(null);
    try { setSensors(await sensorService.getByCity(id)); } catch (_) { setSensors([]); }
  };

  const validate = () => {
    const e = {};
    if (!cityId) e.city = 'Selecione uma cidade';
    if (!source) e.source = 'Fonte obrigatória';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        cityId, sensorId: sensorId || null,
        pm25:        pm25        ? parseFloat(pm25)        : null,
        pm10:        pm10        ? parseFloat(pm10)        : null,
        co2:         co2         ? parseFloat(co2)         : null,
        no2:         no2         ? parseFloat(no2)         : null,
        o3:          o3          ? parseFloat(o3)          : null,
        temperature: temperature ? parseFloat(temperature) : null,
        humidity:    humidity    ? parseFloat(humidity)    : null,
        aqi:         aqi         ? parseInt(aqi)           : null,
        category, source,
        readingAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>Nova Leitura de Ar</Text>
          <ScrollView>
            {errors.city ? <Text style={ms.err}>{errors.city}</Text> : null}
            <SectionTitle>Cidade *</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:spacing.md }}>
              {cities.map(c => (
                <TouchableOpacity key={c.id} onPress={() => onCityChange(c.id)}
                  style={[ms.chip, cityId===c.id && ms.chipActive]}>
                  <Text style={[ms.chipText, cityId===c.id && ms.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {sensors.length > 0 && (
              <>
                <SectionTitle>Sensor (opcional)</SectionTitle>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:spacing.md }}>
                  {sensors.map(s => (
                    <TouchableOpacity key={s.id} onPress={() => setSensorId(s.id)}
                      style={[ms.chip, sensorId===s.id && ms.chipActive]}>
                      <Text style={[ms.chipText, sensorId===s.id && ms.chipTextActive]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <SectionTitle>Poluentes (µg/m³)</SectionTitle>
            <View style={ms.row}>
              <AirInput label="PM2.5" value={pm25} onChangeText={setPm25}
                placeholder="0.0" keyboardType="numeric" containerStyle={{ flex:1, marginRight:8 }} />
              <AirInput label="PM10"  value={pm10} onChangeText={setPm10}
                placeholder="0.0" keyboardType="numeric" containerStyle={{ flex:1 }} />
            </View>
            <View style={ms.row}>
              <AirInput label="CO2"   value={co2}  onChangeText={setCo2}
                placeholder="0.0" keyboardType="numeric" containerStyle={{ flex:1, marginRight:8 }} />
              <AirInput label="NO2"   value={no2}  onChangeText={setNo2}
                placeholder="0.0" keyboardType="numeric" containerStyle={{ flex:1 }} />
            </View>
            <View style={ms.row}>
              <AirInput label="O3"    value={o3}   onChangeText={setO3}
                placeholder="0.0" keyboardType="numeric" containerStyle={{ flex:1, marginRight:8 }} />
              <AirInput label="AQI"   value={aqi}  onChangeText={setAqi}
                placeholder="0"   keyboardType="numeric" containerStyle={{ flex:1 }} />
            </View>

            <SectionTitle>Clima</SectionTitle>
            <View style={ms.row}>
              <AirInput label="Temperatura (°C)" value={temperature} onChangeText={setTemperature}
                placeholder="25.0" keyboardType="numeric" containerStyle={{ flex:1, marginRight:8 }} />
              <AirInput label="Umidade (%)" value={humidity} onChangeText={setHumidity}
                placeholder="60" keyboardType="numeric" containerStyle={{ flex:1 }} />
            </View>

            <SectionTitle>Categoria AQI</SectionTitle>
            <View style={ms.chips}>
              {CATEGORIES.map(c => (
                <Text key={c} onPress={() => setCategory(c)}
                  style={[ms.chipInline, category===c && ms.chipInlineActive]}>{c}</Text>
              ))}
            </View>

            <SectionTitle>Fonte *</SectionTitle>
            <View style={ms.chips}>
              {SOURCES.map(s => (
                <Text key={s} onPress={() => setSource(s)}
                  style={[ms.chipInline, source===s && ms.chipInlineActive]}>{s}</Text>
              ))}
            </View>
            {errors.source ? <Text style={ms.err}>{errors.source}</Text> : null}
          </ScrollView>

          <View style={ms.actions}>
            <AirButton title="Cancelar" variant="secondary" onPress={onClose} style={{ flex:1 }} />
            <View style={{ width:8 }} />
            <AirButton title="Registrar" onPress={handleSave} loading={loading} style={{ flex:1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AirReadingsScreen({ route }) {
  const cityFilter = route?.params?.city ?? null;
  const [readings, setReadings] = useState([]);
  const [cities,   setCities]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const [r, c] = await Promise.all([
        cityFilter ? airReadingService.getByCity(cityFilter.id) : airReadingService.getAll(),
        cityService.getAll(),
      ]);
      setReadings(r); setCities(c);
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir Leitura', `Remover leitura #${item.id}?`, [
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir', style:'destructive', onPress: async () => {
        try { await airReadingService.delete(item.id); load(); }
        catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  if (loading) return <LoadingState text="CARREGANDO LEITURAS..." />;

  return (
    <View style={styles.container}>
      {cityFilter && <Text style={styles.filterLabel}>📍 {cityFilter.name}</Text>}
      <FlatList data={readings} keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="📊" title="NENHUMA LEITURA" desc="Registre a primeira leitura de qualidade do ar" />}
        renderItem={({ item }) => {
          const info = getAqiInfo(item.aqi);
          return (
            <View style={styles.card}>
              <View style={[styles.cardBar, { backgroundColor: info.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.city}>{item.cityName}</Text>
                    <Text style={styles.date}>{item.readingAt ? new Date(item.readingAt).toLocaleString('pt-BR') : '—'}</Text>
                  </View>
                  <AirBadge label={`AQI ${item.aqi ?? '—'}`} color={info.color} bgColor={info.color+'22'} />
                </View>
                <View style={styles.pollRow}>
                  {item.pm25  != null && <Text style={styles.poll}>PM2.5: {item.pm25}</Text>}
                  {item.pm10  != null && <Text style={styles.poll}>PM10: {item.pm10}</Text>}
                  {item.no2   != null && <Text style={styles.poll}>NO2: {item.no2}</Text>}
                  {item.o3    != null && <Text style={styles.poll}>O3: {item.o3}</Text>}
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.source}>{item.source} {item.sensorName ? `· ${item.sensorName}` : ''}</Text>
                  <TouchableOpacity onPress={() => handleDelete(item)}>
                    <Text style={{ color: colors.danger, fontSize:18 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <ReadingModal visible={modal} cities={cities}
        onClose={() => setModal(false)} onSave={async (d) => { await airReadingService.create(d); load(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:colors.bg },
  filterLabel: { color:colors.accent, fontSize:12, fontWeight:'600', paddingHorizontal:spacing.md, paddingTop:spacing.md },
  list:        { padding:spacing.md, paddingBottom:100 },
  card:        { flexDirection:'row', backgroundColor:colors.bgCard, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginBottom:spacing.sm, overflow:'hidden' },
  cardBar:     { width:4 },
  cardBody:    { flex:1, padding:spacing.md },
  cardTop:     { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 },
  city:        { color:colors.textPrimary, fontSize:14, fontWeight:'700' },
  date:        { color:colors.textMuted, fontSize:11, marginTop:2 },
  pollRow:     { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:6 },
  poll:        { color:colors.textSecondary, fontSize:11, backgroundColor:colors.bgMuted, paddingHorizontal:7, paddingVertical:3, borderRadius:6 },
  cardBottom:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  source:      { color:colors.textMuted, fontSize:11 },
  fab:         { position:'absolute', bottom:28, right:22, width:58, height:58, borderRadius:29, backgroundColor:colors.primary, alignItems:'center', justifyContent:'center', shadowColor:colors.primary, shadowOffset:{width:0,height:0}, shadowOpacity:0.7, shadowRadius:14, elevation:8 },
  fabIcon:     { color:colors.textInverse, fontSize:28, fontWeight:'300', lineHeight:32 },
});

const ms = StyleSheet.create({
  overlay:       { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'flex-end' },
  sheet:         { backgroundColor:colors.bgCard, borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing.lg, maxHeight:'92%' },
  title:         { color:colors.textPrimary, fontSize:18, fontWeight:'700', marginBottom:spacing.lg },
  err:           { color:colors.danger, fontSize:12, marginBottom:8 },
  row:           { flexDirection:'row' },
  chips:         { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:spacing.md },
  chip:          { paddingHorizontal:12, paddingVertical:8, borderRadius:radius.round, borderWidth:1, borderColor:colors.border, marginRight:8, marginBottom:4 },
  chipActive:    { backgroundColor:colors.primaryGlow, borderColor:colors.primaryBorder },
  chipText:      { color:colors.textSecondary, fontSize:12, fontWeight:'600' },
  chipTextActive:{ color:colors.primary },
  chipInline:    { paddingHorizontal:12, paddingVertical:7, borderRadius:radius.round, borderWidth:1, borderColor:colors.border, color:colors.textSecondary, fontSize:11, fontWeight:'700', overflow:'hidden' },
  chipInlineActive:{ backgroundColor:colors.primaryGlow, borderColor:colors.primaryBorder, color:colors.primary },
  actions:       { flexDirection:'row', marginTop:spacing.md },
});
