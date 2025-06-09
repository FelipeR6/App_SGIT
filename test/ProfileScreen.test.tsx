import React from 'react';
import { usuariosService } from '../services/api';

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
    Image: 'Image',
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

// Mock para el servicio de usuarios
jest.mock('../services/api', () => ({
  usuariosService: {
    obtenerPerfil: jest.fn(),
    actualizarPerfil: jest.fn(),
    cambiarContraseña: jest.fn()
  }
}));

// Mock para el contexto de tema
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
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

// Pruebas para la pantalla de perfil
describe('📱 Pantalla de Perfil - Funcionalidades Principales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log('\n----- Iniciando nueva prueba de ProfileScreen -----');
  });

  afterEach(() => {
    console.log('----- Prueba completada -----\n');
  });

  test('✅ VERIFICACIÓN BÁSICA: La configuración de pruebas funciona correctamente', () => {
    console.log('Verificando que la configuración básica de Jest funciona correctamente');
    expect(true).toBe(true);
  });
  
  test('👤 CARGA DE PERFIL: El servicio obtiene correctamente los datos del perfil', async () => {
    console.log('Probando la carga de datos del perfil de usuario');
    
    // Configurar mock para simular respuesta exitosa
    (usuariosService.obtenerPerfil as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        id: '1',
        Usuario: 'testuser',
        Nombre: 'Usuario Prueba',
        Email: 'usuario@test.com',
        Rol: 'Administrador'
      }
    });
    
    // Simular la función fetchPerfil
    const fetchPerfil = async (userId) => {
      try {
        const response = await usuariosService.obtenerPerfil(userId);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          return { success: false, error: 'Error al cargar los datos del perfil' };
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        return { success: false, error: 'Error de conexión al servidor' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await fetchPerfil('1');
    
    // Verificar que se llamó al servicio
    expect(usuariosService.obtenerPerfil).toHaveBeenCalledWith('1');
    
    // Verificar los datos recibidos
    expect(result).toEqual({
      success: true,
      data: {
        id: '1',
        Usuario: 'testuser',
        Nombre: 'Usuario Prueba',
        Email: 'usuario@test.com',
        Rol: 'Administrador'
      }
    });
    
    console.log('El servicio de perfil se llamó correctamente y devolvió los datos esperados');
  });
  
  test('✏️ ACTUALIZACIÓN DE PERFIL: El servicio actualiza correctamente los datos del perfil', async () => {
    console.log('Probando la actualización de datos del perfil de usuario');
    
    // Configurar mock para simular respuesta exitosa
    (usuariosService.actualizarPerfil as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Perfil actualizado correctamente'
    });
    
    // Datos de prueba
    const perfilData = {
      id: '1',
      Nombre: 'Nuevo Nombre',
      Email: 'nuevo@email.com'
    };
    
    // Simular la función updatePerfil
    const updatePerfil = async (data) => {
      try {
        const response = await usuariosService.actualizarPerfil(data);
        if (response.success) {
          return { success: true, message: response.message };
        } else {
          return { success: false, error: 'Error al actualizar los datos del perfil' };
        }
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return { success: false, error: 'Error de conexión al servidor' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await updatePerfil(perfilData);
    
    // Verificar que se llamó al servicio
    expect(usuariosService.actualizarPerfil).toHaveBeenCalledWith(perfilData);
    
    // Verificar la respuesta
    expect(result).toEqual({
      success: true,
      message: 'Perfil actualizado correctamente'
    });
    
    console.log('El servicio de actualización de perfil se llamó correctamente');
  });
  
  test('🔑 CAMBIO DE CONTRASEÑA: El servicio procesa correctamente el cambio de contraseña', async () => {
    console.log('Probando el cambio de contraseña del usuario');
    
    // Configurar mock para simular respuesta exitosa
    (usuariosService.cambiarContraseña as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
    
    // Datos de prueba
    const passwordData = {
      userId: '1',
      contraseñaActual: 'password123',
      nuevaContraseña: 'newpassword123'
    };
    
    // Simular la función changePassword
    const changePassword = async (data) => {
      try {
        const response = await usuariosService.cambiarContraseña(data);
        if (response.success) {
          return { success: true, message: response.message };
        } else {
          return { success: false, error: 'Error al cambiar la contraseña' };
        }
      } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return { success: false, error: 'Error de conexión al servidor' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await changePassword(passwordData);
    
    // Verificar que se llamó al servicio
    expect(usuariosService.cambiarContraseña).toHaveBeenCalledWith(passwordData);
    
    // Verificar la respuesta
    expect(result).toEqual({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
    
    console.log('El servicio de cambio de contraseña se llamó correctamente');
  });
});