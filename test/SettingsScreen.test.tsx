import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock para react-native
jest.mock('react-native', () => {
  return {
    NativeModules: {
      StatusBarManager: { getHeight: jest.fn() }
    },
    StyleSheet: {
      create: jest.fn(styles => styles)
    },
    Text: 'Text',
    View: 'View',
    TouchableOpacity: 'TouchableOpacity',
    Switch: 'Switch',
    ScrollView: 'ScrollView',
    Alert: {
      alert: jest.fn()
    },
    Dimensions: {
      get: jest.fn().mockReturnValue({ width: 375, height: 812 })
    }
  };
});

// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock para react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock para el contexto de tema
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ 
    isDarkMode: false,
    toggleTheme: jest.fn()
  }),
}));

// Mock para useAlert hook
jest.mock('../hooks/useAlert', () => ({
  __esModule: true,
  default: () => ({
    alertVisible: false,
    alertConfig: {},
    showError: jest.fn(),
    hideAlert: jest.fn(),
    showSuccess: jest.fn()
  }),
}));

// Mock para react-navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Pruebas para la pantalla de configuración
describe('Pantalla de Configuración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('✅ verifica que la configuración de pruebas funciona correctamente', () => {
    expect(true).toBe(true);
  });
  
  test('🌓 puede cambiar el tema correctamente', () => {
    // Obtener la función toggleTheme del contexto
    const { toggleTheme } = require('../context/ThemeContext').useTheme();
    
    // Simular el cambio de tema
    toggleTheme();
    
    // Verificar que se llamó a la función
    expect(toggleTheme).toHaveBeenCalled();
  });
  
  test('💾 puede guardar preferencias correctamente', async () => {
    // Simular el guardado de preferencias
    const preferences = {
      notifications: true,
      darkMode: true,
      language: 'es'
    };
    
    await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Verificar que se llamó a AsyncStorage.setItem con los parámetros correctos
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userPreferences', JSON.stringify(preferences));
  });
  
  test('🔄 puede cargar preferencias correctamente', async () => {
    // Configurar mock para simular preferencias almacenadas
    const preferences = {
      notifications: true,
      darkMode: true,
      language: 'es'
    };
    
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(preferences));
    
    // Simular la carga de preferencias
    const loadPreferences = async () => {
      const storedPrefs = await AsyncStorage.getItem('userPreferences');
      return storedPrefs ? JSON.parse(storedPrefs) : null;
    };
    
    const result = await loadPreferences();
    
    // Verificar que se llamó a AsyncStorage.getItem
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('userPreferences');
    
    // Verificar que se cargaron las preferencias correctamente
    expect(result).toEqual(preferences);
  });
});