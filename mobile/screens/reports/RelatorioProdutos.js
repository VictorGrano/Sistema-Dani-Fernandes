import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Dropdown } from "react-native-element-dropdown";
import Loading from "../../components/Loading";

const RelatorioProdutosScreen = () => {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [filters, setFilters] = useState({
    id: "",
    categoria_id: "",
    cod_aroma: "",
    preco: "",
  });
  const [mostraFiltros, setMostraFiltros] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAroma, setSelectedAroma] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [aromas, setAromas] = useState([]);
  const [tipos, setTipos] = useState([]);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  // Carrega dados de produtos, aromas e tipos
  const fetchData = async () => {
    setLoading(true);
    try {
      const [produtosResponse, aromasResponse, tipoResponse] = await Promise.all([
        axios.get(`${apiUrl}/produtos/`),
        axios.get(`${apiUrl}/produtos/Aromas`),
        axios.get(`${apiUrl}/produtos/Tipo`)
      ]);
      
      setProdutos(
        produtosResponse.data.map((produto) => ({
          label: produto.nome,
          value: produto.id,
        }))
      );
      
      setAromas(
        aromasResponse.data.map((aroma) => ({
          label: aroma.nome_aroma,
          value: aroma.cod_aroma,
        }))
      );
      
      setTipos(
        tipoResponse.data.map((tipo) => ({
          label: tipo.nome_categoria,
          value: tipo.id,
        }))
      );
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados. Tente novamente.");
    }
    setLoading(false);
  };

  const fetchProdutos = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/produtos/RelatorioProdutos`,
        filters
      );
      return response.data.map((produto) => ({
        nome: produto.nome,
        descricao: produto.descricao,
        estoque: parseFloat(produto.estoque_total) || 0,
        unidade: produto.unidade,
        valor_unitario: parseFloat(produto.preco) || 0,
        valor_total: (parseFloat(produto.preco) || 0) * (parseFloat(produto.estoque_total) || 0),
      }));
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar produtos.");
      throw error;
    }
  };

  const aplicarFiltro = async () => {
    setLoading(true);
    try {
      await fetchProdutos();
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
    }
    setLoading(false);
    setMostraFiltros(false);
  };

  const limparFiltros = async () => {
    setFilters({
      id: "",
      categoria_id: "",
      cod_aroma: "",
      preco: "",
    });
    setSelectedAroma(null);
    setSelectedProduct(null);
    setSelectedTipo(null);
    setLoading(true);
    await fetchProdutos();
    setLoading(false);
    setMostraFiltros(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const produtos = await fetchProdutos();
      let totalEstoque = produtos.reduce((acc, item) => acc + item.estoque, 0);
      let valorTotalEstoque = produtos.reduce((acc, item) => acc + item.valor_total, 0);

      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Relatório de Estoque</h1>
            <h2>Total de Produtos: ${totalEstoque.toLocaleString("pt-br")}</h2>
            <h2>Valor total no estoque: R$${valorTotalEstoque.toLocaleString(
              "pt-br",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}</h2>
            <table>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Descrição</th>
                <th>Unidade</th>
                <th>Valor Unitário</th>
                <th>Valor Total</th>
              </tr>`;

      produtos.forEach((item) => {
        htmlContent += `
              <tr>
                <td>${item.nome}</td>
                <td>${item.estoque.toLocaleString("pt-br")}</td>
                <td>${item.descricao || "Não Possui"}</td>
                <td>${item.unidade}</td>
                <td>R$${item.valor_unitario.toLocaleString("pt-br", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
                <td>R$${item.valor_total.toLocaleString("pt-br", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
              </tr>`;
      });

      htmlContent += `
            </table>
          </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        fileName: `Relatorio_Estoque_${
          new Date().toISOString().split("T")[0]
        }.pdf`,
      });

      Alert.alert(
        "PDF Gerado",
        "O relatório de estoque foi gerado com sucesso!"
      );

      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao gerar o PDF.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Filtre abaixo (Ou aperte em Gerar PDF para gerar um relatório geral).
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setMostraFiltros(!mostraFiltros)}
      >
        <FontAwesome5 name="filter" size={24} color="white" />
        <Text style={styles.buttonText}>
          {mostraFiltros ? "Ocultar filtros" : "Mostrar filtros"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={limparFiltros}>
        <FontAwesome5 name="trash" size={24} color="white" />
        <Text style={styles.buttonText}>Limpar filtros</Text>
      </TouchableOpacity>
      {mostraFiltros && (
        <View style={styles.filterContainer}>
          <Dropdown
            style={styles.dropdown}
            data={produtos}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um produto"
            value={selectedProduct}
            onChange={(item) => {
              setSelectedProduct(item.value);
              handleFilterChange("id", item.value);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            data={aromas}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um aroma"
            value={selectedAroma}
            onChange={(item) => {
              setSelectedAroma(item.value);
              handleFilterChange("cod_aroma", item.value);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            data={tipos}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um tipo de produto"
            value={selectedTipo}
            onChange={(item) => {
              setSelectedTipo(item.value);
              handleFilterChange("categoria_id", item.value);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Preço"
            value={filters.preco}
            onChangeText={(value) => handleFilterChange("preco", value)}
          />
          <TouchableOpacity style={styles.button} onPress={aplicarFiltro}>
            <FontAwesome5 name="check" size={24} color="white" />
            <Text style={styles.buttonText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={gerarRelatorio}>
        <FontAwesome5 name="file-pdf" size={24} color="white" />
        <Text style={styles.buttonText}>Gerar PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  filterContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
    justifyContent: "center",
  },
  dropdown: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4D7EA8",
    elevation: 10,
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 10,
  },
  header: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RelatorioProdutosScreen;
