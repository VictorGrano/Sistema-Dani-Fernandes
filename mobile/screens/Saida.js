import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

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

  useEffect(() => {
    axios
      .get("http://192.168.1.102:3000/produtos")
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

  useEffect(() => {
    if (selectedProduct) {
      axios
        .get(`http://192.168.1.102:3000/buscarlotes?produto_id=${selectedProduct}`)
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
        })
        .catch((error) => {
          if (error.response.status === "404") {
            setNoLotesMessage("Não existem lotes para este produto.");
            setLotes([]);
          } else {
            console.error("Error fetching lots:", error);
          }
        });
    }
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
      lote: selectedLote,
    };

    console.log(saidaData);
    axios
      .post("http://192.168.1.102:3000/saidas", saidaData)
      .then((response) => {
        console.log("Saída registrada com sucesso:", response.data);
        navigation.goBack();
      })
      .catch((error) => {
        console.error("Erro ao registrar saída:", error);
      });
  };

  useEffect(() => {
    if (route.params) {
      const { id, quantidade, lote } = route.params;
      setID(id);
      setQuantidade(quantidade);
      setSelectedLote(lote);
      axios
        .get(`http://192.168.1.102:3000/buscaProduto?id=${id}`)
        .then((response) => {
          setNome(response.data.nome);
        })
        .catch((error) => {
          console.error("Error fetching product data:", error);
        });
      axios
        .get(`http://192.168.1.102:3000/buscarlotes?produto_id=${id}`)
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
        })
        .catch((error) => {
          console.error("Error fetching lots:", error);
        });
    }
  }, [route.params]);

  return (
    <ScrollView style={styles.container}>
      {route.params ? (
        <>
          <Text style={styles.header}>Dados do Produto:</Text>
          <Text style={styles.subheader}>Nome do Produto:</Text>
          <TextInput style={styles.input} value={String(nome)} editable={false} />
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
            value={String(quantidade)}
            editable={false}
            onChangeText={handleQuantidadeChange}
          />
          <Text style={styles.subheader}>Lote:</Text>
          <TextInput
            style={styles.input}
            value={String(selectedLote)}
            editable={false}
          />
          <Text style={styles.subheader}>Quantidade total no Lote:</Text>
          <TextInput
            style={styles.input}
            value={String(lotes.find((l) => l.label === selectedLote)?.quantidade || "0")}
            editable={false}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaida}>
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
            style={styles.input}
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
          />
          <TouchableOpacity style={styles.button} onPress={handleSaida}>
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
  buttonText: {
    color: "white",
    fontSize: 15,
  },
});

export default SaidaScreen;
