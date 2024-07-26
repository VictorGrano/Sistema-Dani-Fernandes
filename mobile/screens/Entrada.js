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

  useEffect(() => {
    axios
      .get("http://192.168.1.102:3000/produtos/")
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
      .get("http://192.168.1.102:3000/estoque/Locais")
      .then((response) => {
        const locaisData = response.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }));
        setLocais(locaisData);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      axios
        .get(`http://192.168.1.102:3000/produtos/Lotes?produto_id=${id}`)
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
            }));
            setLotes(lotesData);
            setNoLotesMessage("");
          }
        })
        .catch((error) => {
          if (error.response.status === '404') {
            setNoLotesMessage(
              "Não existem lotes para este produto. Adicione um com o campo abaixo."
            );
            setLotes([]);
          } else {
            console.error("Error fetching lots:", error);
          }
        });
    }
  }, [selectedProduct]);

  const handleValidadeChange = (text) => {
    if (text.length === 2 && validade.length < 2) {
      setValidade(text + "-");
    } else {
      setValidade(text);
    }
  };

  const handleFabricacaoChange = (text) => {
    if (text.length === 2 && fabricacao.length < 2) {
      setFabricacao(text + "-");
    } else {
      setFabricacao(text);
    }
  };

  const handleColunaChange = (text) => {
    setColuna(text);
  };

  const handleQuantidadeCaixasChange = (text) => {
    setQuantidadeCaixas(text);
  };

  const handleQuantidadeChange = (text) => {
    setQuantidade(text);
  };

  const handleLoteChange = (text) => {
    setLote(text);
  };

  const handleNewLoteChange = (text) => {
    setNewLote(text);
  };

  const handleEntrar = () => {
    const quantidadeTotal = quantidade * (quantidadeCaixas || 1);
    const entradaData = {
      id: id,
      quantidade: quantidadeTotal,
      lote: isNewLote ? newLote : selectedLote,
      validade,
      fabricacao,
      localArmazenado: selectedLocal,
      quantidade_caixas: quantidadeCaixas || 1,
      coluna,
    };

    console.log(entradaData);
    axios.post('http://192.168.1.102:3000/estoque/Entrada', entradaData)
      .then(response => {
        console.log("Entrada criada com sucesso:", response.data);
        navigation.replace('Menu');
      })
      .catch(error => {
        console.error("Erro ao criar entrada:", error);
      });
  };

  useEffect(() => {
    if (route.params) {
      const { id, quantidade, lote, validade, fabricacao } = route.params;
      setID(id);
      setQuantidade(quantidade);
      setSelectedLote(lote);
      setValidade(validade);
      setFabricacao(fabricacao);
      axios
        .get(`http://192.168.1.102:3000/produtos/InfoProduto?id=${id}`)
        .then((response) => {
          setNome(response.data.nome);
        })
        .catch((error) => {
          console.error("Error fetching product data:", error);
        });
      axios
        .get(`http://192.168.1.102:3000/produtos/Lotes?produto_id=${id}`)
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
            onChangeText={handleLoteChange}
            editable={false}
          />
          <Text style={styles.subheader}>Quantidade no Lote:</Text>
          <TextInput
            style={styles.input}
            value={String(lotes.find(l => l.label === selectedLote)?.quantidade || '0')}
            editable={false}
          />
          <Text style={styles.subheader}>Data de Fabricação:</Text>
          <TextInput
            style={styles.input}
            value={String(fabricacao)}
            editable={false}
            keyboardType="numeric"
            onChangeText={handleFabricacaoChange}
          />
          <Text style={styles.subheader}>Data de Validade:</Text>
          <TextInput
            style={styles.input}
            value={String(validade)}
            editable={false}
            keyboardType="numeric"
            onChangeText={handleValidadeChange}
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
            onChange={(item) => {
              setSelectedLocal(item.value);
            }}
          />
          <Text style={styles.subheader}>Coluna armazenada:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: A1"
            onChangeText={handleColunaChange}
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
            onChangeText={handleQuantidadeCaixasChange}
            value={quantidadeCaixas}
          />
          <Text style={styles.subheader}>Quantidade de produtos na Caixa:</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            keyboardType="numeric"
            onChangeText={handleQuantidadeChange}
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
                onChangeText={handleNewLoteChange}
              />
              {lotes.length > 0 ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsNewLote(false)}
                >
                  <Text style={styles.buttonText}>Selecionar Lote Existente</Text>
                </TouchableOpacity>
              ) : null}
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
                }}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsNewLote(true)}
              >
                <Text style={styles.buttonText}>Adicionar Novo Lote</Text>
              </TouchableOpacity>
              <Text style={styles.subheader}>Quantidade Disponível no Lote:</Text>
              <TextInput
                style={styles.input}
                value={String(lotes.find(l => l.label === selectedLote)?.quantidade || '')}
                editable={false}
              />
            </View>
          )}
          <Text style={styles.subheader}>Data de Fabricação do Lote:</Text>
          <TextInput
            style={styles.input}
            placeholder="MM-YYYY"
            keyboardType="numeric"
            value={fabricacao}
            onChangeText={handleFabricacaoChange}
            maxLength={7}
          />
          <Text style={styles.subheader}>Data de Validade:</Text>
          <TextInput
            style={styles.input}
            placeholder="DD-MM-YYYY"
            keyboardType="numeric"
            value={validade}
            onChangeText={handleValidadeChange}
            maxLength={10}
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
            onChange={(item) => {
              setSelectedLocal(item.value);
            }}
          />
          <Text style={styles.subheader}>Coluna armazenada:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: A1"
            onChangeText={handleColunaChange}
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
    backgroundColor: '#FFFFFF',
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
