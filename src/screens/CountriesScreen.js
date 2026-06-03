import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { countryService } from '../services/api';
import { AirButton, AirInput, AirCard, SectionTitle, EmptyState, LoadingState } from '../components';
import { colors, spacing, radius } from '../theme';

const CONTINENTS = ['Africa','Americas','Asia','Europe','Oceania'];

function CountryModal({ visible, initial, onClose, onSave }) {
  const [name,      setName]      = useState(initial?.name      ?? '');
  const [isoCode,   setIsoCode]   = useState(initial?.isoCode   ?? '');
  const [continent, setContinent] = useState(initial?.continent ?? 'Americas');
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? ''); setIsoCode(initial?.isoCode ?? '');
      setContinent(initial?.continent ?? 'Americas'); setErrors({});
    }
  }, [visible]);

  const validate = () => {
    const e = {};
    if (!name.trim())    e.name    = 'Nome obrigatório';
    if (!isoCode.trim()) e.isoCode = 'Código ISO obrigatório (2 letras)';
    else if (isoCode.trim().length !== 2) e.isoCode = 'Código ISO deve ter exatamente 2 letras';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({ name: name.trim(), isoCode: isoCode.trim().toUpperCase(), continent });
      onClose();
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.title}>{initial ? 'Editar País' : 'Novo País'}</Text>
          <ScrollView>
            <AirInput label="Nome do país" value={name} onChangeText={setName}
              placeholder="Ex: Brasil" autoCapitalize="words" error={errors.name} />
            <AirInput label="Código ISO (2 letras)" value={isoCode} onChangeText={setIsoCode}
              placeholder="BR" autoCapitalize="characters" maxLength={2} error={errors.isoCode} />
            <SectionTitle>Continente</SectionTitle>
            <View style={ms.chips}>
              {CONTINENTS.map(c => (
                <Text key={c} onPress={() => setContinent(c)}
                  style={[ms.chip, continent === c && ms.chipActive]}>{c}</Text>
              ))}
            </View>
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

export default function CountriesScreen() {
  const [countries, setCountries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState({ visible:false, item:null });

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try { setLoading(true); setCountries(await countryService.getAll()); }
    catch (err) { Alert.alert('Erro', err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    if (modal.item) await countryService.update(modal.item.id, data);
    else            await countryService.create(data);
    load();
  };

  const handleDelete = (item) => {
    Alert.alert('Excluir País', `Remover "${item.name}"?`, [
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir',  style:'destructive', onPress: async () => {
        try { await countryService.delete(item.id); load(); }
        catch (err) { Alert.alert('Erro', err.message); }
      }},
    ]);
  };

  if (loading) return <LoadingState text="CARREGANDO PAÍSES..." />;

  return (
    <View style={styles.container}>
      <FlatList data={countries} keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="🌍" title="NENHUM PAÍS" desc="Cadastre o primeiro país" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.isoCode}>{item.isoCode}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.continent ?? '—'}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => setModal({ visible:true, item })} style={styles.editBtn}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModal({ visible:true, item:null })} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <CountryModal visible={modal.visible} initial={modal.item}
        onClose={() => setModal({ visible:false, item:null })} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:colors.bg },
  list:     { padding:spacing.md, paddingBottom:100 },
  card:     { flexDirection:'row', alignItems:'center', backgroundColor:colors.bgCard, borderRadius:radius.lg, borderWidth:1, borderColor:colors.border, marginBottom:spacing.sm, overflow:'hidden' },
  cardLeft: { backgroundColor:colors.primaryGlow, padding:spacing.md, alignItems:'center', justifyContent:'center', width:56 },
  isoCode:  { color:colors.primary, fontSize:14, fontWeight:'800', letterSpacing:1 },
  cardBody: { flex:1, padding:spacing.md },
  name:     { color:colors.textPrimary, fontSize:15, fontWeight:'700' },
  sub:      { color:colors.textMuted, fontSize:12, marginTop:2 },
  cardActions:{ flexDirection:'row', paddingRight:spacing.sm, gap:4 },
  editBtn:  { padding:8 },
  editBtnText:{ fontSize:16 },
  deleteBtn:{ padding:8 },
  deleteBtnText:{ fontSize:16 },
  fab:      { position:'absolute', bottom:28, right:22, width:58, height:58, borderRadius:29, backgroundColor:colors.primary, alignItems:'center', justifyContent:'center', shadowColor:colors.primary, shadowOffset:{width:0,height:0}, shadowOpacity:0.7, shadowRadius:14, elevation:8 },
  fabIcon:  { color:colors.textInverse, fontSize:28, fontWeight:'300', lineHeight:32 },
});

const ms = StyleSheet.create({
  overlay:  { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'flex-end' },
  sheet:    { backgroundColor:colors.bgCard, borderTopLeftRadius:24, borderTopRightRadius:24, padding:spacing.lg, maxHeight:'85%' },
  title:    { color:colors.textPrimary, fontSize:18, fontWeight:'700', marginBottom:spacing.lg },
  chips:    { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:spacing.md },
  chip:     { paddingHorizontal:12, paddingVertical:7, borderRadius:radius.round, borderWidth:1, borderColor:colors.border, color:colors.textSecondary, fontSize:12, fontWeight:'600', overflow:'hidden' },
  chipActive:{ backgroundColor:colors.primaryGlow, borderColor:colors.primaryBorder, color:colors.primary },
  actions:  { flexDirection:'row', marginTop:spacing.md },
});
