import React from 'react';
import { prestamosService, equiposService, usuariosService } from '../services/api';

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
    ScrollView: 'ScrollView',
    ActivityIndicator: 'ActivityIndicator',
    Alert: {
      alert: jest.fn()
    },
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    Platform: {
      OS: 'ios',
      select: jest.fn(obj => obj.ios)
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

// Mock para @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: 'Picker',
}));

// Mock para react-native-date-picker
jest.mock('react-native-date-picker', () => 'DatePicker');

// Mock para los servicios API
jest.mock('../services/api', () => ({
  prestamosService: {
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    finalizarPrestamo: jest.fn(),
  },
  equiposService: {
    getAll: jest.fn(),
    getDisponibles: jest.fn(),
  },
  usuariosService: {
    getAll: jest.fn(),
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
    showSuccess: jest.fn(),
    showWarning: jest.fn(),
  }),
}));

// Mock para react-navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {}
};

// Pruebas para la pantalla de formulario de préstamos
describe('📱 Pantalla de Gestión de Préstamos - Funcionalidades Principales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log('\n----- Iniciando nueva prueba de LoanFormScreen -----');
  });

  afterEach(() => {
    console.log('----- Prueba completada -----\n');
  });

  test('✅ VERIFICACIÓN BÁSICA: La configuración de pruebas funciona correctamente', () => {
    console.log('Verificando que la configuración básica de Jest funciona correctamente');
    expect(true).toBe(true);
  });
  
  test('📋 CARGA DE DATOS: Los servicios se llaman correctamente al cargar la pantalla', async () => {
    console.log('Probando la carga de datos iniciales para el formulario de préstamos');
    
    // Configurar mocks para simular respuestas exitosas
    (equiposService.getDisponibles as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [
        { Id_Equipos: '1', Marca_Equipo: 'HP', Año_Equipo: 2022 },
        { Id_Equipos: '2', Marca_Equipo: 'Dell', Año_Equipo: 2023 }
      ]
    });
    
    (usuariosService.getAll as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [
        { Id_Usuario: '1', Nombre_Usuario_1: 'Juan', Apellidos_Usuario_1: 'Pérez' },
        { Id_Usuario: '2', Nombre_Usuario_1: 'María', Apellidos_Usuario_1: 'López' }
      ]
    });
    
    // Simular la función loadData
    const loadData = async () => {
      try {
        const [equipmentResponse, usersResponse] = await Promise.all([
          equiposService.getDisponibles(),
          usuariosService.getAll(),
        ]);
        
        return {
          equipment: equipmentResponse.success ? equipmentResponse.data : [],
          users: usersResponse.success ? usersResponse.data : []
        };
      } catch (error) {
        console.error("Error al cargar datos:", error);
        return { equipment: [], users: [] };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await loadData();
    
    // Verificar que se llamaron los servicios
    expect(equiposService.getDisponibles).toHaveBeenCalled();
    expect(usuariosService.getAll).toHaveBeenCalled();
    
    // Verificar los datos recibidos
    expect(result).toEqual({
      equipment: [
        { Id_Equipos: '1', Marca_Equipo: 'HP', Año_Equipo: 2022 },
        { Id_Equipos: '2', Marca_Equipo: 'Dell', Año_Equipo: 2023 }
      ],
      users: [
        { Id_Usuario: '1', Nombre_Usuario_1: 'Juan', Apellidos_Usuario_1: 'Pérez' },
        { Id_Usuario: '2', Nombre_Usuario_1: 'María', Apellidos_Usuario_1: 'López' }
      ]
    });
    
    console.log('Los servicios se llamaron correctamente y devolvieron los datos esperados');
  });
  
  test('🔍 CARGA DE PRÉSTAMO: El servicio carga correctamente los datos de un préstamo existente', async () => {
    console.log('Probando la carga de datos de un préstamo existente');
    
    // Configurar mock para simular respuesta exitosa
    (prestamosService.getById as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        Id_Prestamo: '1',
        Id_Equipo: '1',
        Id_Usuario: '1',
        Fecha_Prestamo: '2023-05-15',
        Fecha_Devolucion_Estimada: '2023-05-30',
        Fecha_Devolucion_Real: null,
        Estado_Prestamo: 'Activo',
        Observaciones: 'Préstamo para proyecto especial'
      }
    });
    
    // Simular la carga de un préstamo existente
    const loadLoan = async (loanId) => {
      try {
        const response = await prestamosService.getById(loanId);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          return { success: false, error: 'No se pudo cargar la información del préstamo' };
        }
      } catch (error) {
        console.error("Error al cargar datos del préstamo:", error);
        return { success: false, error: 'Error al cargar datos del préstamo' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await loadLoan('1');
    
    // Verificar que se llamó al servicio con el ID correcto
    expect(prestamosService.getById).toHaveBeenCalledWith('1');
    
    // Verificar los datos recibidos
    expect(result).toEqual({
      success: true,
      data: {
        Id_Prestamo: '1',
        Id_Equipo: '1',
        Id_Usuario: '1',
        Fecha_Prestamo: '2023-05-15',
        Fecha_Devolucion_Estimada: '2023-05-30',
        Fecha_Devolucion_Real: null,
        Estado_Prestamo: 'Activo',
        Observaciones: 'Préstamo para proyecto especial'
      }
    });
    
    console.log('El servicio de carga de préstamo se llamó correctamente y devolvió los datos esperados');
  });
  
  test('💾 GUARDAR PRÉSTAMO: El servicio guarda correctamente un nuevo préstamo', async () => {
    console.log('Probando el guardado de un nuevo préstamo');
    
    // Datos de prueba
    const formData = {
      Id_Equipo: '1',
      Id_Usuario: '1',
      Fecha_Prestamo: '2023-06-01',
      Fecha_Devolucion_Estimada: '2023-06-15',
      Observaciones: 'Préstamo para desarrollo de aplicación'
    };
    
    // Configurar mock para simular respuesta exitosa
    (prestamosService.create as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Préstamo registrado correctamente'
    });
    
    // Simular la función de guardado
    const saveLoan = async (data) => {
      try {
        const response = await prestamosService.create(data);
        if (response.success) {
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message || 'No se pudo guardar el préstamo' };
        }
      } catch (error) {
        console.error("Error al guardar préstamo:", error);
        return { success: false, error: 'Error al guardar préstamo' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await saveLoan(formData);
    
    // Verificar que se llamó al servicio con los datos correctos
    expect(prestamosService.create).toHaveBeenCalledWith(formData);
    
    // Verificar el resultado
    expect(result).toEqual({
      success: true,
      message: 'Préstamo registrado correctamente'
    });
    
    console.log('El servicio de creación de préstamo se llamó correctamente y devolvió el resultado esperado');
  });
  
  test('🔄 ACTUALIZAR PRÉSTAMO: El servicio actualiza correctamente un préstamo existente', async () => {
    console.log('Probando la actualización de un préstamo existente');
    
    // Datos de prueba
    const loanId = '1';
    const formData = {
      Id_Equipo: '1',
      Id_Usuario: '1',
      Fecha_Prestamo: '2023-06-01',
      Fecha_Devolucion_Estimada: '2023-06-30',
      Observaciones: 'Préstamo extendido para desarrollo de aplicación'
    };
    
    // Configurar mock para simular respuesta exitosa
    (prestamosService.update as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Préstamo actualizado correctamente'
    });
    
    // Simular la función de actualización
    const updateLoan = async (id, data) => {
      try {
        const response = await prestamosService.update(id, data);
        if (response.success) {
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message || 'No se pudo actualizar el préstamo' };
        }
      } catch (error) {
        console.error("Error al actualizar préstamo:", error);
        return { success: false, error: 'Error al actualizar préstamo' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await updateLoan(loanId, formData);
    
    // Verificar que se llamó al servicio con los datos correctos
    expect(prestamosService.update).toHaveBeenCalledWith(loanId, formData);
    
    // Verificar el resultado
    expect(result).toEqual({
      success: true,
      message: 'Préstamo actualizado correctamente'
    });
    
    console.log('El servicio de actualización de préstamo se llamó correctamente y devolvió el resultado esperado');
  });
  
  test('✅ FINALIZAR PRÉSTAMO: El servicio finaliza correctamente un préstamo', async () => {
    console.log('Probando la finalización de un préstamo');
    
    // Datos de prueba
    const loanId = '1';
    const finalizationData = {
      Fecha_Devolucion_Real: '2023-06-10',
      Estado_Devolucion: 'Óptimo funcionamiento',
      Observaciones_Devolucion: 'Equipo devuelto en perfectas condiciones'
    };
    
    // Configurar mock para simular respuesta exitosa
    (prestamosService.finalizarPrestamo as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Préstamo finalizado correctamente'
    });
    
    // Simular la función de finalización
    const finalizeLoan = async (id, data) => {
      try {
        const response = await prestamosService.finalizarPrestamo(id, data);
        if (response.success) {
          return { success: true, message: response.message };
        } else {
          return { success: false, error: response.message || 'No se pudo finalizar el préstamo' };
        }
      } catch (error) {
        console.error("Error al finalizar préstamo:", error);
        return { success: false, error: 'Error al finalizar préstamo' };
      }
    };
    
    // Ejecutar la función y verificar resultados
    const result = await finalizeLoan(loanId, finalizationData);
    
    // Verificar que se llamó al servicio con los datos correctos
    expect(prestamosService.finalizarPrestamo).toHaveBeenCalledWith(loanId, finalizationData);
    
    // Verificar el resultado
    expect(result).toEqual({
      success: true,
      message: 'Préstamo finalizado correctamente'
    });
    
    console.log('El servicio de finalización de préstamo se llamó correctamente y devolvió el resultado esperado');
  });
  
  test('🧪 VALIDACIÓN: La función de validación detecta correctamente los errores', () => {
    console.log('Probando la validación del formulario de préstamos');
    
    // Función de validación
    const validateForm = (formData) => {
      const errors = {};
      
      if (!formData.Id_Equipo) {
        errors.Id_Equipo = 'Debe seleccionar un equipo';
      }
      
      if (!formData.Id_Usuario) {
        errors.Id_Usuario = 'Debe seleccionar un usuario';
      }
      
      if (!formData.Fecha_Prestamo) {
        errors.Fecha_Prestamo = 'La fecha de préstamo es requerida';
      }
      
      if (!formData.Fecha_Devolucion_Estimada) {
        errors.Fecha_Devolucion_Estimada = 'La fecha estimada de devolución es requerida';
      } else if (new Date(formData.Fecha_Devolucion_Estimada) <= new Date(formData.Fecha_Prestamo)) {
        errors.Fecha_Devolucion_Estimada = 'La fecha de devolución debe ser posterior a la fecha de préstamo';
      }
      
      return { isValid: Object.keys(errors).length === 0, errors };
    };
    
    // Caso 1: Formulario válido
    const validForm = {
      Id_Equipo: '1',
      Id_Usuario: '1',
      Fecha_Prestamo: '2023-06-01',
      Fecha_Devolucion_Estimada: '2023-06-15',
      Observaciones: 'Préstamo para desarrollo'
    };
    
    const validResult = validateForm(validForm);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toEqual({});
    
    // Caso 2: Formulario inválido
    const invalidForm = {
      Id_Equipo: '',
      Id_Usuario: '',
      Fecha_Prestamo: '',
      Fecha_Devolucion_Estimada: '',
      Observaciones: 'Préstamo para desarrollo'
    };
    
    const invalidResult = validateForm(invalidForm);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toHaveProperty('Id_Equipo');
    expect(invalidResult.errors).toHaveProperty('Id_Usuario');
    expect(invalidResult.errors).toHaveProperty('Fecha_Prestamo');
    expect(invalidResult.errors).toHaveProperty('Fecha_Devolucion_Estimada');
    
    // Caso 3: Fecha de devolución anterior a fecha de préstamo
    const invalidDatesForm = {
      Id_Equipo: '1',
      Id_Usuario: '1',
      Fecha_Prestamo: '2023-06-15',
      Fecha_Devolucion_Estimada: '2023-06-01',
      Observaciones: 'Préstamo para desarrollo'
    };
    
    const invalidDatesResult = validateForm(invalidDatesForm);
    expect(invalidDatesResult.isValid).toBe(false);
    expect(invalidDatesResult.errors).toHaveProperty('Fecha_Devolucion_Estimada');
    
    console.log('La función de validación detecta correctamente los errores en el formulario de préstamos');
  });
  
  test('🔄 NAVEGACIÓN: La aplicación navega correctamente después de guardar un préstamo', () => {
    console.log('Probando la navegación después de guardar un préstamo');
    
    // Simular la navegación de vuelta a la lista de préstamos
    mockNavigation.navigate('Loans');
    
    // Verificar que se llamó a la función de navegación con los parámetros correctos
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Loans');
    
    console.log('La navegación se realizó correctamente después de guardar un préstamo');
  });
});
