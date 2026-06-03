export const colors = {
  bg:            '#050D0A',
  bgCard:        '#0A1A12',
  bgInput:       '#0D2016',
  bgMuted:       '#102518',

  primary:       '#1FD467',
  primaryDim:    '#18A850',
  primaryGlow:   'rgba(31,212,103,0.14)',
  primaryBorder: 'rgba(31,212,103,0.28)',

  accent:        '#38BDF8',
  accentGlow:    'rgba(56,189,248,0.12)',
  accentBorder:  'rgba(56,189,248,0.28)',

  danger:        '#FF4D6A',
  dangerGlow:    'rgba(255,77,106,0.14)',
  warning:       '#FFB800',
  warningGlow:   'rgba(255,184,0,0.12)',
  warningBorder: 'rgba(255,184,0,0.3)',

  textPrimary:   '#DFF7EC',
  textSecondary: '#6BAF89',
  textMuted:     '#375C47',
  textInverse:   '#050D0A',

  border:        '#163024',
  borderLight:   '#0F2219',
};

export const spacing = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 };
export const radius  = { sm:4, md:8, lg:12, xl:20, round:999 };

export const getAqiInfo = (aqi) => {
  if (!aqi || aqi <= 50)  return { label:'BOA',        color:'#1FD467', emoji:'😊', bg:'#071A10' };
  if (aqi <= 100)         return { label:'MODERADA',   color:'#FFB800', emoji:'😐', bg:'#1A1500' };
  if (aqi <= 150)         return { label:'RUIM',        color:'#FF6B35', emoji:'😷', bg:'#1A0D00' };
  if (aqi <= 200)         return { label:'MUITO RUIM', color:'#FF4D6A', emoji:'🤢', bg:'#1A000A' };
  return                   { label:'PERIGOSA',    color:'#9B30FF', emoji:'☠️', bg:'#0D0015' };
};
