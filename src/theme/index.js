export const colors = {
  bg:            '#030D08',
  bgCard:        '#071510',
  bgInput:       '#0A1D12',
  bgMuted:       '#0D2217',

  primary:       '#00FF87',
  primaryDim:    '#00CC6A',
  primaryGlow:   'rgba(0,255,135,0.10)',
  primaryBorder: 'rgba(0,255,135,0.22)',

  accent:        '#00D4FF',
  accentGlow:    'rgba(0,212,255,0.10)',
  accentBorder:  'rgba(0,212,255,0.22)',

  danger:        '#FF3A5C',
  dangerGlow:    'rgba(255,58,92,0.12)',
  warning:       '#FFD600',
  warningGlow:   'rgba(255,214,0,0.10)',
  warningBorder: 'rgba(255,214,0,0.28)',

  textPrimary:   '#E0FFF0',
  textSecondary: '#5DB882',
  textMuted:     '#2E5440',
  textInverse:   '#030D08',

  border:        '#112A1A',
  borderLight:   '#0C1F14',

  gridLine:      'rgba(0,255,135,0.04)',
};

export const spacing = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };
export const radius  = { sm:4, md:8, lg:12, xl:20, round:999 };

export const getAqiInfo = (aqi) => {
  if (!aqi || aqi <= 50)  return { label:'BOA',        color:'#00FF87', bg:'#040F08' };
  if (aqi <= 100)         return { label:'MODERADA',   color:'#FFD600', bg:'#100F00' };
  if (aqi <= 150)         return { label:'RUIM',        color:'#FF7A35', bg:'#100500' };
  if (aqi <= 200)         return { label:'MUITO RUIM', color:'#FF3A5C', bg:'#100008' };
  return                   { label:'PERIGOSA',    color:'#BF5FFF', bg:'#08000F' };
};