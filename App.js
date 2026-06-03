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
import DashboardScreen     from './src/screens/DashboardScreen';
import AirReadingsScreen   from './src/screens/AirReadingsScreen';
import { SensorsScreen }   from './src/screens/SensorsScreen';
import AlertEventsScreen   from './src/screens/AlertEventsScreen';
import CountriesScreen     from './src/screens/CountriesScreen';
import CitiesScreen        from './src/screens/CitiesScreen';
import AlertConfigsScreen  from './src/screens/AlertConfigsScreen';
import UsersScreen         from './src/screens/UsersScreen';

import { colors } from './src/theme';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

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

// ── Dashboard Stack ───────────────────────────────────────────────────────────
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

// ── Gestão Stack (Countries + Cities + Sensors + Readings) ───────────────────
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

// ── Alertas Stack ─────────────────────────────────────────────────────────────
function AlertasStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="AlertConfigs" component={AlertConfigsScreen} options={{ title: '🔔  Configurações' }} />
      <Stack.Screen name="AlertEvents"  component={AlertEventsScreen}  options={{ title: '⚠️  Eventos' }} />
    </Stack.Navigator>
  );
}

// ── Admin Stack (Users) ───────────────────────────────────────────────────────
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

// ── Tab Icon ──────────────────────────────────────────────────────────────────
const TabIcon = ({ emoji, label, focused }) => (
  <View style={tabS.wrap}>
    <Text style={[tabS.emoji, focused && tabS.emojiFocused]}>{emoji}</Text>
    <Text style={[tabS.label, focused && tabS.labelFocused]}>{label}</Text>
  </View>
);

// ── Main App (after auth) ─────────────────────────────────────────────────────
function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.bgCard, borderTopWidth: 1, borderTopColor: colors.border, height: 66, paddingBottom: 8 },
      tabBarShowLabel: false,
    }}>
      <Tab.Screen name="DashTab"  component={DashboardStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛰️"  label="Monitor"  focused={focused} /> }} />
      <Tab.Screen name="GestaoTab" component={GestaoStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️"  label="Gestão"   focused={focused} /> }} />
      <Tab.Screen name="AlertasTab" component={AlertasStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔔"  label="Alertas"  focused={focused} /> }} />
      <Tab.Screen name="AdminTab"  component={AdminStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥"  label="Usuários" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

// ── Root with auth gate ───────────────────────────────────────────────────────
function RootNavigator() {
  const { token, ready } = useAuth();

  // Sync token to API client whenever it changes
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

// ── App entry ─────────────────────────────────────────────────────────────────
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

const tabS = StyleSheet.create({
  wrap:         { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  emoji:        { fontSize: 20, opacity: 0.4 },
  emojiFocused: { opacity: 1 },
  label:        { color: colors.textMuted, fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  labelFocused: { color: colors.primary, fontWeight: '700' },
});
