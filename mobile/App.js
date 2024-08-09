import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from './screens/Menu';
import EntradaScreen from './screens/Entrada';
import SaidaScreen from './screens/Saida';
import EscanearScreen from './screens/Escanear';
import LotesScreen from './screens/Lotes';
import LoginScreen from './screens/Login';
import RelatorioMenuScreen from './screens/RelatorioMenu';
import RelatorioProdutosScreen from './screens/reports/RelatorioProdutos';
import RelatorioLotesScreen from './screens/reports/RelatorioLotes';
import RelatorioAromaScreen from './screens/reports/RelatorioAroma';
import HistoricoScreen from './screens/Historico';
import RelatorioMovimentacaoScreen from './screens/reports/RelatorioMovimentacao';
import BuscaProdutosScreen from './screens/BuscaProdutos';
import BuscaInsumosScreen from './screens/BuscaInsumo';
import GerenciarScreen from './screens/MenuCadastro';
import UsuariosScreen from './screens/Usuarios';
import InsumosScreen from './screens/Insumos';
import ProdutosScreen from './screens/Produtos';
import ListaPrateleiraScreen from './screens/ListaPrateleira';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          options={{ title: 'Login', headerShown: false }}
          component={LoginScreen}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ title: 'Menu Principal' }}
        />
        <Stack.Screen
          name="Menu Relatorio"
          component={RelatorioMenuScreen}
          options={{ title: 'Menu de Relatório' }}
        />
        <Stack.Screen
          name="Relatorio Lotes"
          component={RelatorioLotesScreen}
          options={{ title: 'Relatório Lotes' }}
        />
        <Stack.Screen
          name="Relatorio Aromas"
          component={RelatorioAromaScreen}
          options={{ title: 'Relatório Aromas' }}
        />
        <Stack.Screen
          name="Buscar Produtos"
          component={BuscaProdutosScreen}
          options={{ title: 'Buscar Produtos' }}
        />
        <Stack.Screen
          name="Buscar Insumos"
          component={BuscaInsumosScreen}
          options={{ title: 'Buscar Insumos' }}
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
          name="Lista Prateleira"
          component={ListaPrateleiraScreen}
          options={{ title: 'Lista de Item Prateleira' }}
        />
        <Stack.Screen
          name="Gerenciar"
          component={GerenciarScreen}
          options={{ title: 'Gerenciar' }}
        />
        <Stack.Screen
          name="Usuarios"
          component={UsuariosScreen}
          options={{ title: 'Usuários' }}
        />
        <Stack.Screen
          name="Insumos"
          component={InsumosScreen}
          options={{ title: 'Insumos' }}
        />
        <Stack.Screen
          name="Produtos"
          component={ProdutosScreen}
          options={{ title: 'Produtos' }}
        />
        <Stack.Screen
          name="Historico"
          component={HistoricoScreen}
          options={{ title: 'Histórico de Movimentação' }}
        />
        <Stack.Screen
          name="Relatorio Produtos"
          component={RelatorioProdutosScreen}
          options={{ title: 'Relatório de produtos' }}
        />
        <Stack.Screen
          name="Relatorio Movimentacao"
          component={RelatorioMovimentacaoScreen}
          options={{ title: 'Relatório de Movimentação' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
