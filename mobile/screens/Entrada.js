import React, { useEffect, useState } from "react";
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
  const [quantidadeFracionada, setQuantidadeFracionada] = useState("");
  const [fracionadas, setFracionadas] = useState([]);
  const [subtotalProdutos, setSubtotalProdutos] = useState(0);

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
        .get(`${apiUrl}/produtos/Lotes?produto_id=${selectedProduct}`)
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
              fabricacao: String(lote.data_fabricacao),
              validade: String(lote.data_validade),
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
  }, [selectedProduct, apiUrl]);

  useEffect(() => {
    if (route.params) {
      const { id, quantidade, lote, validade, fabricacao } = route.params;
      setID(id);
      setQuantidade(quantidade);
      setSelectedLote(lote);

      // Ajuste da validade e fabricação ao setar os valores
      const formattedValidade = validade
        ? validade.slice(0, 2) + "-" + validade.slice(3, 7)
        : "";
      const formattedFabricacao = fabricacao
        ? new Date(fabricacao).toISOString().split("T")[0]
        : "";

      setValidade(formattedValidade);
      setFabricacao(formattedFabricacao);

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
              fabricacao: new Date(lote.data_fabricacao)
                .toISOString()
                .split("T")[0], // Formato YYYY-MM-DD
              validade:
                lote.data_validade.slice(5, 7) +
                "-" +
                lote.data_validade.slice(0, 4), // Formato MM-yyyy
            }));
            setLotes(lotesData);
            setNoLotesMessage("");
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  }, [route.params]);

  useEffect(() => {
    // Calcula os subtotais sempre que a quantidade ou as fracionadas mudarem
    const totalFracionadas = fracionadas.reduce((acc, val) => acc + val, 0);
    const totalCaixas = parseInt(quantidadeCaixas || 0);
    const totalProdutos =
      totalCaixas * parseInt(quantidade || 0) + totalFracionadas;

    setSubtotalProdutos(totalProdutos);
  }, [quantidade, quantidadeCaixas, fracionadas]);

  const handleDateInput = (input, setDate) => {
    let formattedInput = input.replace(/[^0-9]/g, "");
    if (formattedInput.length >= 2) {
      formattedInput = `${formattedInput.slice(0, 2)}-${formattedInput.slice(
        2,
        6
      )}`;
    }
    setDate(formattedInput);
  };

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

  const handleEntrar = () => {
    // Soma as quantidades fracionadas ao valor principal de quantidade
    const totalFracionadas = fracionadas.reduce((acc, val) => acc + val, 0);
    const quantidadeTotal =
      quantidade * (quantidadeCaixas || 1) + totalFracionadas;

    // Verifica se as datas de fabricação e validade foram passadas, senão pega do lote[0]
    const loteSelecionado = lotes.find((lote) => lote.value === selectedLote);
    const dataFabricacao =
      fabricacao || loteSelecionado?.fabricacao || lotes[0]?.data_fabricacao;
    const dataValidade =
      validade || loteSelecionado?.validade || lotes[0]?.data_validade;

    const entradaData = {
      id: id,
      quantidade: quantidadeTotal,
      lote: newLote || selectedLote,
      validade: dataValidade,
      fabricacao: dataFabricacao,
      localArmazenado: selectedLocal,
      quantidade_caixas: parseInt(quantidadeCaixas) + fracionadas.length || 1,
      coluna: coluna || "SEM COLUNA",
      user: nomeUser,
      iduser: idUser,
    };

    setLoading(true);
    axios
      .post(`${apiUrl}/estoque/Entrada`, entradaData)
      .then((response) => {
        // Navega de volta à tela anterior
        navigation.goBack();
      })
      .catch((error) => {
        console.error("Erro ao criar entrada:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      {route.params ? (
        <>
          <Text style={styles.header}>Dados do produto:</Text>
          <View style={styles.card}>
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
          </View>
          <Text style={styles.header}>Dados do produto:</Text>
          <View style={styles.card}>
            <Text style={styles.subheader}>Quantidade de caixas:</Text>
            <TextInput
              style={styles.input}
              editable={true}
              keyboardType="numeric"
              placeholder="Digite a quantidade de caixas aqui"
              onChangeText={setQuantidadeCaixas}
              value={quantidadeCaixas}
            />
            <Text style={styles.subheader}>
              Quantidade de produtos na Caixa:
            </Text>
            <TextInput
              style={[styles.input, styles.nonEditableInput]}
              value={String(quantidade)}
              editable={false}
            />
            <Text style={styles.subheader}>Caixa Fracionada:</Text>
            {fracionadas.map((item, index) => (
              <View key={index} style={styles.fracionadaContainer}>
                <Text>
                  Caixa {index + 1}: {item} produtos
                </Text>
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddFracionada}
            >
              <Text style={styles.buttonText}>Adicionar Caixa Fracionada</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.header}>Local:</Text>
          <View style={styles.card}>
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
          </View>
          <Text style={styles.header}>Revisão:</Text>
          <View style={styles.card}>
            <Text style={styles.subheader}>Total de caixas: {parseInt(quantidadeCaixas) + fracionadas.length}</Text>
            <Text style={styles.subheader}>Total de produtos: {subtotalProdutos}</Text>
          </View>
          <TouchableOpacity style={styles.buttonEntrada} onPress={handleEntrar}>
            <Text style={styles.buttonText}>Criar Entrada</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.header}>Dados do produto:</Text>
          <View style={styles.card}>
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
                    setSelectedLote(item.value); // Corrigi para enviar o ID do lote
                    setFabricacao(item.fabricacao);
                    setValidade(item.validade);
                    console.log(validade, fabricacao);
                  }}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsNewLote(true)}
                >
                  <Text style={styles.buttonText}>Criar Novo Lote</Text>
                </TouchableOpacity>
              </View>
            )}
            {isNewLote && (
              <>
                <Text style={styles.subheader}>
                  Data de Fabricação do Lote:
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM-YYYY"
                  keyboardType="numeric"
                  value={fabricacao}
                  onChangeText={(text) => handleDateInput(text, setFabricacao)}
                  maxLength={7}
                />
                <Text style={styles.subheader}>Data de Validade do Lote:</Text>
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
          </View>
          <Text style={styles.header}>Caixas:</Text>
          <View style={styles.card}>
            <Text style={styles.subheader}>Número de caixas:</Text>
            <TextInput
              style={styles.input}
              editable={true}
              keyboardType="numeric"
              placeholder="Digite a quantidade de caixas aqui"
              onChangeText={setQuantidadeCaixas}
              value={quantidadeCaixas}
            />
            <Text style={styles.subheader}>Quantidade de produtos: </Text>
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              keyboardType="numeric"
              onChangeText={setQuantidade}
              value={quantidade}
            />
            <Text style={styles.subheader}>Caixa Fracionada:</Text>
            {fracionadas.map((item, index) => (
              <View key={index} style={styles.fracionadaContainer}>
                <Text>
                  Caixa {index + 1}: {item} produtos
                </Text>
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddFracionada}
            >
              <Text style={styles.buttonText}>Adicionar Caixa Fracionada</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.header}>Armazenamento:</Text>
          <View style={styles.card}>
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
          </View>
          <Text style={styles.header}>Revisão:</Text>
          <View style={styles.card}>
            <Text style={styles.subheader}>
              Quantidade de caixas:{" "}
              {parseInt(quantidadeCaixas) + fracionadas.length}
            </Text>
            <Text style={styles.subheader}>Total: {subtotalProdutos}</Text>
          </View>
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
  card: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    borderRadius: 20,
    marginBottom: 15,
    flex: 1,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderRadius: 10,
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
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
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
    backgroundColor: "#4D7EA8",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonEntrada: {
    backgroundColor: "#4D7EA8",
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
  deleteButton: {
    backgroundColor: "#FF6347",
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
  },
});

export default EntradaScreen;
