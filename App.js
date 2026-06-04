import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { setAuthToken } from './src/services/api';

// Auth screens
import LoginScreen    from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// App screens
import DashboardScreen    from './src/screens/DashboardScreen';
import AirReadingsScreen  from './src/screens/AirReadingsScreen';
import { SensorsScreen }  from './src/screens/SensorsScreen';
import AlertEventsScreen  from './src/screens/AlertEventsScreen';
import CountriesScreen    from './src/screens/CountriesScreen';
import CitiesScreen       from './src/screens/CitiesScreen';
import AlertConfigsScreen from './src/screens/AlertConfigsScreen';
import UsersScreen        from './src/screens/UsersScreen';

import { colors } from './src/theme';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Permissões por role ───────────────────────────────────────────────────────
//
//  CITIZEN    → só leitura: Dashboard + qualidade do ar
//  TECHNICIAN → CITIZEN + pode registrar leituras e gerenciar sensores
//  MANAGER    → TECHNICIAN + pode gerenciar países, cidades, alertas
//  ADMIN      → acesso total + gestão de usuários
//
export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role ?? 'CITIZEN';
  return {
    role,
    isCitizen:    role === 'CITIZEN',
    isTechnician: role === 'TECHNICIAN',
    isManager:    role === 'MANAGER',
    isAdmin:      role === 'ADMIN',
    // helpers de acesso
    canWrite:     role !== 'CITIZEN',
    canManage:    role === 'MANAGER' || role === 'ADMIN',
    canAdmin:     role === 'ADMIN',
  };
};

const stackOpts = {
  headerStyle:          { backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border, elevation: 4 },
  headerTintColor:      colors.primary,
  headerTitleStyle:     { color: colors.textPrimary, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  headerBackTitleVisible: false,
  cardStyle:            { backgroundColor: colors.bg },
};

// ── Auth Navigator ────────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ ...stackOpts, headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen}
        options={{ headerShown: true, title: 'Criar Conta' }} />
    </Stack.Navigator>
  );
}

// ── Dashboard Stack (todos os roles) ─────────────────────────────────────────
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="Dashboard"   component={DashboardScreen}   options={{ title: '🛰️  AirWatch' }} />
      <Stack.Screen name="AirReadings" component={AirReadingsScreen} options={{ title: 'Leituras de Ar' }} />
      <Stack.Screen name="Sensors"     component={SensorsScreen}     options={{ title: 'Sensores' }} />
      <Stack.Screen name="AlertEvents" component={AlertEventsScreen} options={{ title: 'Eventos de Alerta' }} />
    </Stack.Navigator>
  );
}

// ── Gestão Stack (MANAGER + ADMIN) ───────────────────────────────────────────
function GestaoStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="Countries"   component={CountriesScreen}   options={{ title: '🌍  Países' }} />
      <Stack.Screen name="Cities"      component={CitiesScreen}       options={{ title: '🏙️  Cidades' }} />
      <Stack.Screen name="AllSensors"  component={SensorsScreen}     options={{ title: '📡  Sensores' }} />
      <Stack.Screen name="AllReadings" component={AirReadingsScreen} options={{ title: '📊  Leituras' }} />
    </Stack.Navigator>
  );
}

// ── Alertas Stack (TECHNICIAN + MANAGER + ADMIN) ──────────────────────────────
function AlertasStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="AlertConfigs" component={AlertConfigsScreen} options={{ title: '🔔  Configurações' }} />
      <Stack.Screen name="AlertEvents"  component={AlertEventsScreen}  options={{ title: '⚠️  Eventos' }} />
    </Stack.Navigator>
  );
}

