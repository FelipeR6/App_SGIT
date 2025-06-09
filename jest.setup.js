// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([]))
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

// Mock para react-native
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.NativeModules = {
    ...rn.NativeModules,
    StatusBarManager: { getHeight: jest.fn() }
  };
  
  // Agregar mock para Dimensions
  rn.Dimensions = {
    get: jest.fn().mockReturnValue({ width: 375, height: 812 })
  };
  
  return rn;
});

// Mock para react-native-date-picker
jest.mock('react-native-date-picker', () => 'DatePicker');

// Silenciar los logs de consola durante las pruebas (opcional)
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Eliminar el mock problemático de NativeAnimatedHelper
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');