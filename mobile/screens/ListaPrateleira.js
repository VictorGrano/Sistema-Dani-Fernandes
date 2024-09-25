import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import Loading from "../components/Loading";

const ListaPrateleiraScreen = () => {
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [quantidade, setQuantidade] = useState("");
  const [lista, setLista] = useState(true);
  const [listaPrateleira, setListaPrateleira] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [productNotFound, setProductNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchProdutos();
    fetchListaPrateleira();
  }, []);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/produtos/`);
      const produtosData = response.data.map((produto) => ({
        label: produto.nome,
        value: produto.id,
      }));
      setProdutos(produtosData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListaPrateleira = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/estoque/ListaPrateleira`);
      setListaPrateleira(response.data);
    } catch (error) {
      console.error("Error fetching lista prateleira:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (item) => {
    setLoading(true);
    setSelectedProduct(item.value);
    try {
      const response = await axios.get(
        `${apiUrl}/produtos/Lotes?produto_id=${item.value}`
      );
      if (response.data.length === 0) {
        setProductNotFound(true);
      } else {
        setLotes(response.data);
        setProductNotFound(false);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProductNotFound(true);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  const handleAdicionar = async () => {
    if (!quantidade) {
      Alert.alert("Erro", "Por favor, insira a quantidade.");
      return;
    }

    const quantidadeNumber = parseFloat(quantidade);
    let quantidadeRestante = quantidadeNumber;
    let lotesUsados = [];

    for (let i = 0; i < lotes.length; i++) {
      const lote = lotes[i];
      if (quantidadeRestante <= 0) break;

      if (quantidadeRestante > lote.quantidade) {
        lotesUsados.push({
          produto_id: selectedProduct,
          lote_id: lote.id,
          quantidade: lote.quantidade,

        });
        quantidadeRestante -= lote.quantidade;
      } else {
        lotesUsados.push({
          produto_id: selectedProduct,
          lote_id: lote.id,
          quantidade: quantidadeRestante,
        });
        quantidadeRestante = 0;
      }
    }

    setLoading(true);
    if (quantidadeRestante > 0) {
      Alert.alert(
        "Quantidade Insuficiente",
        "A quantidade disponível no estoque não é suficiente. Gostaria de adicionar a quantidade possível?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setLoading(false),
          },
          {
            text: "Adicionar",
            onPress: async () => {
              await adicionarProdutos(lotesUsados);
            },
          },
        ]
      );
    } else {
      await adicionarProdutos(lotesUsados);
    }
    setLoading(false);
  };

  const adicionarProdutos = async (lotesUsados) => {
    try {
      for (const dados of lotesUsados) {
        await axios.post(`${apiUrl}/estoque/AddPrateleira`, {
          ...dados,
          concluido: 0,
        });
      }
      Alert.alert("Sucesso!", "Produto adicionado com sucesso na lista!");
      fetchListaPrateleira(); // Refresh the list
    } catch (error) {
      if (
        error.response &&
        error.response.data.error === "Produto já adicionado na lista"
      ) {
        setErrorMessage("Produto já adicionado na lista");
      } else {
        console.error("Error adding product to list:", error);
      }
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  const handleExcluir = async (itemId) => {
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/estoque/ListaPrateleira/${itemId}`);
      Alert.alert("Sucesso!", "Produto removido da lista!");
      setLoading(false);
      fetchListaPrateleira(); // Refresh the list
    } catch (error) {
      console.error("Error deleting item from list:", error);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  const handleConfere = async (itemId) => {
    setLoading(true);
    try {
      await axios.put(`${apiUrl}/estoque/ListaPrateleira/Concluido/${itemId}`, {
        concluido: true,
      });
      Alert.alert("Sucesso!", "Produto marcado como concluído!");
      setLoading(false);
      fetchListaPrateleira(); // Refresh the list
    } catch (error) {
      console.error("Error marking item as completed:", error);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {!lista ? (
        <>
          <Text style={styles.header}>Adicionar Produto</Text>
          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}
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
          {productNotFound && (
            <Text style={styles.error}>Produto não encontrado no estoque.</Text>
          )}
          {selectedProduct && !productNotFound && (
            <View style={styles.containerAdd}>
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                placeholder="Quantidade"
                value={quantidade}
                onChangeText={setQuantidade}
              />
              <TouchableOpacity style={styles.button} onPress={handleAdicionar}>
                <Text style={styles.buttonText}>Adicionar item a lista</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setLista(true)}
          >
            <Text style={styles.buttonText}>Ver lista</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
        <View style={styles.viewButtons}>
          <TouchableOpacity
            style={styles.buttonAdd}
            onPress={() => setLista(false)}
          >
            <Text style={styles.buttonText}>Adicionar item a lista</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonAdd}
            onPress={() => {navigation.navigate("Escanear", { tipo: "saida", item: "produto"})}}
          >
            <Text style={styles.buttonText}>Saída</Text>
          </TouchableOpacity>
          </View>
          <View style={styles.tableContainer}>
            <FlatList
              data={listaPrateleira.sort((a, b) => a.concluido - b.concluido)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.tableRow,
                    item.concluido && styles.tableRowCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      item.concluido && styles.tableCellCompleted,
                    ]}
                  >
                   PRODUTO: {item.nome_produto}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      item.concluido && styles.tableCellCompleted,
                    ]}
                  >
                   LOTE: {item.nome_lote}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      item.concluido && styles.tableCellCompleted,
                    ]}
                  >
                   QUANTIDADE: {item.quantidade}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      item.concluido && styles.tableCellCompleted,
                    ]}
                  >
                   Local: {item.nome_local}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      item.concluido && styles.tableCellCompleted,
                    ]}
                  >
                   COLUNA: {item.coluna}
                  </Text>
                  <View style={styles.actionsContainer}>
                    {!item.concluido && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleConfere(item.id)}
                      >
                        <FontAwesome5 name="check" size={24} color="white" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleExcluir(item.id)}
                    >
                      <FontAwesome5 name="trash-alt" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  containerAdd: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  viewButtons: {
    flexDirection: "row",
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
  button: {
    backgroundColor: "#4D7EA8",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonAdd: {
    marginTop: 30,
    backgroundColor: "#4D7EA8",
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
  input: {
    height: 40,
    width: "40%",
    margin: 12,
    borderWidth: 0,
    padding: 10,
    color: "#222222",
    backgroundColor: "transparent",
    fontSize: 17,
    textAlign: "center",
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  tableContainer: {
    width: "100%",
    marginBottom: 80,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#4D7EA8",
    textAlign: "center",
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
  },
  tableRow: {
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  tableRowCompleted: {
    backgroundColor: "#d3d3d3",
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
  },
  tableCellCompleted: {
    textDecorationLine: "line-through",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#4D7EA8",
    padding: 5,
    marginHorizontal: 5,
    borderRadius: 4,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default ListaPrateleiraScreen;
