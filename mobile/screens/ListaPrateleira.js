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
import { useNavigation } from "@react-navigation/native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';



const ListaPrateleiraScreen = () => {
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lotes, setLotes] = useState(null);
  const [quantidade, setQuantidade] = useState("");
  const [lista, setLista] = useState(true);
  const [listaPrateleira, setListaPrateleira] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [productNotFound, setProductNotFound] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    axios
      .get(`http://192.168.1.177:3000/produtos/`)
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

    // Fetch the existing items in the list
    fetchListaPrateleira();
  }, []);

  const fetchListaPrateleira = () => {
    axios
      .get(`http://192.168.1.177:3000/estoque/ListaPrateleira`)
      .then((response) => {
        setListaPrateleira(response.data);
      })
      .catch((error) => {
        console.error("Error fetching lista prateleira:", error);
      });
  };

  const handleProductSelect = (item) => {
    setSelectedProduct(item.value);
    axios
      .get(`http://192.168.1.177:3000/produtos/Lotes?produto_id=${item.value}`)
      .then((response) => {
        if (response.data.length === 0) {
          setProductNotFound(true);
        } else {
          setLotes(response.data);
          setProductNotFound(false);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setProductNotFound(true);
        } else {
          console.error("Error fetching product details:", error);
        }
      });
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
        lotesUsados.push({ produto_id: selectedProduct, lote_id: lote.id, quantidade: lote.quantidade });
        quantidadeRestante -= lote.quantidade;
      } else {
        lotesUsados.push({ produto_id: selectedProduct, lote_id: lote.id, quantidade: quantidadeRestante });
        quantidadeRestante = 0;
      }
    }
  
    if (quantidadeRestante > 0) {
      Alert.alert(
        "Quantidade Insuficiente",
        "A quantidade disponível no estoque não é suficiente. Gostaria de adicionar a quantidade possível?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Adicionar",
            onPress: async () => {
              try {
                for (const dados of lotesUsados) {
                  await axios.post(
                    "http://192.168.1.177:3000/estoque/AddPrateleira",
                    { ...dados, concluido: 0 }
                  );
                }
                Alert.alert("Sucesso!", "Produto adicionado com a quantidade disponível.");
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
              }
            },
          },
        ]
      );
    } else {
      try {
        for (const dados of lotesUsados) {
          await axios.post(
            `http://192.168.1.177:3000/estoque/AddPrateleira`,
            { ...dados, concluido: 0 }
          );
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
      }
    }
  };
  

  const handleExcluir = (itemId) => {
    axios
      .delete(`http://192.168.1.177:3000/estoque/ListaPrateleira/${itemId}`)
      .then(() => {
        Alert.alert("Sucesso!", "Produto removido da lista!");
        fetchListaPrateleira(); // Refresh the list
      })
      .catch((error) => {
        console.error("Error deleting item from list:", error);
      });
  };

  const handleConfere = (itemId) => {
    axios
      .put(`http://192.168.1.177:3000/estoque/ListaPrateleira/Concluido/${itemId}`, { concluido: true })
      .then(() => {
        Alert.alert("Sucesso!", "Produto marcado como concluído!");
        fetchListaPrateleira(); // Refresh the list
      })
      .catch((error) => {
        console.error("Error marking item as completed:", error);
      });
  };

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
            <Text style={styles.error}>
              Produto não encontrado no estoque.
            </Text>
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
          <TouchableOpacity
            style={styles.button}
            onPress={() => setLista(false)}
          >
            <Text style={styles.buttonText}>Adicionar item a lista</Text>
          </TouchableOpacity>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Produto</Text>
              <Text style={styles.tableHeaderText}>Lote</Text>
              <Text style={styles.tableHeaderText}>Quantidade</Text>
              <Text style={styles.tableHeaderText}>Ações</Text>
            </View>
            <FlatList
              data={listaPrateleira}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[styles.tableRow, item.concluido && styles.tableRowCompleted]}>
                  <Text style={[styles.tableCell, item.concluido && styles.tableCellCompleted]}>{item.nome_produto}</Text>
                  <Text style={[styles.tableCell, item.concluido && styles.tableCellCompleted]}>{item.nome_lote}</Text>
                  <Text style={[styles.tableCell, item.concluido && styles.tableCellCompleted]}>{item.quantidade}</Text>
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
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#D8B4E2",
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
    flexDirection: "row",
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
    backgroundColor: "#D8B4E2",
    padding: 5,
    marginHorizontal: 5,
    borderRadius: 4,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default ListaPrateleiraScreen;
