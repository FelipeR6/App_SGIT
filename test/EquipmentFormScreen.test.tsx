import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EquipmentFormScreen from '../screens/EquipmentFormScreen';
import { equiposService, categoriasService, modelosService, usuariosService } from '../services/api';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../context/ThemeContext';

// Mock de los servicios
jest.mock('../services/api', () => ({
  equiposService: {
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  categoriasService: {
    getAll: jest.fn(),
  },
  modelosService: {
    getAll: jest.fn(),
  },
  usuariosService: {
    getAll: jest.fn(),
  }
}));

// Mock para react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: { equipmentId: null }
    }),
  };
});

describe('EquipmentFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks para datos iniciales
    categoriasService.getAll.mockResolvedValue({
      success: true,
      data: [
        { Id_Categoria: '1', Nombre_Categoria: 'Laptop' },
        { Id_Categoria: '2', Nombre_Categoria: 'Desktop' }
      ]
    });
    
    modelosService.getAll.mockResolvedValue({
      success: true,
      data: [
        { Id_Modelo: '1', Caracteristicas_Modelo: 'Core i5, 8GB RAM', Accesorios_Modelo: 'Cargador' },
        { Id_Modelo: '2', Caracteristicas_Modelo: 'Core i7, 16GB RAM', Accesorios_Modelo: 'Cargador, Mouse' }
      ]
    });
    
    usuariosService.getAll.mockResolvedValue({
      success: true,
      data: [
        { Id_Usuario: '1', Nombre_Usuario_1: 'Juan', Apellidos_Usuario_1: 'Pérez' },
        { Id_Usuario: '2', Nombre_Usuario_1: 'María', Apellidos_Usuario_1: 'López' }
      ]
    });
  });

  test('Renderiza correctamente el formulario para crear un nuevo equipo', async () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <NavigationContainer>
          <EquipmentFormScreen />
        </NavigationContainer>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Registrar Equipo')).toBeTruthy();
      expect(getByTestId('marca-input')).toBeTruthy();
    });
    
    // Verificar que se llamaron los servicios para cargar datos iniciales
    expect(categoriasService.getAll).toHaveBeenCalled();
    expect(modelosService.getAll).toHaveBeenCalled();
    expect(usuariosService.getAll).toHaveBeenCalled();
  });

  test('Carga correctamente los datos de un equipo existente', async () => {
    // Configurar mock para simular un equipo existente
    const mockEquipo = {
      Id_Equipos: '1',
      Marca_Equipo: 'HP',
      Año_Equipo: 2022,
      Id_Categoria: '1',
      Id_Modelo: '1',
      Id_Usuario: '1',
      Estado_Entregado: 'Óptimo funcionamiento',
      Estado_Recibido: 'Óptimo funcionamiento'
    };
    
    equiposService.getById.mockResolvedValue({
      success: true,
      data: mockEquipo
    });
    
    // Sobrescribir el mock de useRoute para incluir un ID
    jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
      params: { equipmentId: '1' }
    });
    
    const { getByText, getByTestId, getByDisplayValue } = render(
      <ThemeProvider>
        <NavigationContainer>
          <EquipmentFormScreen />
        </NavigationContainer>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Editar Equipo')).toBeTruthy();
      expect(getByDisplayValue('HP')).toBeTruthy();
    });
    
    expect(equiposService.getById).toHaveBeenCalledWith('1');
  });

  test('Valida correctamente los campos del formulario', async () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <NavigationContainer>
          <EquipmentFormScreen />
        </NavigationContainer>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Registrar Equipo')).toBeTruthy();
    });
    
    // Intentar enviar el formulario sin completar campos obligatorios
    fireEvent.press(getByText('Guardar'));
    
    await waitFor(() => {
      expect(getByText('La marca del equipo es requerida')).toBeTruthy();
      expect(getByText('Debe seleccionar una categoría')).toBeTruthy();
      expect(getByText('Debe seleccionar un modelo')).toBeTruthy();
      expect(getByText('Debe seleccionar un usuario responsable')).toBeTruthy();
    });
    
    // Verificar que no se llamó al servicio de creación
    expect(equiposService.create).not.toHaveBeenCalled();
  });

  test('Crea correctamente un nuevo equipo', async () => {
    equiposService.create.mockResolvedValue({
      success: true,
      message: 'Equipo registrado correctamente'
    });
    
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <NavigationContainer>
          <EquipmentFormScreen />
        </NavigationContainer>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Registrar Equipo')).toBeTruthy();
    });
    
    // Completar el formulario
    fireEvent.changeText(getByTestId('marca-input'), 'Lenovo ThinkPad');
    
    // Simular selección de categoría, modelo y usuario
    // Nota: La implementación exacta dependerá de cómo se manejen los Pickers en tu aplicación
    
    // Enviar el formulario
    fireEvent.press(getByText('Guardar'));
    
    await waitFor(() => {
      expect(equiposService.create).toHaveBeenCalledWith(expect.objectContaining({
        Marca_Equipo: 'Lenovo ThinkPad'
      }));
    });
  });

  test('Actualiza correctamente un equipo existente', async () => {
    // Configurar mock para simular un equipo existente
    const mockEquipo = {
      Id_Equipos: '1',
      Marca_Equipo: 'HP',
      Año_Equipo: 2022,
      Id_Categoria: '1',
      Id_Modelo: '1',
      Id_Usuario: '1',
      Estado_Entregado: 'Óptimo funcionamiento',
      Estado_Recibido: 'Óptimo funcionamiento'
    };
    
    equiposService.getById.mockResolvedValue({
      success: true,
      data: mockEquipo
    });
    
    equiposService.update.mockResolvedValue({
      success: true,
      message: 'Equipo actualizado correctamente'
    });
    
    // Sobrescribir el mock de useRoute para incluir un ID
    jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
      params: { equipmentId: '1' }
    });
    
    const { getByText, getByTestId, getByDisplayValue } = render(
      <ThemeProvider>
        <NavigationContainer>
          <EquipmentFormScreen />
        </NavigationContainer>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Editar Equipo')).toBeTruthy();
      expect(getByDisplayValue('HP')).toBeTruthy();
    });
    
    // Modificar la marca
    fireEvent.changeText(getByTestId('marca-input'), 'HP EliteBook');
    
    // Enviar el formulario
    fireEvent.press(getByText('Guardar'));
    
    await waitFor(() => {
      expect(equiposService.update).toHaveBeenCalledWith('1', expect.objectContaining({
        Marca_Equipo: 'HP EliteBook'
      }));
    });
  });

  test('Maneja correctamente los errores al cargar datos', async () => {
    // Simular error en la carga de categorías
    categoriasService.getAll.mockRejectedValue(new Error('Error de conexión'));
    
    const { getByText } = render(
      <ThemeProvider>
        <NavigationContainer>
          <EquipmentFormScreen />
        </NavigationContainer>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      // Verificar que se muestra un mensaje de error
      expect(getByText('Ocurrió un error al cargar los datos necesarios')).toBeTruthy();
    });
  });

  test('Maneja correctamente los errores al guardar datos', async () => {
    // Simular error al crear un equipo
    equiposService.create.mockRejectedValue(new Error('Error al guardar'));
    
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <NavigationContainer>
          <EquipmentFormScreen />
        </NavigationContainer>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Registrar Equipo')).toBeTruthy();
    });
    
    // Completar el formulario con datos válidos
    fireEvent.changeText(getByTestId('marca-input'), 'Lenovo ThinkPad');
    
    // Enviar el formulario
    fireEvent.press(getByText('Guardar'));
    
    await waitFor(() => {
      // Verificar que se muestra un mensaje de error
      expect(getByText('Ocurrió un error al guardar el equipo')).toBeTruthy();
    });
  });
});