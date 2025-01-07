import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import Loading from "../components/Loading"; // Importa o componente de Loading

const BuscaMateriasPrimasScreen = () => {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [selectedMateriaPrima, setSelectedMateriaPrima] = useState(null);
  const [materiaPrimaDetails, setMateriaPrimaDetails] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de loading

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    setLoading(true); // Inicia o loading
    axios
      .get(`${apiUrl}/materia-prima/`)
      .then((response) => {
        const materiasPrimasData = response.data.map((item) => ({
          label: item.materia_prima,
          value: item.id,
        }));
        setMateriasPrimas(materiasPrimasData);
      })
      .catch((error) => {
        console.error("Erro ao buscar matérias-primas:", error);
      })
      .finally(() => {
        setLoading(false); // Finaliza o loading
      });
  }, [apiUrl]);

  const handleMateriaPrimaSelect = (item) => {
    setSelectedMateriaPrima(item.value);
    setLoading(true); // Inicia o loading
    axios
      .get(`${apiUrl}/materia-prima/Info?id=${item.value}`)
      .then((response) => {
        setMateriaPrimaDetails(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar detalhes da matéria-prima:", error);
      })
      .finally(() => {
        setLoading(false); // Finaliza o loading
      });
  };

  if (loading) {
    return <Loading />; // Exibe o componente Loading
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Buscar Matéria-Prima</Text>
      <Dropdown
        style={styles.dropdown}
        data={materiasPrimas}
        search={true}
        labelField="label"
        valueField="value"
        placeholder="Selecione uma matéria-prima"
        value={selectedMateriaPrima}
        onChange={handleMateriaPrimaSelect}
      />
      {materiaPrimaDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Nome: {materiaPrimaDetails.materia_prima}</Text>
          <Text style={styles.detailsText}>
            Estoque:{" "}
            {materiaPrimaDetails.estoque?.toLocaleString('pt-br') || "Sem estoque"}
          </Text>
          <Text style={styles.detailsText}>Medida: {materiaPrimaDetails.medida}</Text>
          <Text style={styles.detailsText}>
            Preço Unitário: R${materiaPrimaDetails.preco?.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}
          </Text>
          <Text style={styles.detailsText}>
            Descrição: {materiaPrimaDetails.descricao || "Não disponível"}
          </Text>
          <Text style={styles.detailsText}>
            Local Armazenado: {materiaPrimaDetails.nome_local || "Não disponível"}
          </Text>
          <Text style={styles.detailsText}>
            Coluna: {materiaPrimaDetails.coluna || "Não especificado"}
          </Text>
        </View>
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
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  dropdown: {
    marginBottom: 20,
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 8,
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
  detailsText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default BuscaMateriasPrimasScreen;
