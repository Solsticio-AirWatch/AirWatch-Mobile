import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Path, Polyline } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '../components';
import { colors, spacing, radius } from '../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'globe',
    iconColor: colors.primary,
    title: 'Ar limpo é direito de todos',
    desc: 'A poluição do ar mata ~7 milhões de pessoas por ano. Dados existem, mas estão dispersos e fora do alcance da população.',
  },
  {
    icon: 'satellite',
    iconColor: colors.accent,
    title: 'Satélites + sensores IoT',
    desc: 'Combinamos dados do satélite Sentinel-5P (ESA) via OpenAQ e Open-Meteo com sensores ESP32 instalados nas cidades.',
  },
  {
    icon: 'sensor',
    iconColor: colors.primary,
    title: 'Monitoramento em tempo real',
    desc: 'Acompanhe a qualidade do ar da sua cidade agora. Cidades pequenas também merecem um sistema de monitoramento.',
  },
  {
    icon: 'alert',
    iconColor: colors.warning,
    title: 'Alertas para quem precisa',
    desc: 'Configure alertas para asmáticos, idosos e populações vulneráveis. Seja avisado quando o ar piorar.',
  },
  {
    icon: 'leaf',
    iconColor: colors.primary,
    title: 'Bem-vindo ao AirWatch',
    desc: 'Uma plataforma para cidadãos, prefeituras e órgãos ambientais. Simples, acessível e gratuita.',
    isLast: true,
  },
];

const GridBg = () => (
  <Svg style={StyleSheet.absoluteFill} viewBox="0 0 360 640" preserveAspectRatio="none">
    {[...Array(9)].map((_, i) => (
      <Line key={'v'+i} x1={i*45} y1="0" x2={i*45} y2="640" stroke={colors.gridLine} strokeWidth="1" />
    ))}
    {[...Array(15)].map((_, i) => (
      <Line key={'h'+i} x1="0" y1={i*45} x2="360" y2={i*45} stroke={colors.gridLine} strokeWidth="1" />
    ))}
  </Svg>
);

export default function OnboardingScreen({ onDone }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const next = async () => {
    if (index < SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      await AsyncStorage.setItem('onboarding_done', '1');
      onDone();
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    onDone();
  };

  return (
    <View style={s.root}>
      <GridBg />

      {/* Skip */}
      {!slide.isLast && (
        <TouchableOpacity style={s.skip} onPress={skip} activeOpacity={0.7}>
          <Text style={s.skipText}>PULAR</Text>
        </TouchableOpacity>
      )}

      {/* Ícone */}
      <View style={s.body}>
        <View style={[s.iconRing, { borderColor: slide.iconColor + '44', backgroundColor: slide.iconColor + '11' }]}>
          <Icon name={slide.icon} size={48} color={slide.iconColor} strokeWidth={1.2} />
        </View>

        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === index && s.dotActive]} />
          ))}
        </View>

        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.desc}>{slide.desc}</Text>

        {/* Cards informativos no último slide */}
        {slide.isLast && (
          <View style={s.cards}>
            <InfoCard icon="city"     color={colors.accent}   text="Cadastro de cidades e bairros com alertas configuráveis" />
            <InfoCard icon="chart"    color={colors.primary}  text="Dashboard de qualidade do ar com índice AQI em tempo real" />
            <InfoCard icon="users"    color={colors.warning}  text="Acesso para cidadãos, técnicos, gerentes e administradores" />
          </View>
        )}
      </View>

      {/* Botão */}
      <TouchableOpacity style={[s.btn, { borderColor: slide.iconColor + '66', backgroundColor: slide.iconColor + '11' }]} onPress={next} activeOpacity={0.8}>
        {slide.isLast
          ? <Text style={[s.btnText, { color: colors.primary }]}>ENTRAR NO APP</Text>
          : <View style={s.btnRow}>
              <Text style={[s.btnText, { color: slide.iconColor }]}>PRÓXIMO</Text>
              <Icon name="arrow-right" size={16} color={slide.iconColor} strokeWidth={2} />
            </View>
        }
      </TouchableOpacity>
    </View>
  );
}

const InfoCard = ({ icon, color, text }) => (
  <View style={[ic.card, { borderColor: color + '33' }]}>
    <Icon name={icon} size={16} color={color} strokeWidth={1.8} />
    <Text style={ic.text}>{text}</Text>
  </View>
);

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: spacing.lg },
  skip:      { position: 'absolute', top: 52, right: spacing.lg },
  skipText:  { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  body:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconRing:  { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  dots:      { flexDirection: 'row', gap: 6, marginBottom: spacing.lg },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted },
  dotActive: { width: 18, backgroundColor: colors.primary },
  title:     { color: colors.textPrimary, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md, letterSpacing: 0.3 },
  desc:      { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.md },
  cards:     { marginTop: spacing.lg, width: '100%', gap: spacing.sm },
  btn:       { borderWidth: 1, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  btnRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText:   { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
});

const ic = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  text: { color: colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 },
});