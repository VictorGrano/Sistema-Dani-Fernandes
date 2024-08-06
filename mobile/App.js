import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [id, setID] = useState(null);
  const [nome, setNome] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedId = await AsyncStorage.getItem('id');
        const storedNome = await AsyncStorage.getItem('nome');
        if (storedId !== null && storedNome !== null) {
          setID(storedId);
          setNome(storedNome);
        }
      } catch (e) {
        console.log('Erro ao recuperar dados do AsyncStorage!', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const handleLogin = async (userId, userName) => {
    try {
      await AsyncStorage.setItem('id', userId);
      await AsyncStorage.setItem('nome', userName);
      setID(userId);
      setNome(userName);
    } catch (e) {
      console.log('Erro ao salvar dados no AsyncStorage!', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('id');
      await AsyncStorage.removeItem('nome');
      setID(null);
      setNome(null);
    } catch (e) {
      console.log('Erro ao remover dados do AsyncStorage!', e);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={id ? 'Menu' : 'Login'}>
        <Stack.Screen
          name="Login"
          options={{ title: 'Login', headerShown: false }}
        >
          {props => <LoginScreen {...props} onLogin={handleLogin} />}
        </Stack.Screen>
        <Stack.Screen
          name="Menu"
          options={{ title: 'Menu Principal' }}
        >
          {props => <MenuScreen {...props} onLogout={handleLogout} />}
        </Stack.Screen>
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
