import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native"
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../components/Loading";

const EntradaScreen = ({ route }) => {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [id, setID] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [quantidadeCaixas, setQuantidadeCaixas] = useState("1");
  const [coluna, setColuna] = useState("");
  const [lote, setLote] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [selectedLote, setSelectedLote] = useState(null);
  const [noLotesMessage, setNoLotesMessage] = useState("");
  const [newLote, setNewLote] = useState("");
  const [validade, setValidade] = useState("");
  const [fabricacao, setFabricacao] = useState("");
  const [isNewLote, setIsNewLote] = useState(false);
  const [nomeUser, setNomeUser] = useState("");
  const [idUser, setIdUser] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedNome = await AsyncStorage.getItem("nome");
        const storedID = await AsyncStorage.getItem("id");
        setNomeUser(storedNome || "Usuário");
        setIdUser(storedID || null);

        const [produtosResponse, locaisResponse] = await Promise.all([
          axios.get(`${apiUrl}/produtos/`),
          axios.get(`${apiUrl}/estoque/Locais`),
        ]);

        const produtosData = produtosResponse.data.map((produto) => ({
          label: produto.nome,
          value: produto.id,
        }));
        setProdutos(produtosData);

        const locaisData = locaisResponse.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }));
        setLocais(locaisData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      axios
        .get(`${apiUrl}/produtos/Lotes?produto_id=${id}`)
        .then((response) => {
          if (response.data.length === 0) {
            setNoLotesMessage(
              "Não existem lotes para este produto. Adicione um com o campo abaixo."
            );
            setLotes([]);
          } else {
            const lotesData = response.data.map((lote) => ({
              label: lote.nome_lote,
              value: lote.id,
              quantidade: lote.quantidade,
              fabricacao: lote.fabricacao,
              validade: lote.validade,
            }));
            setLotes(lotesData);
            setNoLotesMessage("");
          }
        })
        .catch((error) => {
          if (error.response.status === "404") {
            setNoLotesMessage(
              "Não existem lotes para este produto. Adicione um com o campo abaixo."
            );
            setLotes([]);
          } else {
            console.error("Error fetching lots:", error);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedProduct, id, apiUrl]);

  const handleDateInput = (input, setDate) => {
    let formattedInput = input.replace(/[^0-9]/g, "");
    if (formattedInput.length >= 2) {
      formattedInput = `${formattedInput.slice(0, 2)}-${formattedInput.slice(2, 6)}`;
    }
    setDate(formattedInput);
  };

  const convertToMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month] = dateString.split("-");
    return `${month}-${year}`;
  };


  const handleEntrar = () => {
    const quantidadeTotal = quantidade * (quantidadeCaixas || 1);
    
    // Convertemos as datas para o formato YYYY-MM-DD
    const entradaData = {
      id: id,
      quantidade: quantidadeTotal,
      lote: isNewLote ? newLote : selectedLote,
      validade: validade, // Converte a validade
      fabricacao: fabricacao, // Converte a data de fabricação
      localArmazenado: selectedLocal,
      quantidade_caixas: quantidadeCaixas || 1,
      coluna: coluna || "SEM COLUNA",
      user: nomeUser,
      iduser: idUser,
    };
  
    setLoading(true);
    axios
      .post(`${apiUrl}/estoque/Entrada`, entradaData)
      .then((response) => {
        console.log("Entrada criada com sucesso:", response.data);
        navigation.goBack();
      })
      .catch((error) => {
        console.error("Erro ao criar entrada:", error);
      })
      .finally(() => {
        setLoading(false);
      });
      setLoading(false);
  };
  

  useEffect(() => {
    if (route.params) {
      const { id, quantidade, lote, validade, fabricacao } = route.params;
      setID(id);
      setQuantidade(quantidade);
      setSelectedLote(lote);
      setValidade(validade);
      setFabricacao(convertToMMYYYY(fabricacao));

      setLoading(true);
      axios
        .get(`${apiUrl}/produtos/InfoProduto?id=${id}`)
        .then((response) => {
          setNome(response.data.nome);
        })
        .catch((error) => {
          console.error("Error fetching product data:", error);
        })
        .finally(() => {
          setLoading(false);
        });

      axios
        .get(`${apiUrl}/produtos/Lotes?produto_id=${id}`)
        .then((response) => {
          if (response.data.length === 0) {
            setNoLotesMessage(
              "Não existem lotes para este produto. Adicione um com o campo abaixo."
            );
            setLotes([]);
          } else {
            const lotesData = response.data.map((lote) => ({
              label: lote.nome_lote,
              value: lote.id,
              quantidade: lote.quantidade,
              fabricacao: convertToMMYYYY(lote.fabricacao),
              validade: lote.validade,
            }));
            setLotes(lotesData);
            setNoLotesMessage("");
          }
        })
        .catch((error) => {
          console.error("Error fetching lots:", error);
        });
    }
  }, [route.params, apiUrl]);

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      {route.params ? (
        <>
          <Text style={styles.header}>Dados do Produto:</Text>
          <Text style={styles.subheader}>Nome do Produto:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            value={String(nome)}
            editable={false}
          />
          <Text style={styles.subheader}>Lote:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            value={String(selectedLote)}
            editable={false}
          />
          <Text style={styles.subheader}>Quantidade de caixas:</Text>
          <TextInput
            style={styles.input}
            editable={true}
            keyboardType="numeric"
            placeholder="Digite a quantidade de caixas aqui"
            onChangeText={setQuantidadeCaixas}
            value={quantidadeCaixas}
          />
          <Text style={styles.subheader}>Quantidade de produtos na Caixa:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            value={String(quantidade)}
            editable={false}
          />
          <Text style={styles.subheader}>Data de Fabricação do Lote:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            placeholder="MM-YYYY"
            keyboardType="numeric"
            value={fabricacao}
            editable={false}
            onChangeText={(text) => handleDateInput(text, setFabricacao)}
            maxLength={7}
          />
          <Text style={styles.subheader}>Data de Validade:</Text>
          <TextInput
            style={[styles.input, styles.nonEditableInput]}
            placeholder="MM-YYYY"
            keyboardType="numeric"
            value={validade}
            editable={false}
            onChangeText={(text) => handleDateInput(text, setValidade)}
            maxLength={7}
          />
          <Text style={styles.subheader}>Local Armazenado:</Text>
          <Dropdown
            style={styles.dropdown}
            data={locais}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um local para armazenar"
            value={selectedLocal}
            onChange={(item) => setSelectedLocal(item.value)}
          />
          <Text style={styles.subheader}>Coluna armazenada (Opcional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: A1"
            onChangeText={setColuna}
            value={coluna}
          />
          <TouchableOpacity style={styles.button} onPress={handleEntrar}>
            <Text style={styles.buttonText}>Criar Entrada</Text>
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
              setIsNewLote(false);
            }}
          />
          <Text style={styles.subheader}>Quantidade de caixas:</Text>
          <TextInput
            style={styles.input}
            editable={true}
            keyboardType="numeric"
            placeholder="Digite a quantidade de caixas aqui"
            onChangeText={setQuantidadeCaixas}
            value={quantidadeCaixas}
          />
          <Text style={styles.subheader}>Quantidade de produtos na Caixa:</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            keyboardType="numeric"
            onChangeText={setQuantidade}
            value={quantidade}
          />
          <Text style={styles.subheader}>Lote:</Text>
          {noLotesMessage ? (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{noLotesMessage}</Text>
            </View>
          ) : null}
          {isNewLote ? (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Nome do Lote"
                value={newLote}
                onChangeText={setNewLote}
              />
            </View>
          ) : (
            <View>
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
                  setFabricacao(item.fabricacao);
                  setValidade(item.validade);
                }}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsNewLote(true)}
              >
                <Text style={styles.buttonText}>Adicionar Novo Lote</Text>
              </TouchableOpacity>
            </View>
          )}
          {isNewLote && (
            <>
              <Text style={styles.subheader}>Data de Fabricação do Lote:</Text>
              <TextInput
                style={styles.input}
                placeholder="MM-YYYY"
                keyboardType="numeric"
                value={fabricacao}
                onChangeText={(text) => handleDateInput(text, setFabricacao)}
                maxLength={7}
              />
              <Text style={styles.subheader}>Data de Validade:</Text>
              <TextInput
                style={styles.input}
                placeholder="MM-YYYY"
                keyboardType="numeric"
                value={validade}
                onChangeText={(text) => handleDateInput(text, setValidade)}
                maxLength={7}
              />
                {lotes.length > 0 ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsNewLote(false)}
                >
                  <Text style={styles.buttonText}>
                    Selecionar Lote Existente
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
          <Text style={styles.subheader}>Local Armazenado:</Text>
          <Dropdown
            style={styles.dropdown}
            data={locais}
            search={true}
            labelField="label"
            valueField="value"
            placeholder="Selecione um local para armazenar"
            value={selectedLocal}
            onChange={(item) => setSelectedLocal(item.value)}
          />
          <Text style={styles.subheader}>Coluna armazenada (Opcional):</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: A1"
            onChangeText={setColuna}
            value={coluna}
          />
          <TouchableOpacity style={styles.buttonEntrada} onPress={handleEntrar}>
            <Text style={styles.buttonText}>Criar Entrada</Text>
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
    backgroundColor: "#FFFFFF",
    fontSize: 17,
    textAlign: "center",
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
  buttonEntrada: {
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
});

export default EntradaScreen;
