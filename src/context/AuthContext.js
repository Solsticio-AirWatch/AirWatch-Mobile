import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken]   = useState(null);
  const [user,  setUser]    = useState(null);
  const [ready, setReady]   = useState(false);

  // Carrega sessão salva ao iniciar
  React.useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('@airwatch_token');
        const u = await AsyncStorage.getItem('@airwatch_user');
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } catch (_) {}
      setReady(true);
    })();
  }, []);

  const login = async (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    await AsyncStorage.setItem('@airwatch_token', tokenValue);
    await AsyncStorage.setItem('@airwatch_user', JSON.stringify(userData));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['@airwatch_token', '@airwatch_user']);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
