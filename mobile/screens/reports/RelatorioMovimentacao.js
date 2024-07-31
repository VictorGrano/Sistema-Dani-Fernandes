import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { Dropdown } from "react-native-element-dropdown";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import DateTimePicker from "@react-native-community/datetimepicker";
import Loading from "../../components/Loading";
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
  const [loading, setLoading] = useState(false);
  const [dateInicio, setDateInicio] = useState(null);
  const [dateFim, setDateFim] = useState(null);
  const [showDateInicioPicker, setShowDateInicioPicker] = useState(false);
  const [showDateFimPicker, setShowDateFimPicker] = useState(false);
  const [dataL, setDataL] = useState([]);
  const [selectedTipoM, setSelectedTipoM] = useState(null);

  const dataM = [
    {
      label: "Saída",
      value: "saída",
    },
    {
      label: "Entrada",
      value: "entrada",
    },
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
    console.log(filters);
    setLoading(true);
    await axios
      .post("http://192.168.1.177:3000/usuarios/Historico", filters)
      .then((response) => {
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
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setInfo(true);
        }
      });
    await axios
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
    await axios
      .get("http://192.168.1.177:3000/usuarios/")
      .then((response) => {
        const usuariosData = response.data.map((usuario) => ({
          label: usuario.nome,
          value: usuario.id,
        }));
        setUsuarios(usuariosData);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
    await axios
      .get("http://192.168.1.177:3000/estoque/Locais")
      .then((response) => {
        const dataLocais = response.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }));
        setDataL(dataLocais);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAplicarFiltro = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
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
    setDateInicio(null);
    setDateFim(null);
    setLoading(true);
    await fetchData();
    setLoading(false);
    setMostraFiltros(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleDateInicioChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateInicio;
    setShowDateInicioPicker(false);
    setDateInicio(currentDate);
    handleFilterChange("dataInicio", currentDate);
  };

  const handleDateFimChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateFim;
    setShowDateFimPicker(false);
    setDateFim(currentDate);
    handleFilterChange("dataFim", currentDate);
  };

  if (loading) {
    return <Loading />;
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
                  <th>Usuário</th>
                  <th>Tipo de Mudança</th>
                  <th>Produto</th>
                  <th>Lote</th>
                  <th>Quantidade Movimentada</th>
                  <th>Quantidade de Caixas movimentadas</th>
                  <th>Quantidade antes da movimentação</th>
                  <th>Quantiade de caixas antes da movimentação</th>
                  <th>Local armazenado:</th>
                  <th>Coluna:</th>
                  <th>Data da mudança:</th>
                  <th>Hora da mudança:</th>
                </tr>`;
    
        historicoData.forEach((item) => {
          htmlContent += `
                <tr>
                  <td>${item.usuario}</td>
                  <td>${item.tipo_mudanca}</td>
                  <td>${item.produto}</td>
                  <td>${item.lote}</td>
                  <td>${item.quantidade}</td>
                  <td>${item.caixas}</td>
                  <td>${item.quantidadeAntiga || 0}</td>
                  <td>${item.caixasAntiga || 0}</td>
                  <td>${item.local_armazenado}</td>
                  <td>${item.coluna}</td>
                  <td>${item.data_mudanca}</td>
                  <td>${item.hora_mudanca}</td>
                </tr>`;
        });
        htmlContent += `
              </table>
            </body>
          </html>`;
    
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
          fileName: `Relatorio_movimentacao${
            new Date().toISOString().split("T")[0]
          }.pdf`,
        });
        console.log("File has been saved to:", uri);
    
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
          <View>
            <TouchableOpacity
              onPress={() => setShowDateInicioPicker(true)}
              style={styles.input}
            >
              <Text>
                {filters.dataInicio
                  ? format(filters.dataInicio, "dd/MM/yyyy")
                  : "Data Início"}
              </Text>
            </TouchableOpacity>
            {showDateInicioPicker && (
              <DateTimePicker
                value={dateInicio || new Date()}
                mode="date"
                display="default"
                onChange={handleDateInicioChange}
              />
            )}
          </View>
          <View>
            <TouchableOpacity
              onPress={() => setShowDateFimPicker(true)}
              style={styles.input}
            >
              <Text>
                {filters.dataFim
                  ? format(filters.dataFim, "dd/MM/yyyy")
                  : "Data Fim"}
              </Text>
            </TouchableOpacity>
            {showDateFimPicker && (
              <DateTimePicker
                value={dateFim || new Date()}
                mode="date"
                display="default"
                onChange={handleDateFimChange}
              />
            )}
          </View>
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
            <FontAwesome5 name="check" size={24} color="white" />
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
  itemContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RelatorioMovimentacaoScreen;
