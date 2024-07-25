import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";

const LotesScreen = ({ route }) => {
  const [lotes, setLotes] = useState([]);
  const [info, setInfo] = useState(false);
  const { id } = route.params;

  useEffect(() => {
    axios
      .get(`http://192.168.1.102:3000/buscarlotes?produto_id=${id}`)
      .then((response) => {
        const lotes = response.data;
        console.log(lotes);
        setLotes(lotes);
      })
      .catch((error) => {
        if (error.response.status == "404") {
          setInfo(true);
        }
      });
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    const options = { month: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {lotes.map((lote, index) => (
        <View
        key={lote.id}
        style={[styles.detailsContainer, index === 0 && styles.firstLote]}
        >
          {index == 0 && (<Text style={styles.detailsTextHeader}>Prioridade de saída</Text>)}
          <Text style={styles.detailsTextHeader}>Lote: {lote.nome_lote}</Text>
          <Text style={styles.detailsText}>
            Estoque: {lote.quantidade}
          </Text>
          <Text style={styles.detailsText}>
            Local Armazenado: {lote.nome_local || "Não registrado"}
          </Text>
          <Text style={styles.detailsText}>
            Coluna: {lote.coluna || "Não há esse produto no estoque"}
          </Text>
          <Text style={styles.detailsText}>
            Fabricação: {formatDate(lote.data_fabricacao)}
          </Text>
          <Text style={styles.detailsText}>
            Validade: {formatDate(lote.data_validade)}
          </Text>
        </View>
      ))}
      {info && (
        <Text style={styles.infoText}>Não há lotes para serem exibidos!</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailsContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
    width: "100%",
  },
  firstLote: {
    borderColor: "red",
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
    fontWeight: 'bold',
    textAlign: 'center'
  },
  detailsTextHeader: {
    fontSize: 25,
    marginBottom: 10,
    color: "#333",
    fontWeight: 'bold',
    textAlign: 'center',

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
  infoText: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default LotesScreen;
