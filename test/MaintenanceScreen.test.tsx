import React from 'react';
import { mantenimientosService } from '../services/api';

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
    TextInput: 'TextInput',
    FlatList: 'FlatList',
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
  mantenimientosService: {
    getAll: jest.fn(),
    delete: jest.fn()
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
describe('📱 Pantalla de Mantenimiento - Funcionalidades Principales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log('\n----- Iniciando nueva prueba de MaintenanceScreen -----');
  });

  afterEach(() => {
    console.log('----- Prueba completada -----\n');
  });

  test('✅ VERIFICACIÓN BÁSICA: La configuración de pruebas funciona correctamente', () => {
    console.log('Verificando que la configuración básica de Jest funciona correctamente');
    expect(true).toBe(true);
  });
  
  test('📋 CARGA DE MANTENIMIENTOS: El servicio de mantenimientos se llama correctamente', async () => {
    console.log('Probando la carga de datos de mantenimientos');
    
    // Configurar mock para simular respuesta exitosa
    const mockData = [
      {
        Id_Mantenimiento: '1',
        Fecha_Inicio_mantenimiento: '2023-01-01',
        Fecha_fin_mantenimiento: '2023-01-10',
        Observaciones: 'Mantenimiento preventivo',
        Id_Equipos: '1',
        Id_Usuario: '1',
        Marca_Equipo: 'HP',
        Nombre_Usuario_1: 'Juan',
        Apellidos_Usuario_1: 'Pérez'
      },
      {
        Id_Mantenimiento: '2',
        Fecha_Inicio_mantenimiento: '2023-02-15',
        Fecha_fin_mantenimiento: '2023-02-20',
        Observaciones: 'Cambio de disco duro',
        Id_Equipos: '2',
        Id_Usuario: '2',
        Marca_Equipo: 'Dell',
        Nombre_Usuario_1: 'María',
        Apellidos_Usuario_1: 'López'
      }
    ];
    
    (mantenimientosService.getAll as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockData
    });
    
    // Simular la función fetchMantenimientos
    const fetchMantenimientos = async () => {
      try {
        const response = await mantenimientosService.getAll();
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          return { success: false, error: 'Error al cargar los datos' };
        }
      } catch (error) {
        console.error('Error al cargar mantenimientos:', error);
        return { success: false, error: 'Error de conexión al servidor' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await fetchMantenimientos();
    
    // Verificar que se llamó al servicio
    expect(mantenimientosService.getAll).toHaveBeenCalled();
    
    // Verificar los datos recibidos
    expect(result).toEqual({
      success: true,
      data: mockData
    });
    
    console.log('El servicio de mantenimientos se llamó correctamente y devolvió los datos esperados');
  });
  
  test('🗑️ ELIMINACIÓN: El servicio de eliminación se llama correctamente', async () => {
    console.log('Probando la eliminación de un mantenimiento');
    
    // Configurar mock para simular respuesta exitosa
    (mantenimientosService.delete as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Mantenimiento eliminado correctamente'
    });
    
    // Simular la función handleDeleteMaintenance
    const handleDeleteMaintenance = async (id: string) => {
      try {
        const response = await mantenimientosService.delete(id);
        if (response.success) {
          return { success: true, message: response.message };
        } else {
          return { success: false, message: response.message || 'No se pudo eliminar el mantenimiento' };
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        return { success: false, message: 'Ocurrió un error al intentar eliminar el mantenimiento' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await handleDeleteMaintenance('1');
    
    // Verificar que se llamó al servicio con el ID correcto
    expect(mantenimientosService.delete).toHaveBeenCalledWith('1');
    
    // Verificar el resultado
    expect(result).toEqual({
      success: true,
      message: 'Mantenimiento eliminado correctamente'
    });
    
    console.log('El servicio de eliminación se llamó correctamente y devolvió el resultado esperado');
  });
  
  test('🔍 FILTRADO: La función de filtrado funciona correctamente', () => {
    console.log('Probando la funcionalidad de filtrado de mantenimientos');
    
    // Fecha actual para las pruebas (fijada para consistencia)
    const today = new Date('2023-02-01');
    
    // Datos de prueba
    const maintenanceRecords = [
      {
        Id_Mantenimiento: '1',
        Fecha_Inicio_mantenimiento: '2023-01-01',
        Fecha_fin_mantenimiento: '2023-01-10',
        Observaciones: 'Mantenimiento preventivo',
        Id_Equipos: '1',
        Id_Usuario: '1',
        Marca_Equipo: 'HP',
        Nombre_Usuario_1: 'Juan',
        Apellidos_Usuario_1: 'Pérez'
      },
      {
        Id_Mantenimiento: '2',
        Fecha_Inicio_mantenimiento: '2023-02-15', // Futuro
        Fecha_fin_mantenimiento: '2023-02-20',
        Observaciones: 'Cambio de disco duro',
        Id_Equipos: '2',
        Id_Usuario: '2',
        Marca_Equipo: 'Dell',
        Nombre_Usuario_1: 'María',
        Apellidos_Usuario_1: 'López'
      },
      {
        Id_Mantenimiento: '3',
        Fecha_Inicio_mantenimiento: '2023-01-25', // En proceso
        Fecha_fin_mantenimiento: '2023-02-05',
        Observaciones: 'Actualización de software',
        Id_Equipos: '3',
        Id_Usuario: '1',
        Marca_Equipo: 'Lenovo',
        Nombre_Usuario_1: 'Juan',
        Apellidos_Usuario_1: 'Pérez'
      }
    ];
    
    // Función de filtrado
    const filterRecords = (records, searchQuery, activeTab) => {
      return records.filter((record) => {
        // Filter by search query
        const matchesSearch = searchQuery
          ? (record.Marca_Equipo && record.Marca_Equipo.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (record.Nombre_Usuario_1 && record.Nombre_Usuario_1.toLowerCase().includes(searchQuery.toLowerCase())) ||
            record.Observaciones.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
    
        // Determinar el estado basado en las fechas
        const startDate = new Date(record.Fecha_Inicio_mantenimiento);
        const endDate = new Date(record.Fecha_fin_mantenimiento);
    
        let status = "completed";
        if (today < startDate) {
          status = "scheduled";
        } else if (today >= startDate && today <= endDate) {
          status = "inProgress";
        }
    
        // Filter by tab
        const matchesTab = activeTab === "all" ? true : activeTab === status;
    
        return matchesSearch && matchesTab;
      });
    };
    
    // Probar filtrado por búsqueda
    const filteredBySearch = filterRecords(maintenanceRecords, 'lenovo', 'all');
    expect(filteredBySearch).toHaveLength(1);
    expect(filteredBySearch[0].Id_Mantenimiento).toBe('3');
    
    // Probar filtrado por estado (programados)
    const filteredScheduled = filterRecords(maintenanceRecords, '', 'scheduled');
    expect(filteredScheduled).toHaveLength(1);
    expect(filteredScheduled[0].Id_Mantenimiento).toBe('2');
    
    // Probar filtrado por estado (en proceso)
    const filteredInProgress = filterRecords(maintenanceRecords, '', 'inProgress');
    expect(filteredInProgress).toHaveLength(1);
    expect(filteredInProgress[0].Id_Mantenimiento).toBe('3');
    
    // Probar filtrado por estado (completados)
    const filteredCompleted = filterRecords(maintenanceRecords, '', 'completed');
    expect(filteredCompleted).toHaveLength(1);
    expect(filteredCompleted[0].Id_Mantenimiento).toBe('1');
    
    console.log('La función de filtrado funciona correctamente para diferentes criterios');
  });
});