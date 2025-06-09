import axios from 'axios';

// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock para axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  }))
}));

describe('API Services', () => {
  let mockAxios;
  
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar el mock de axios
    mockAxios = axios.create();
  });
  
  test('ejemplo de prueba básica', () => {
    // Una prueba simple para verificar que la configuración funciona
    expect(true).toBe(true);
  });
  
  // Aquí puedes agregar más pruebas específicas para tus servicios
});