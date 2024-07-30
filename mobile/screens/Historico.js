import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { Dropdown } from "react-native-element-dropdown";

const HistoricoScreen = () => {
  const [historicoData, setHistoricoData] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mostraFiltros, setMostraFiltros] = useState(false);

  const [filters, setFilters] = useState({
    idusuario: "",
    dataInicio: "",
    dataFim: "",
    produtoid: "",
    lote: "",
    local_armazenado: "",
    tipo_mudança: "",
    ordenar: "data_mudanca",
  });

  const fetchData = () => {
    axios
      .post("http://192.168.1.177:3000/usuarios/Historico", filters)
      .then((response) => {
        const data = response.data.map((historico) => {
          const mov_data = JSON.parse(historico.valor_movimentacao);
          const mov_antigo = JSON.parse(historico.valor_antigo);
          const parsedDate = parseISO(historico.data_mudanca);
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
            local_armazenado: historico.local_armazenado,
            coluna: historico.coluna,
            data_mudanca: format(parsedDate, "dd/MM/yyyy"),
            hora_mudanca: format(parsedDate, "HH:mm:ss"),
          };
        });
        setHistoricoData(data);
      })
      .catch((error) => {
        console.error(error);
      });

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

    axios
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const formatData = (data) => {
    const result = format(data, "yyyy-mm-aaaa");
    return result;
  }

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.text}>Usuário: {item.usuario}</Text>
        <Text style={styles.text}>Tabela Alterada: {item.tabela}</Text>
        <Text style={styles.text}>Tipo de Mudança: {item.tipo_mudanca}</Text>
        <Text style={styles.text}>Produto: {item.produto}</Text>
        <Text style={styles.text}>Lote: {item.lote}</Text>
        <Text style={styles.text}>
          Quantidade Movimentação: {item.quantidade}
        </Text>
        <Text style={styles.text}>Quantidade de Caixas: {item.caixas}</Text>
        <Text style={styles.text}>
          Valor Antes da Movimentação: {item.quantidadeAntiga}
        </Text>
        <Text style={styles.text}>
          Quantidade de Caixas antes da Movimentação: {item.caixasAntiga}
        </Text>
        <Text style={styles.text}>
          Local Armazenado: {item.local_armazenado}
        </Text>
        <Text style={styles.text}>Coluna: {item.coluna}</Text>
        <Text style={styles.text}>Data da Mudança: {item.data_mudanca}</Text>
        <Text style={styles.text}>Hora da Mudança: {item.hora_mudanca}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title={mostraFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
        onPress={() => setMostraFiltros(!mostraFiltros)}
      />
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
          <TextInput
            style={styles.input}
            placeholder="Data Inicial"
            value={filters.dataInicio}
            onChangeText={(value) => handleFilterChange("dataInicio", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Data Final"
            value={filters.dataFim}
            onChangeText={(value) => handleFilterChange("dataFim", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Lote"
            value={filters.lote}
            onChangeText={(value) => handleFilterChange("lote", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Local Armazenado"
            value={filters.local_armazenado}
            onChangeText={(value) =>
              handleFilterChange("local_armazenado", value)
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Tipo de Mudança"
            value={filters.tipo_mudança}
            onChangeText={(value) => handleFilterChange("tipo_mudança", value)}
          />
          <Button title="Aplicar Filtros" onPress={fetchData} />
        </View>
      )}
      <FlatList
        data={historicoData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
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
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default HistoricoScreen;
