import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from './screens/Menu';
import EntradaScreen from './screens/Entrada';
import SaidaScreen from './screens/Saida';
import EscanearScreen from './screens/Escanear';
import BuscaScreen from './screens/Busca';
import LotesScreen from './screens/Lotes';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ title: 'Menu Principal' }} 
        />
        <Stack.Screen 
          name="Buscar" 
          component={BuscaScreen} 
          options={{ title: 'Buscar Produtos' }} 
        />
        <Stack.Screen 
          name="Lotes" 
          component={LotesScreen} 
          options={{ title: 'Visualizar Lotes' }} 
        />
        <Stack.Screen 
          name="Entrada" 
          component={EntradaScreen} 
          options={{ title: 'Registrar Entrada' }} 
        />
        <Stack.Screen 
          name="Saida" 
          component={SaidaScreen} 
          options={{ title: 'Registrar Saída' }} 
        />
        <Stack.Screen 
          name="Escanear" 
          component={EscanearScreen} 
          options={{ title: 'Escanear QR Code' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
