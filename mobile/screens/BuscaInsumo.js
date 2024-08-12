import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation } from "@react-navigation/native";

const BuscaInsumosScreen = () => {
  const [insumos, setInsumos] = useState([]);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [insumoDetails, setInsumoDetails] = useState(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  useEffect(() => {
    axios
      .get(`${apiUrl}/insumos/`)
      .then((response) => {
        const insumosData = response.data.map((produto) => ({
          label: produto.nome,
          value: produto.id,
        }));
        setInsumos(insumosData);
      })
      .catch()
  }, []);

  const handleInsumoSelect = (item) => {
    setSelectedInsumo(item.value);
    axios
      .get(`${apiUrl}/insumos/InfoInsumo?id=${item.value}`)
      .then((response) => {
        setInsumoDetails(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Buscar Insumo</Text>
      <Dropdown
        style={styles.dropdown}
        data={insumos}
        search={true}
        labelField="label"
        valueField="value"
        placeholder="Selecione um produto"
        value={selectedInsumo}
        onChange={handleInsumoSelect}
      />
      {insumoDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Nome: {insumoDetails.nome}</Text>
          <Text style={styles.detailsText}>Tipo de Insumo: {insumoDetails.tipo_insumo}</Text>
          <Text style={styles.detailsText}>
            Estoque:{" "}
            {insumoDetails.estoque.toLocaleString('pt-br') || "Não há esse produto no estoque."}
          </Text>
          <Text style={styles.detailsText}>
            Preço Unitário: R${insumoDetails.preco.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0"}
          </Text>
          <Text style={styles.detailsText}>
            Descrição: {insumoDetails.descricao || "Não há descrição."}
          </Text>
          <Text style={styles.detailsText}>
            Local Armazenado: {insumoDetails.nome_local || "Não há descrição."}
          </Text>
          <Text style={styles.detailsText}>
            Coluna: {insumoDetails.coluna || "Não há descrição."}
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
  button: {
    backgroundColor: "#D8B4E2",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BuscaInsumosScreen;
