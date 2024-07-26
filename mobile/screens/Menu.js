import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-gifted-charts";
import axios from "axios";

const MenuScreen = () => {
  const navigation = useNavigation();
  const [dados, setDados] = useState([]);

  const fetchDados = useCallback(() => {
    axios
      .get("http://192.168.1.102:3000/estoque/QuantidadeEstoque")
      .then((response) => {
        const dadosr = response.data.map((estoque) => ({
          value: estoque.estoque_local,
          nome: estoque.nome_local,
          frontColor: getRandomColor(), // Função para gerar cores aleatórias
        }));
        setDados(dadosr);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDados();
    }, [fetchDados])
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Visão Geral do Estoque:</Text>
        <BarChart
          textBackgroundColor="white"
          textColor="black"
          textAlign="center"
          alignItems="center"
          barBorderRadius={4}
          data={dados}
          showValuesAsTopLabel
          rotateLabel
          maxValue = {10000}
        />
        <Legend data={dados} />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Menu Relatorio")}
      >
        <Text style={styles.buttonText}>Relatório</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Buscar")}
      >
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Escanear", { tipo: "entrada" })}
      >
        <Text style={styles.buttonText}>Registrar Entrada</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Escanear", { tipo: "saida" })}
      >
        <Text style={styles.buttonText}>Registrar Saída</Text>
      </TouchableOpacity>
    </View>
  );
};

const Legend = ({ data }) => {
  return (
    <View style={styles.legendContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: item.frontColor }]} />
          <Text style={styles.legendText}>{item.nome}</Text>
        </View>
      ))}
    </View>
  );
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#D8B4E2",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 50,
    elevation: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    marginTop: -50,
  },
  header: {
    fontSize: 25,
    marginBottom: 10,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 16,
  },
});

export default MenuScreen;
