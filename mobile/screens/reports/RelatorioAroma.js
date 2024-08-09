import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Dropdown } from "react-native-element-dropdown";


const RelatorioAromaScreen = () => {
  const [aromas, setAromas] = useState([]);
  const [selectedAroma, setSelectedAroma] = useState(null);
  const [aromaDetails, setAromaDetails] = useState([]);
  const [total, setTotal] = useState(0);
  const [valorEstoque, setValorEstoque] = useState(0);

  useEffect(() => {
    axios
      .get(`http://192.168.1.177:3000/produtos/Aromas`)
      .then((response) => {
        const aromasData = response.data.map((aroma) => ({
          label: aroma.nome_aroma,
          value: aroma.cod_aroma,
        }));
        setAromas(aromasData);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const handleAromaSelect = (item) => {
    setSelectedAroma(item.value);
    console.log(aromas[0].categoria)
    axios
      .get(`http://192.168.1.177:3000/produtos/InfoAromas?cod_aroma=${item.value}`)
      .then((response) => {
        const infoAromas = response.data.map((aroma) => ({
          nome_produto: aroma.nome,
          estoque_produto: parseFloat(aroma.estoque_total) || 0,
          preco: parseFloat(aroma.preco) || 0,
          categoria: aroma.categoria,
          unidade: aroma.unidade,
          descricao: aroma.descricao,
          nome_aroma: aroma.nome_aroma,
          valor_total: (parseFloat(aroma.preco) || 0) * (parseFloat(aroma.estoque_total) || 0)
        }));

        const totalEstoque = infoAromas.reduce((acc, curr) => acc + curr.estoque_produto, 0);
        const valorTotalEstoque = infoAromas.reduce((acc, curr) => acc + curr.valor_total, 0);
        setTotal(totalEstoque);
        setValorEstoque(valorTotalEstoque);
        setAromaDetails(infoAromas);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
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
            <h1>Relatório de Aromas - ${aromaDetails[0].nome_aroma}</h1>
            <h3>Total de Produtos: ${total.toLocaleString('pt-br')}</h3>
            <h3>Valor total no estoque: R$${valorEstoque.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <table>
              <tr>
                <th>Nome do Produto</th>
                <th>Tipo do Produto</th>
                <th>Estoque do Produto</th>
                <th>Preço Unitário</th>
                <th>Valor Total</th>
              </tr>`;

      aromaDetails.forEach((item) => {
        htmlContent += `
              <tr>
                <td>${item.nome_produto}</td>
                <td>${item.categoria}</td>
                <td>${item.estoque_produto.toLocaleString('pt-br')}</td>
                <td>R$${item.preco.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>R$${item.valor_total.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>`;
      });

      htmlContent += `
            </table>
          </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        fileName: `Relatorio_Aromas_${
          new Date().toISOString().split("T")[0]
        }.pdf`,
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
      <Text style={styles.header}>Escolha o Aroma: </Text>
      <Dropdown
        style={styles.dropdown}
        data={aromas}
        search={true}
        labelField="label"
        valueField="value"
        placeholder="Selecione um aroma"
        value={selectedAroma}
        onChange={handleAromaSelect}
      />
      {aromaDetails.length > 0 && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>
            Estoque: {total.toLocaleString('pt-br')}
          </Text>
          <Text style={styles.detailsText}>
            Unidade de Medida: {aromaDetails[0].unidade || "Não há uma unidade de medida definida."}
          </Text>
          <Text style={styles.detailsText}>
            Valor Total no Estoque: R${valorEstoque.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.detailsText}>
            Descrição: {aromaDetails[0].descricao || "Não há descrição."}
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={generatePDF}>
        <Text style={styles.buttonText}>Gerar PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    alignItems: "center",
    padding: 8,
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
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default RelatorioAromaScreen;