// ── Admin Stack (ADMIN apenas) ────────────────────────────────────────────────
function AdminStack() {
  const { logout } = useAuth();
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="Users" component={UsersScreen}
        options={{
          title: '👥  Usuários',
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
              <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '700' }}>SAIR</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

// ── Perfil Stack (todos — mostra role e botão sair) ───────────────────────────
function PerfilStack() {
  const { user, logout } = useAuth();
  const { role } = usePermissions();

  const roleColor = {
    ADMIN:      colors.warning,
    MANAGER:    colors.accent,
    TECHNICIAN: colors.primary,
    CITIZEN:    colors.textSecondary,
  }[role] ?? colors.textSecondary;

  return (
    <View style={ps.container}>
      <View style={ps.card}>
        <View style={ps.avatar}>
          <Text style={ps.avatarText}>{user?.email?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={ps.email}>{user?.email}</Text>
        <View style={[ps.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor + '55' }]}>
          <Text style={[ps.roleText, { color: roleColor }]}>{role}</Text>
        </View>
        <Text style={ps.desc}>{ROLE_DESC[role]}</Text>
      </View>

      <View style={ps.permsCard}>
        <Text style={ps.permsTitle}>PERMISSÕES</Text>
        {ROLE_PERMS[role]?.map((p, i) => (
          <Text key={i} style={ps.permItem}>✅ {p}</Text>
        ))}
      </View>

      <TouchableOpacity style={ps.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Text style={ps.logoutText}>SAIR DA CONTA</Text>
      </TouchableOpacity>
    </View>
  );
}

const ROLE_DESC = {
  CITIZEN:    'Cidadão — visualiza qualidade do ar',
  TECHNICIAN: 'Técnico — gerencia sensores e leituras',
  MANAGER:    'Gerente — gerencia cidades e alertas',
  ADMIN:      'Administrador — acesso total ao sistema',
};

const ROLE_PERMS = {
  CITIZEN:    ['Ver dashboard e qualidade do ar', 'Ver cidades monitoradas', 'Ver leituras de ar'],
  TECHNICIAN: ['Tudo do CITIZEN', 'Registrar leituras de ar', 'Gerenciar sensores', 'Ver eventos de alerta'],
  MANAGER:    ['Tudo do TECHNICIAN', 'Gerenciar países e cidades', 'Configurar alertas', 'Criar eventos de alerta'],
  ADMIN:      ['Tudo do MANAGER', 'Gerenciar usuários', 'Excluir qualquer registro'],
};

const ROLE_BLOCKED = {
  CITIZEN:    ['Registrar leituras', 'Gerenciar sensores', 'Configurar alertas', 'Gerenciar usuários'],
  TECHNICIAN: ['Gerenciar países/cidades', 'Configurar alertas'],
  MANAGER:    ['Gerenciar usuários'],
  ADMIN:      [],
};

// ── Tab Icon ──────────────────────────────────────────────────────────────────
const TabIcon = ({ emoji, label, focused }) => (
  <View style={tabS.wrap}>
    <Text style={[tabS.emoji, focused && tabS.emojiFocused]}>{emoji}</Text>
    <Text style={[tabS.label, focused && tabS.labelFocused]}>{label}</Text>
  </View>
);

// ── AppNavigator — abas condicionais por role ─────────────────────────────────
function AppNavigator() {
  const { canManage, canAdmin, canWrite } = usePermissions();

  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.bgCard, borderTopWidth: 1, borderTopColor: colors.border, height: 66, paddingBottom: 8 },
      tabBarShowLabel: false,
    }}>

      {/* 🛰️ Monitor — TODOS */}
      <Tab.Screen name="DashTab" component={DashboardStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛰️" label="Monitor" focused={focused} /> }} />

      {/* 🗺️ Gestão — só MANAGER e ADMIN */}
      {canManage && (
        <Tab.Screen name="GestaoTab" component={GestaoStack}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="Gestão" focused={focused} /> }} />
      )}

      {/* 🔔 Alertas — TECHNICIAN, MANAGER e ADMIN */}
      {canWrite && (
        <Tab.Screen name="AlertasTab" component={AlertasStack}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Alertas" focused={focused} /> }} />
      )}

      {/* 👥 Usuários — só ADMIN */}
      {canAdmin && (
        <Tab.Screen name="AdminTab" component={AdminStack}
          options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Usuários" focused={focused} /> }} />
      )}

      {/* 👤 Perfil — TODOS (sempre última aba) */}
      <Tab.Screen name="PerfilTab" component={PerfilStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} /> }} />

    </Tab.Navigator>
  );
}

// ── Root com auth gate ────────────────────────────────────────────────────────
function RootNavigator() {
  const { token, ready } = useAuth();

  React.useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={colors.bgCard} />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const tabS = StyleSheet.create({
  wrap:         { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  emoji:        { fontSize: 20, opacity: 0.4 },
  emojiFocused: { opacity: 1 },
  label:        { color: colors.textMuted, fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  labelFocused: { color: colors.primary, fontWeight: '700' },
});

const ps = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card:        { backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center', marginBottom: 16, marginTop: 32 },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryGlow, borderWidth: 2, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { color: colors.primary, fontSize: 32, fontWeight: '700' },
  email:       { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 10 },
  roleBadge:   { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginBottom: 12 },
  roleText:    { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  desc:        { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  permsCard:   { backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  permsTitle:  { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 2.5, marginBottom: 12 },
  permItem:    { color: colors.textPrimary, fontSize: 13, paddingVertical: 4 },
  permBlocked: { color: colors.textMuted, fontSize: 13, paddingVertical: 4, opacity: 0.5 },
  logoutBtn:   { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  logoutText:  { color: colors.danger, fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
});