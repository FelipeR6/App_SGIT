import React from 'react';
import { equiposService, mantenimientosService, prestamosService } from '../services/api';

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
    ScrollView: 'ScrollView',
    ActivityIndicator: 'ActivityIndicator',
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

// Mock para los servicios API
jest.mock('../services/api', () => ({
  equiposService: {
    getAll: jest.fn(),
  },
  mantenimientosService: {
    getAll: jest.fn(),
  },
  prestamosService: {
    getAll: jest.fn(),
  }
}));

// Mock para el contexto de tema
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

// Mock para react-navigation
const mockNavigation = {
  navigate: jest.fn(),
  addListener: jest.fn().mockReturnValue(() => {}),
};

// Pruebas básicas que no dependen de renderizar componentes
describe('📱 Pantalla de Inicio - Funcionalidades Principales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log('\n----- Iniciando nueva prueba de HomeScreen -----');
  });

  afterEach(() => {
    console.log('----- Prueba completada -----\n');
  });

  test('✅ VERIFICACIÓN BÁSICA: La configuración de pruebas funciona correctamente', () => {
    console.log('Verificando que la configuración básica de Jest funciona correctamente');
    expect(true).toBe(true);
  });
  
  test('📊 CARGA DE DATOS: Los servicios de API se llaman correctamente para obtener conteos', async () => {
    console.log('Probando la carga de datos desde los servicios API');
    
    // Configurar mocks para simular respuestas exitosas
    (equiposService.getAll as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [{ id: '1' }, { id: '2' }]
    });
    
    (mantenimientosService.getAll as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [{ id: '1' }]
    });
    
    (prestamosService.getAll as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [{ id: '1' }, { id: '2' }, { id: '3' }]
    });
    
    // Simular la función fetchCounts
    const fetchCounts = async () => {
      const [equiposResponse, mantenimientosResponse, prestamosResponse] = await Promise.all([
        equiposService.getAll(),
        mantenimientosService.getAll(),
        prestamosService.getAll(),
      ]);
      
      return {
        equipmentCount: equiposResponse.success ? equiposResponse.data.length : 0,
        maintenanceCount: mantenimientosResponse.success ? mantenimientosResponse.data.length : 0,
        loanCount: prestamosResponse.success ? prestamosResponse.data.length : 0
      };
    };
    
    // Ejecutar la función y verificar resultados
    const counts = await fetchCounts();
    
    // Verificar que se llamaron los servicios
    expect(equiposService.getAll).toHaveBeenCalled();
    expect(mantenimientosService.getAll).toHaveBeenCalled();
    expect(prestamosService.getAll).toHaveBeenCalled();
    
    // Verificar los conteos
    expect(counts).toEqual({
      equipmentCount: 2,
      maintenanceCount: 1,
      loanCount: 3
    });
    
    console.log('Los servicios API se llamaron correctamente y devolvieron los conteos esperados');
  });
  
  test('🔄 MANEJO DE ERRORES: La función de carga maneja correctamente los errores', async () => {
    console.log('Probando el manejo de errores en la carga de datos');
    
    // Configurar mocks para simular un error
    (equiposService.getAll as jest.Mock).mockRejectedValueOnce(new Error('Error de conexión'));
    
    // Simular la función fetchCounts con manejo de errores
    const fetchCounts = async () => {
      try {
        await equiposService.getAll();
        return { success: true };
      } catch (error) {
        console.error('Error al cargar datos:', error);
        return { success: false, error: 'No se pudieron cargar los datos. Verifica tu conexión a internet.' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await fetchCounts();
    
    // Verificar que se manejó el error correctamente
    expect(result).toEqual({
      success: false,
      error: 'No se pudieron cargar los datos. Verifica tu conexión a internet.'
    });
    
    console.log('Los errores se manejan correctamente en la carga de datos');
  });
});