import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { cityService, countryService } from '../services/api';
import { AirButton, AirInput, AirCard, SectionTitle, EmptyState, LoadingState, StatusDot } from '../components';
import { colors, spacing, radius } from '../theme';

function CityModal({ visible, initial, countries, onClose, onSave }) {
  const [countryId,  setCountryId]  = useState(initial?.countryId  ?? null);
  const [name,       setName]       = useState(initial?.name        ?? '');
  const [state,      setState]      = useState(initial?.state       ?? '');
  const [latitude,   setLatitude]   = useState(initial?.latitude    ? String(initial.latitude)  : '');
  const [longitude,  setLongitude]  = useState(initial?.longitude   ? String(initial.longitude) : '');
  const [population, setPopulation] = useState(initial?.population  ? String(initial.population): '');
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({});

  React.useEffect(() => {
    if (visible) {
      setCountryId(initial?.countryId ?? null);
      setName(initial?.name ?? ''); setState(initial?.state ?? '');
      setLatitude(initial?.latitude ? String(initial.latitude) : '');
      setLongitude(initial?.longitude ? String(initial.longitude) : '');
      setPopulation(initial?.population ? String(initial.population) : '');
      setErrors({});
    }
  }, [visible]);

  const validate = () => {
    const e = {};
    if (!countryId) e.country   = 'Selecione um país';
    if (!name.trim()) e.name    = 'Nome obrigatório';
    if (!latitude)    e.latitude = 'Latitude obrigatória';
    if (!longitude)   e.longitude= 'Longitude obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        countryId, name: name.trim(), state: state.trim() || null,
        latitude: parseFloat(latitude), longitude: parseFloat(longitude),
        population: population ? parseInt(population) : null,
      });
      onClose();
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>{initial ? 'Editar Cidade' : 'Nova Cidade'}</Text>
          <ScrollView>
            <SectionTitle>País</SectionTitle>
            {errors.country ? <Text style={ms.err}>{errors.country}</Text> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:spacing.md }}>
              {countries.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setCountryId(c.id)}
                  style={[ms.countryChip, countryId===c.id && ms.countryChipActive]}>
                  <Text style={[ms.countryChipText, countryId===c.id && ms.countryChipTextActive]}>
                    {c.isoCode} {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <AirInput label="Nome da cidade" value={name} onChangeText={setName}
              placeholder="Ex: São Paulo" autoCapitalize="words" error={errors.name} />
            <AirInput label="Estado (opcional)" value={state} onChangeText={setState}
              placeholder="Ex: SP" autoCapitalize="characters" />
            <View style={ms.row}>
              <AirInput label="Latitude" value={latitude} onChangeText={setLatitude}
                placeholder="-23.55" keyboardType="numeric" error={errors.latitude}
                containerStyle={{ flex:1, marginRight:8 }} />
              <AirInput label="Longitude" value={longitude} onChangeText={setLongitude}
                placeholder="-46.63" keyboardType="numeric" error={errors.longitude}
                containerStyle={{ flex:1 }} />
            </View>
            <AirInput label="População (opcional)" value={population} onChangeText={setPopulation}
              placeholder="12000000" keyboardType="numeric" />
          </ScrollView>
          <View style={ms.actions}>
            <AirButton title="Cancelar" variant="secondary" onPress={onClose} style={{ flex:1 }} />
            <View style={{ width:8 }} />
            <AirButton title="Salvar" onPress={handleSave} loading={loading} style={{ flex:1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CitiesScreen() {
  const [cities,    setCities]    = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState({ visible:false, item:null });

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const [c, ct] = await Promise.all([cityService.getAll(), countryService.getAll()]);
      setCities(c); setCountries(ct);
    } catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    if (modal.item) await cityService.update(modal.item.id, data);
    else            await cityService.create(data);
    load();
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir Cidade', `Remover "${item.name}"?`, [
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir', style:'destructive', onPress: async () => {
        try { await cityService.delete(item.id); load(); }
        catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  if (loading) return <LoadingState text="CARREGANDO CIDADES..." />;

  return (
    <View style={styles.container}>
      <FlatList data={cities} keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="🏙️" title="NENHUMA CIDADE" desc="Cadastre a primeira cidade" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardBar} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.iso}>{item.isoCode}</Text>
              </View>
              <Text style={styles.sub}>{item.state ? `${item.state} · ` : ''}{item.countryName}</Text>
              <Text style={styles.coords}>📍 {item.latitude}, {item.longitude}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => setModal({ visible:true, item })} style={styles.actionBtn}>
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                <Text>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModal({ visible:true, item:null })} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <CityModal visible={modal.visible} initial={modal.item} countries={countries}
        onClose={() => setModal({ visible:false, item:null })} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:colors.bg },
  list:        { padding:spacing.md, paddingBottom:100 },
  card:        { flexDirection:'row', alignItems:'center', backgroundColor:colors.bgCard, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginBottom:spacing.sm, overflow:'hidden' },
  cardBar:     { width:4, height:'100%', backgroundColor:colors.accent, opacity:0.7 },
  cardBody:    { flex:1, padding:spacing.md },
  cardTop:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  name:        { color:colors.textPrimary, fontSize:15, fontWeight:'700' },
  iso:         { color:colors.accent, fontSize:11, fontWeight:'700', letterSpacing:1 },
  sub:         { color:colors.textMuted, fontSize:12, marginTop:2 },
  coords:      { color:colors.textMuted, fontSize:11, marginTop:3 },
  cardActions: { flexDirection:'row', paddingRight:spacing.sm, gap:4 },
  actionBtn:   { padding:8 },
  fab:         { position:'absolute', bottom:28, right:22, width:58, height:58, borderRadius:29, backgroundColor:colors.primary, alignItems:'center', justifyContent:'center', shadowColor:colors.primary, shadowOffset:{width:0,height:0}, shadowOpacity:0.7, shadowRadius:14, elevation:8 },
  fabIcon:     { color:colors.textInverse, fontSize:28, fontWeight:'300', lineHeight:32 },
});

const ms = StyleSheet.create({
  overlay:      { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'flex-end' },
  sheet:        { backgroundColor:colors.bgCard, borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing.lg, maxHeight:'90%' },
  title:        { color:colors.textPrimary, fontSize:18, fontWeight:'700', marginBottom:spacing.lg },
  err:          { color:colors.danger, fontSize:12, marginBottom:8 },
  row:          { flexDirection:'row' },
  countryChip:  { paddingHorizontal:12, paddingVertical:8, borderRadius:radius.round, borderWidth:1, borderColor:colors.border, marginRight:8, marginBottom:spacing.sm },
  countryChipActive:{ backgroundColor:colors.primaryGlow, borderColor:colors.primaryBorder },
  countryChipText:  { color:colors.textSecondary, fontSize:12, fontWeight:'600' },
  countryChipTextActive:{ color:colors.primary },
  actions:      { flexDirection:'row', marginTop:spacing.md },
});
