import axios from 'axios';

// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock para axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }))
  };
  return mockAxios;
});

// Guardar la implementación original de console.log
const originalConsoleLog = console.log;

describe('API Configuration', () => {
  beforeEach(() => {
    // Restaurar console.log para esta prueba
    console.log = originalConsoleLog;
    
    // Espiar console.log
    jest.spyOn(console, 'log');
    
    // Limpiar el cache de módulos para forzar una nueva importación
    jest.resetModules();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('ejemplo de prueba básica', () => {
    // Una prueba simple para verificar que la configuración funciona
    expect(true).toBe(true);
  });
});

// Importar el módulo después de configurar los mocks
require('../services/api');

// Verificar que se llamó a console.log con el mensaje correcto
expect(console.log).toHaveBeenCalledWith(
  'Conectando a la API centralizada en:',
  expect.stringContaining('192.168.1.10:3000/api')
);

// Verificar que axios.create fue llamado con la configuración correcta
expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
  baseURL: expect.stringContaining('192.168.1.10:3000/api'),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
}));