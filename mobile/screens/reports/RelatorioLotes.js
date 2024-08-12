import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Dropdown } from "react-native-element-dropdown";

const RelatorioLotesScreen = () => {
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [lotes, setLotes] = useState([]);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  useEffect(() => {
    axios
      .get(`${apiUrl}/produtos/`)
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
      .get(`${apiUrl}/produtos/InfoProduto?id=${item.value}`)
      .then((response) => {
        setProductDetails(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
        axios
          .get(`${apiUrl}/produtos/Lotes?produto_id=${item.value}`)
          .then((response) => {
            const lotes = response.data;
            console.log(lotes);
            setLotes(lotes);
          })
          .catch((error) => {
            if (error.response.status == "404") {
              console.log('Erro 404');
            }
          });
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    const options = { month: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };
  const formatDateEntrada = (dateString) => {
    if (!dateString) return "Data não disponível";
    const options = { month: "numeric", year: "numeric", day: 'numeric' };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const generatePDF = async () => {
    try {
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
            <h1>Relatório de Lotes - ${productDetails.nome}</h1>
            <h3>Tipo de Produto: ${productDetails.categoria}</h3>
            <h3>Total de Produtos: ${productDetails.estoque_total}</h3>
            <h3>Total de Caixas: ${productDetails.total_caixas}</h3>
            <table>
              <tr>
                <th>Lote do Produto</th>
                <th>Quantidade de Produtos</th>
                <th>Quantidade de Caixas</th>
                <th>Data de Entrada</th>
                <th>Data de Fabricação</th>
                <th>Data de Validade</th>
                <th>Local Armazenado</th>
                <th>Coluna</th>
              </tr>`;

      lotes.forEach((item) => {
        htmlContent += `
              <tr>
                <td>${item.nome_lote}</td>
                <td>${item.quantidade}</td>
                <td>${item.quantidade_caixas}</td>
                <td>${formatDateEntrada(item.data_entrada) || 'Não Possui'}</td>
                <td>${formatDate(item.data_fabricacao) || 'Não Possui'}</td>
                <td>${formatDate(item.data_validade) || 'Não Possui'}</td>
                <td>${item.nome_local}</td>
                <td>${item.coluna}</td>
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
        OrientationType: 'landscape'
      });
      console.log("File has been saved to:", uri);

      Alert.alert(
        "PDF Gerado",
        "O relatório de estoque foi gerado com sucesso!",
        [{ text: "OK" }]
      );

      await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Erro", "Ocorreu um erro ao gerar o PDF.");
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.header}>Escolha o Produto: </Text>
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
            {productDetails.estoque_total || "Não há esse produto no estoque."}
          </Text>
          <Text style={styles.detailsText}>
            Quantidade de Caixas:{" "}
            {productDetails.total_caixas || 0}
          </Text>
          <Text style={styles.detailsText}>
            Unidade de Medida:{" "}
            {productDetails.unidade || "Não há uma unidade de medida definida."}
          </Text>
          <Text style={styles.detailsText}>
            Preço Unitário: {productDetails.preco || "Preço não registrado."}
          </Text>
          <Text style={styles.detailsText}>
            Descrição: {productDetails.descricao || "Não há descrição."}
          </Text>
      </View>
      )}
      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText} >Gerar PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    alignItems: 'center',
    padding: 8,
  },
  spacer: {
    height: 8,
  },
  printer: {
    textAlign: "center",
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

export default RelatorioLotesScreen;
