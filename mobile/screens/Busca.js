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

const BuscaScreen = () => {
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    axios
      .get("http://192.168.1.177:3000/produtos/")
      .then((response) => {
        const produtosData = response.data.map((produto) => ({
          label: produto.nome,
          value: produto.id,
        }));
        setProdutos(produtosData);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const handleProductSelect = (item) => {
    setSelectedProduct(item.value);
    axios
      .get(`http://192.168.1.177:3000/produtos/InfoProduto?id=${item.value}`)
      .then((response) => {
        setProductDetails(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Buscar Produto</Text>
      <Dropdown
        style={styles.dropdown}
        data={produtos}
        search={true}
        labelField="label"
        valueField="value"
        placeholder="Selecione um produto"
        value={selectedProduct}
        onChange={handleProductSelect}
      />
      {productDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Nome: {productDetails.nome}</Text>
          <Text style={styles.detailsText}>
            Aroma: {productDetails.nome_aroma || "Não registrado."}
          </Text>
          <Text style={styles.detailsText}>
            Estoque:{" "}
            {productDetails.estoque_total.toLocaleString('pt-br') || "Não há esse produto no estoque."}
          </Text>
          <Text style={styles.detailsText}>
            Unidade de Medida:{" "}
            {productDetails.unidade || "Não há uma unidade de medida definida."}
          </Text>
          <Text style={styles.detailsText}>
            Preço Unitário: R${productDetails.preco.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0"}
          </Text>
          <Text style={styles.detailsText}>
            Descrição: {productDetails.descricao || "Não há descrição."}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Lotes", { id: productDetails.id })}
          >
            <Text style={styles.buttonText}>Ver Lotes do Produto</Text>
          </TouchableOpacity>
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

export default BuscaScreen;
