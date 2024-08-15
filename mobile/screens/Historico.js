import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { format, parse } from "date-fns";
import { Dropdown } from "react-native-element-dropdown";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Loading from "../components/Loading";

const HistoricoScreen = () => {
  const [historicoData, setHistoricoData] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [mostraFiltros, setMostraFiltros] = useState(false);
  const [info, setInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateInicio, setDateInicio] = useState("");
  const [dateFim, setDateFim] = useState("");
  const [dataL, setDataL] = useState([]);
  const [selectedTipoM, setSelectedTipoM] = useState(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

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
    setLoading(true);
    try {
      // Executa todas as requisições em paralelo
      const [historicoResponse, produtosResponse, usuariosResponse, locaisResponse] = await Promise.all([
        axios.post(`${apiUrl}/usuarios/Historico`, filters),
        axios.get(`${apiUrl}/produtos/`),
        axios.get(`${apiUrl}/usuarios/`),
        axios.get(`${apiUrl}/estoque/Locais`)
      ]);
  
      // Processa os dados do histórico
      const data = historicoResponse.data.map((historico) => {
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
  
      // Processa os dados dos produtos, usuários e locais
      const produtosData = produtosResponse.data.map((produto) => ({
        label: produto.nome,
        value: produto.id,
      }));
      setProdutos(produtosData);
  
      const usuariosData = usuariosResponse.data.map((usuario) => ({
        label: usuario.nome,
        value: usuario.id,
      }));
      setUsuarios(usuariosData);
  
      const dataLocais = locaisResponse.data.map((local) => ({
        label: local.nome_local,
        value: local.id,
      }));
      setDataL(dataLocais);
  
    } catch (error) {
      console.error("Error fetching data:", error);
      setInfo(true);  // Caso ocorra um erro
    } finally {
      setLoading(false);  // Tirar o estado de loading ao fim do processo
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAplicarFiltro = async () => {
    setLoading(true);
    await fetchData();
    setMostraFiltros(false);
  };

  const handleFilterClear = async () => {
    // Colocar a aplicação em estado de loading
    setLoading(true);
  
    // Resetar os filtros e os estados de filtro visual antes de buscar os dados
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
    setSelectedUsuario(null);
    setSelectedProduct(null);
    setSelectedLocal(null);
    setSelectedTipoM(null);
  
    // Agora fazer a requisição dos dados com os filtros limpos
    await fetchData();
  
    // Depois que os dados forem carregados, tirar o loading
    setLoading(false);
    await fetchData();
  
    // Fechar a tela de filtros
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
    return <Loading />;
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>Usuário: {item.usuario}</Text>
      <Text style={styles.text}>Alteração: {item.tabela}</Text>
      <Text style={styles.text}>Tipo de movimentação: {item.tipo_mudanca}</Text>
      <Text style={styles.text}>Produto: {item.produto}</Text>
      <Text style={styles.text}>Lote: {item.lote}</Text>
      <Text style={styles.text}>Quantidade movimentada: {item.quantidade}</Text>
      <Text style={styles.text}>Caixas Movimentadas: {item.caixas}</Text>
      <Text style={styles.text}>
        Quantidade Antiga: {item.quantidadeAntiga || 0}
      </Text>
      <Text style={styles.text}>Quantidade Atual: {calculaTotal(item)}</Text>
      <Text style={styles.text}>Local Armazenado: {item.local_armazenado}</Text>
      <Text style={styles.text}>Coluna: {item.coluna}</Text>
      <Text style={styles.text}>Data da Mudança: {item.data_mudanca}</Text>
      <Text style={styles.text}>Hora da Mudança: {item.hora_mudanca}</Text>
    </View>
  );

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
        <FlatList
          data={historicoData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
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
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
});

export default HistoricoScreen;
