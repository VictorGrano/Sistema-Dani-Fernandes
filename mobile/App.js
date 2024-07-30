import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from './screens/Menu';
import EntradaScreen from './screens/Entrada';
import SaidaScreen from './screens/Saida';
import EscanearScreen from './screens/Escanear';
import BuscaScreen from './screens/Busca';
import LotesScreen from './screens/Lotes';
import LoginScreen from './screens/Login';
import RelatorioMenuScreen from './screens/RelatorioMenu';
import RelatorioProdutos from './screens/reports/RelatorioProdutos';
import RelatorioProdutosScreen from './screens/reports/RelatorioProdutos';
import RelatorioLotesScreen from './screens/reports/RelatorioLotes';
import RelatorioAromaScreen from './screens/reports/RelatorioAroma';
import HistoricoScreen from './screens/Historico';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login', headerShown: false }} 
        />
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ title: 'Menu Principal'}} 
        />
        <Stack.Screen 
          name="Menu Relatorio" 
          component={RelatorioMenuScreen} 
          options={{ title: 'Menu de Relatório'}} 
        />
        <Stack.Screen 
          name="Relatorio Lotes" 
          component={RelatorioLotesScreen} 
          options={{ title: 'Relatório Lotes'}} 
        />
        <Stack.Screen 
          name="Relatorio Aromas" 
          component={RelatorioAromaScreen} 
          options={{ title: 'Relatório Aromas'}} 
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
        <Stack.Screen 
          name="Historico" 
          component={HistoricoScreen} 
          options={{ title: 'Histórico de Movimentação' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
