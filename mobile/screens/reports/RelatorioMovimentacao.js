import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { format, parse } from "date-fns";
import { Dropdown } from "react-native-element-dropdown";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Loading from "../../components/Loading"; // Importe o componente de Loading
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

const RelatorioMovimentacaoScreen = () => {
  const [historicoData, setHistoricoData] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [mostraFiltros, setMostraFiltros] = useState(false);
  const [info, setInfo] = useState(false);
  const [loading, setLoading] = useState(false); // Estado de loading
  const [dateInicio, setDateInicio] = useState("");
  const [dateFim, setDateFim] = useState("");
  const [dataL, setDataL] = useState([]);
  const [selectedTipoM, setSelectedTipoM] = useState(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const dataM = [
    { label: "Saída", value: "saída" },
    { label: "Entrada", value: "entrada" },
  ];

  const [filters, setFilters] = useState({
    idusuario: "",
    dataInicio: "",
    dataFim: "",
    produtoid: "",
    lote: "",
    local_armazenado: "",
    tipo_mudanca: "",
  });

  const fetchData = async () => {
 
    setLoading(true); // Inicia o loading
    try {
      const response = await axios.post(`${apiUrl}/usuarios/Historico`, filters);
      const data = response.data.map((historico) => {
        const mov_data = JSON.parse(historico.valor_movimentacao);
        const mov_antigo = JSON.parse(historico.valor_antigo);
        const parsedDate = historico.data_mudanca;
        return {
          usuario: historico.usuario,
          tabela: historico.tabela_alterada,
          tipo_mudanca: historico.tipo_mudanca,
          produto: historico.nome_produto,
          lote: historico.lote,
          quantidade: mov_data.quantidade,
          caixas: mov_data.quantidade_caixas,
          quantidadeAntiga: mov_antigo.quantidade,
          caixasAntiga: mov_antigo.quantidade_caixas,
          local_armazenado: historico.nome_local,
          coluna: historico.coluna,
          data_mudanca: format(parsedDate, "dd/MM/yyyy"),
          hora_mudanca: format(parsedDate, "HH:mm:ss"),
        };
      });
      setHistoricoData(data);
      setInfo(data.length === 0);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setInfo(true);
      }
    }
    try {
      const [produtosResponse, usuariosResponse, locaisResponse] = await Promise.all([
        axios.get(`${apiUrl}/produtos/`),
        axios.get(`${apiUrl}/usuarios/`),
        axios.get(`${apiUrl}/estoque/Locais`)
      ]);

      setProdutos(
        produtosResponse.data.map((produto) => ({
          label: produto.nome,
          value: produto.id,
        }))
      );

      setUsuarios(
        usuariosResponse.data.map((usuario) => ({
          label: usuario.nome,
          value: usuario.id,
        }))
      );

      setDataL(
        locaisResponse.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false); // Finaliza o loading
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAplicarFiltro = async () => {
    setLoading(true); // Inicia o loading
    await fetchData();
    setLoading(false); // Finaliza o loading
    setMostraFiltros(false);
  };

  const handleFilterClear = async () => {
    setFilters({
      idusuario: "",
      dataInicio: "",
      dataFim: "",
      produtoid: "",
      lote: "",
      local_armazenado: "",
      tipo_mudanca: "",
    });
    setDateInicio("");
    setDateFim("");
    setLoading(true); // Inicia o loading
    await fetchData();
    setLoading(false); // Finaliza o loading
    setMostraFiltros(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleDateChange = (key, value) => {
    const formattedValue = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1");

    if (formattedValue.length === 10) {
      try {
        const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date());
        const formattedDate = format(parsedDate, "yyyy-MM-dd");
        handleFilterChange(key, formattedDate);

        if (key === "dataInicio") {
          setDateInicio(formattedDate);
        } else {
          setDateFim(formattedDate);
        }
      } catch (error) {
        console.error("Invalid date format:", error);
      }
    } else {
      handleFilterChange(key, formattedValue);

      if (key === "dataInicio") {
        setDateInicio(formattedValue);
      } else {
        setDateFim(formattedValue);
      }
    }
  };

  const calculaTotal = (item) => {
    if (item.tipo_mudanca === "entrada") {
      if (isNaN(item.quantidadeAntiga)) {
        item.quantidadeAntiga = 0;
      }
      return parseInt(item.quantidadeAntiga) + parseInt(item.quantidade);
    } else if (item.tipo_mudanca === "saída") {
      return parseInt(item.quantidadeAntiga) - parseInt(item.quantidade);
    } else {
      return 0;
    }
  };

  if (loading) {
    return <Loading />; // Exibe o componente de loading
  }

  const criaPDF = async () => {
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
              <h1>Relatório de Movimentação</h1>
              <table>
                <tr>
                  <th>Data da movimentação:</th>
                  <th>Hora da movimentação:</th>
                  <th>Usuário</th>
                  <th>Tipo de Movimentação</th>
                  <th>Produto</th>
                  <th>Lote</th>
                  <th>Quantiade anterior</th>
                  <th>Quantidade Atual</th>
                  <th>Quantia de produtos movimentada</th>
                  <th>Local armazenado:</th>
                  <th>Coluna:</th>
                </tr>`;

      historicoData.forEach((item) => {
        htmlContent += `
                <tr>
                  <td>${item.data_mudanca}</td>
                  <td>${item.hora_mudanca}</td>
                  <td>${item.usuario}</td>
                  <td>${item.tipo_mudanca}</td>
                  <td>${item.produto}</td>
                  <td>${item.lote}</td>
                  <td>${item.quantidadeAntiga || 0}</td>
                  <td>${calculaTotal(item)}</td>
                  <td>${item.quantidade || 0}</td>
                  <td>${item.local_armazenado}</td>
                  <td>${item.coluna}</td>
                </tr>`;
      });
      htmlContent += `
              </table>
            </body>
          </html>`;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        fileName: `Relatorio_movimentacao_${new Date().toISOString().split("T")[0]}.pdf`,
      });

 

      Alert.alert(
        "PDF Gerado",
        "O relatório de movimentação foi gerado com sucesso!",
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
      <Text style={styles.header}>
        Filtre abaixo (Ou aperte em Gerar PDF para gerar um relatório geral).
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setMostraFiltros(!mostraFiltros)}
      >
        <FontAwesome5 name="filter" size={24} color="white" />
        {mostraFiltros ? (
          <Text style={styles.buttonText}>Ocultar filtros</Text>
        ) : (
          <Text style={styles.buttonText}>Mostrar filtros</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleFilterClear}>
        <FontAwesome5 name="trash" size={24} color="white" />
        <Text style={styles.buttonText}>Limpar filtros</Text>
      </TouchableOpacity>
      {mostraFiltros && (
        <View style={styles.filterContainer}>
          <Dropdown
            style={styles.dropdown}
            data={usuarios}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um usuário"
            value={selectedUsuario}
            onChange={(item) => {
              setSelectedUsuario(item.value);
              handleFilterChange("idusuario", item.value);
            }}
          />
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
              handleFilterChange("produtoid", item.value);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            data={dataL}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um local"
            value={selectedLocal}
            onChange={(item) => {
              setSelectedLocal(item.value);
              handleFilterChange("local_armazenado", item.value);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            data={dataM}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione o tipo de movimentação"
            value={selectedTipoM}
            onChange={(item) => {
              setSelectedTipoM(item.value);
              handleFilterChange("tipo_mudanca", item.value);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Data Início (dd/MM/yyyy)"
            value={dateInicio}
            onChangeText={(value) => handleDateChange("dataInicio", value)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Data Fim (dd/MM/yyyy)"
            value={dateFim}
            onChangeText={(value) => handleDateChange("dataFim", value)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Lote"
            value={filters.lote}
            onChangeText={(value) => handleFilterChange("lote", value)}
          />
          <TouchableOpacity style={styles.button} onPress={handleAplicarFiltro}>
            <FontAwesome5 name="check" size={24} color="white" />
            <Text style={styles.buttonText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      )}
      {info ? (
        <Text style={styles.infoText}>
          Nenhum histórico encontrado. Limpe os filtros e tente novamente
        </Text>
      ) : (
        <TouchableOpacity style={styles.button} onPress={criaPDF}>
          <FontAwesome5 name="file-pdf" size={24} color="white" />
          <Text style={styles.buttonText}>Gerar PDF</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: "#D8B4E2",
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
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RelatorioMovimentacaoScreen;
