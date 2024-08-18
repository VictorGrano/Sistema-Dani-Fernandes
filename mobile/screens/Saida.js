import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../components/Loading";

const SaidaScreen = ({ route }) => {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [id, setID] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [quantidadeCaixas, setQuantidadeCaixas] = useState("1");
  const [produtos, setProdutos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [selectedLote, setSelectedLote] = useState(null);
  const [noLotesMessage, setNoLotesMessage] = useState("");
  const [nomeUser, setNomeUser] = useState("");
  const [idUser, setIdUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [quantidadeFracionada, setQuantidadeFracionada] = useState("");
  const [fracionadas, setFracionadas] = useState([]);
  const [subtotalProdutos, setSubtotalProdutos] = useState(0);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      const storedNome = await AsyncStorage.getItem("nome");
      const storedID = await AsyncStorage.getItem("id");
      setNomeUser(storedNome || "Usuário");
      setIdUser(storedID || null);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiUrl}/produtos`)
      .then((response) => {
        const produtosData = response.data.map((produto) => ({
          label: produto.nome,
          value: produto.id,
        }));
        setProdutos(produtosData);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching products:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      axios
        .get(`${apiUrl}/produtos/Lotes?produto_id=${selectedProduct}`)
        .then((response) => {
          if (response.data.length === 0) {
            setNoLotesMessage("Não existem lotes para este produto.");
            setLotes([]);
          } else {
            const lotesData = response.data.map((lote) => ({
              label: lote.nome_lote,
              value: lote.id,
              quantidade: lote.quantidade,
            }));
            setLotes(lotesData);
            setNoLotesMessage("");
          }
          setLoading(false);
        })
        .catch((error) => {
          if (error.response.status === "404") {
            setLoading(false);
            setNoLotesMessage("Não existem lotes para este produto.");
            setLotes([]);
          } else {
            setLoading(false);
            console.error("Error fetching lots:", error);
          }
        });
    }
    setLoading(false);
  }, [selectedProduct]);

  const handleQuantidadeChange = (text) => {
    setQuantidade(text);
  };

  const handleQuantidadeCaixasChange = (text) => {
    setQuantidadeCaixas(text);
  };

  const handleSaida = () => {
    const quantidadeTotal = quantidade * (quantidadeCaixas || 1);
    const saidaData = {
      id,
      quantidade: quantidadeTotal,
      quantidade_caixas: parseInt(quantidadeCaixas) + fracionadas.length,
      lote: selectedLote,
      user: nomeUser,
      iduser: idUser,
    };
 
    setLoading(true);
    axios
      .post(`${apiUrl}/estoque/Saida`, saidaData)
      .then((response) => {
        setLoading(false);
 
        navigation.goBack();
      })
      .catch((error) => {
        setLoading(false);
        if (error.response.status === 400) {
          Alert.alert("Erro!","Quantidade insuficiente no lote!");
        } else {
          Alert.alert("Erro", "Ocorreu um erro inesperado.");
        }
      });
  };

  useEffect(() => {
    if (route.params) {
      const { id, quantidade, lote } = route.params;
      setID(id);
      setQuantidade(quantidade);
      setSelectedLote(lote);
      setLoading(true);
      axios
        .get(`${apiUrl}/produtos/InfoProduto?id=${id}`)
        .then((response) => {
          setNome(response.data.nome);
        })
        .catch((error) => {
          console.error("Error fetching product data:", error);
        });
      axios
        .get(`${apiUrl}/produtos/Lotes?produto_id=${id}`)
        .then((response) => {
          setLoading(false);
          if (response.data.length === 0) {
            setNoLotesMessage("Não existem lotes para este produto.");
            setLotes([]);
          } else {
            const lotesData = response.data.map((lote) => ({
              label: lote.nome_lote,
              value: lote.id,
              quantidade: lote.quantidade,
            }));
            setLotes(lotesData);
            setNoLotesMessage("");
          }
        })
        .catch((error) => {
          setLoading(false);
 
        });
      }
      setLoading(false);
  }, [route.params]);

  useEffect(() => {
    // Calcula os subtotais sempre que a quantidade ou as fracionadas mudarem
    const totalFracionadas = fracionadas.reduce((acc, val) => acc + val, 0);
    const totalCaixas = parseInt(quantidadeCaixas || 0);
    const totalProdutos = (totalCaixas * parseInt(quantidade || 0)) + totalFracionadas;

    setSubtotalProdutos(totalProdutos);
  }, [quantidade, quantidadeCaixas, fracionadas]);

  const handleAddFracionada = () => {
    if (quantidadeFracionada) {
      setFracionadas([...fracionadas, parseInt(quantidadeFracionada)]);
      setQuantidadeFracionada("");
    }
  };

  const handleRemoveFracionada = (index) => {
    const newFracionadas = fracionadas.filter((_, i) => i !== index);
    setFracionadas(newFracionadas);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      {route.params ? (
        <>
          <Text style={styles.subheader}>Nome do Produto:</Text>
          <TextInput style={[styles.input, styles.nonEditableInput]} value={String(nome)} editable={false} />
          <Text style={styles.subheader}>Lote:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            value={String(selectedLote)}
            editable={false}
          />
            <Text style={styles.subheader}>Quantidade total no Lote:</Text>
            <TextInput
              style={[styles.input, styles.nonEditableInput]}
              value={String(lotes.find((l) => l.label === selectedLote)?.quantidade || "0")}
              editable={false}
            />
          <Text style={styles.subheader}>Quantidade de caixas:</Text>
          <TextInput
            style={styles.input}
            editable={true}
            keyboardType="numeric"
            placeholder="Digite a quantidade de caixas aqui"
            onChangeText={handleQuantidadeCaixasChange}
            value={quantidadeCaixas}
          />
          <Text style={styles.subheader}>Quantidade de produtos na Caixa:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            value={String(quantidade)}
            editable={false}
            onChangeText={handleQuantidadeChange}
          />
           <Text style={styles.subheader}>Caixa Fracionada:</Text>
          {fracionadas.map((item, index) => (
            <View key={index} style={styles.fracionadaContainer}>
              <Text>Caixa {index + 1}: {item} produtos</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveFracionada(index)}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Quantidade fracionada"
            keyboardType="numeric"
            onChangeText={setQuantidadeFracionada}
            value={quantidadeFracionada}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddFracionada}>
            <Text style={styles.buttonText}>Adicionar Caixa Fracionada</Text>
          </TouchableOpacity>
          <Text style={styles.subheader}>Subtotal de produtos:</Text>
          <Text style={styles.subtotalText}>{subtotalProdutos}</Text>
          <TouchableOpacity style={styles.buttonSaida} onPress={handleSaida}>
            <Text style={styles.buttonText}>Registrar Saída</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subheader}>Nome do Produto:</Text>
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
              setID(item.value);
              setNoLotesMessage("");
            }}
          />
          <Text style={styles.subheader}>Lote:</Text>
          {noLotesMessage ? (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{noLotesMessage}</Text>
            </View>
          ) : null}
          <Dropdown
            style={styles.dropdown}
            data={lotes}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um lote"
            value={selectedLote}
            onChange={(item) => {
              setSelectedLote(item.label);
            }}
          />
          <Text style={styles.subheader}>Quantidade total no Lote:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            value={String(lotes.find((l) => l.label === selectedLote)?.quantidade || "")}
            editable={false}
          />
          <Text style={styles.subheader}>Quantidade de caixas:</Text>
          <TextInput
            style={styles.input}
            editable={true}
            keyboardType="numeric"
            placeholder="Digite a quantidade de caixas aqui"
            onChangeText={handleQuantidadeCaixasChange}
            value={quantidadeCaixas}
          />
          <Text style={styles.subheader}>Quantidade de produtos na Caixa:</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            keyboardType="numeric"
            editable={true}
            value={quantidade}
            onChangeText={handleQuantidadeChange}
          />
          <Text style={styles.subheader}>Caixa Fracionada:</Text>
          {fracionadas.map((item, index) => (
            <View key={index} style={styles.fracionadaContainer}>
              <Text>Caixa {index + 1}: {item} produtos</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveFracionada(index)}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Quantidade fracionada"
            keyboardType="numeric"
            onChangeText={setQuantidadeFracionada}
            value={quantidadeFracionada}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddFracionada}>
            <Text style={styles.buttonText}>Adicionar Caixa Fracionada</Text>
          </TouchableOpacity>
          <Text style={styles.subheader}>Subtotal de produtos:</Text>
          <Text style={styles.subtotalText}>{subtotalProdutos}</Text>
          <TouchableOpacity style={styles.buttonSaida} onPress={handleSaida}>
            <Text style={styles.buttonText}>Registrar Saída</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "#222222",
    fontSize: 17,
    textAlign: "center",
    backgroundColor: '#FFFFFF',
  },
  nonEditableInput: {
    backgroundColor: "#E0E0E0",
    color: "#808080",
  },
  header: {
    fontSize: 24,
    marginVertical: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subheader: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  dropdown: {
    marginVertical: 20,
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 8,
  },
  messageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#D8B4E2",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonSaida: {
    backgroundColor: "#D8B4E2",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
  },
  fracionadaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  subheader: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default SaidaScreen;
