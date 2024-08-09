import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  ScrollView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

const ProdutosScreen = () => {
  const navigation = useNavigation();
  const [aromas, setAromas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [selectedAroma, setSelectedAroma] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [nome, setNome] = useState(null);
  const [descricao, setDescricao] = useState(null);
  const [estoque, setEstoque] = useState(null);
  const [preco, setPreco] = useState(null);
  const [unidade, setUnidade] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [cadastrar, setCadastrar] = useState(false);
  const [info, setInfo] = useState(true);
  const [modal, setModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  
  
  useEffect(() => {
    axios
      .get(`http://191.235.243.175/produtos/Aromas/`)
      .then((response) => {
        const aromasData = response.data.map((aroma) => ({
          label: aroma.nome_aroma,
          value: aroma.cod_aroma,
        }));
        setAromas(aromasData);
      })
      .catch((error) => {
        console.error("Error fetching aromas:", error);
      });
    axios
      .get(`http://191.235.243.175/produtos/Tipo`)
      .then((response) => {
        const tipoData = response.data.map((aroma) => ({
          label: aroma.nome_categoria,
          value: aroma.id,
        }));
        setTipos(tipoData);
      })
      .catch((error) => {
        console.error("Error fetching aromas:", error);
      });

    axios
      .get(`http://191.235.243.175/produtos/`)
      .then((response) => {
        const produtosData = response.data.map((produto) => ({
          id: produto.id,
          nome: produto.nome,
          descricao: produto.descricao,
          estoque_total: produto.estoque_total,
          preco: produto.preco,
          unidade: produto.unidade,
          nome_aroma: produto.nome_aroma,
          categoria: produto.nome_categoria,
          categoria_id: produto.categoria_id,
          cod_aroma: produto.cod_aroma,
        }));
        setProdutos(produtosData);
        setInfo(false);
        setFilteredProdutos(produtosData);
      })
      .catch((error) => {
        console.error("Error fetching produtos:", error);
        setInfo(true);
      });
  }, []);

  useEffect(() => {
    setFilteredProdutos(
      produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, produtos]);

  const handleRegistro = async () => {
    try {
      const dados = {
        nome: nome,
        descricao: descricao,
        estoque_total: estoque,
        preco: preco,
        unidade: unidade,
        tipo: selectedTipo,
        aroma_id: selectedAroma,
      };
      const response = await axios.post(
        `http://191.235.243.175/produtos/CadastroProduto`,
        dados
      );

      if (response.status == "201") {
        Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
        navigation.goBack();
      } else {
        Alert.alert("Erro", response.data.message);
        setNome(null);
        setEstoque(null);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao registrar o produto. Tente novamente mais tarde."
      );
    }
  };


  const handleEdicao = async () => {
    try {
      const dados = {
        id: produtoSelecionado.id,
        nome: nome,
        descricao: descricao,
        estoque_total: estoque,
        preco: preco,
        unidade: unidade,
        tipo: selectedTipo,
        cod_aroma: selectedAroma,
      };
      const response = await axios.put(
        `http://191.235.243.175/produtos/Atualizar`,
        dados
      );

      if (response.data.message === "Produto atualizado com sucesso!") {
        Alert.alert("Sucesso", response.data.message);
        setModal(false);
        setNome(null);
        setDescricao(null);
        setEstoque(null);
        setPreco(null);
        setUnidade(null);
        setSelectedAroma(null);
        // Atualizar a lista de produtos
        const updatedProdutos = produtos.map((produto) =>
          produto.id === produtoSelecionado.id ? { ...produto, ...dados } : produto
        );
        setProdutos(updatedProdutos);
      } else {
        Alert.alert("Erro", response.data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o produto. Tente novamente mais tarde."
      );
    }
  };

  const handleDelete = async (item) => {
    axios
      .delete(`http://191.235.243.175/produtos/${item.id}`)
      .then((response) => {
        if (response.status == "200") {
          Alert.alert("Sucesso!", "Produto deletado com sucesso!");
          setProdutos(produtos.filter((produto) => produto.id !== item.id));
        } else {
          Alert.alert("Erro!", "Erro ao deletar!");
        }
      })
      .catch((error) => {
        console.error("Error deleting produto:", error);
        Alert.alert("Erro!", "Erro ao deletar!");
      });
  };

  const abrirModalEdicao = (produto) => {
    setProdutoSelecionado(produto);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setEstoque(produto.estoque_total);
    setPreco(produto.preco);
    setUnidade(produto.unidade);
    setSelectedAroma(produto.cod_aroma);
    setSelectedTipo(produto.categoria_id);
    setModal(true);
  };

  const handleCancelar = () => {
    setNome(null);
    setDescricao(null);
    setEstoque(null);
    setPreco(null);
    setUnidade(null);
    setSelectedAroma(null);
    setModal(false);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemDetails}>
          <Text style={styles.text}>Nome: {item.nome}</Text>
          <Text style={styles.text}>Descrição: {item.descricao || "Não possui"}</Text>
          <Text style={styles.text}>Categoria: {item.categoria}</Text>
          <Text style={styles.text}>Aroma: {item.nome_aroma}</Text>
          <Text style={styles.text}>Estoque: {item.estoque_total}</Text>
          <Text style={styles.text}>Preço: R${item.preco}</Text>
          <Text style={styles.text}>Unidade: {item.unidade}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => abrirModalEdicao(item)}>
            <Text style={styles.editButton}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={styles.deleteButton}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {cadastrar ? (
        <View>
          <ScrollView>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCadastrar(false)}
            >
              <Text style={styles.buttonText}>Ver lista de produtos</Text>
            </TouchableOpacity>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Nome do produto:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite o nome do produto aqui"
                onChangeText={setNome}
                value={nome}
              />
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Aroma do produto:</Text>
              <Dropdown
                style={styles.dropdown}
                data={aromas}
                search={true}
                labelField="label"
                valueField="value"
                placeholder="Selecione o aroma do produto"
                value={selectedAroma}
                onChange={(item) => {
                  setSelectedAroma(item.value);
                }}
              />
              </View>
              <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Tipo do produto:</Text>
              <Dropdown
                style={styles.dropdown}
                data={tipos}
                search={true}
                labelField="label"
                valueField="value"
                placeholder="Selecione o tipo do produto"
                value={selectedTipo}
                onChange={(item) => {
                  setSelectedTipo(item.value);
                }}
              />
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Descrição:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite a descrição aqui"
                onChangeText={setDescricao}
                value={descricao}
              />
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Estoque:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite o estoque aqui"
                keyboardType="number-pad"
                onChangeText={setEstoque}
                value={estoque}
              />
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Preço unitário:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                keyboardType="number-pad"
                placeholder="Digite o preço aqui"
                onChangeText={setPreco}
                value={preco}
              />
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Unidade de medida:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite a unidade de medida aqui"
                onChangeText={setUnidade}
                value={unidade}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegistro}>
              <Text style={styles.buttonText}>Cadastrar Produto</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produto"
            value={search}
            onChangeText={setSearch}
          />
          {info && <Text>Não há produtos para serem exibidos!</Text>}
          <FlatList
            data={filteredProdutos}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCadastrar(true)}
          >
            <Text style={styles.buttonText}>Cadastrar Produto</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Editar Produto</Text>
            <ScrollView>
              <Text style={styles.subheader}>Nome do produto:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite o nome do produto aqui"
                onChangeText={setNome}
                value={nome}
              />
              <Text style={styles.subheader}>Aroma do produto:</Text>
              <Dropdown
                style={styles.dropdown}
                data={aromas}
                search={true}
                labelField="label"
                valueField="value"
                placeholder="Selecione o aroma do produto"
                value={selectedAroma}
                onChange={(item) => {
                  setSelectedAroma(item.value);
                }}
              />
              <Text style={styles.subheader}>Tipo do produto:</Text>
              <Dropdown
                style={styles.dropdown}
                data={tipos}
                search={true}
                labelField="label"
                valueField="value"
                placeholder="Selecione o tipo do produto"
                value={selectedTipo}
                onChange={(item) => {
                  setSelectedTipo(item.value);
                }}
              />
              <Text style={styles.subheader}>Descrição:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite a descrição aqui"
                onChangeText={setDescricao}
                value={descricao}
              />
              <Text style={styles.subheader}>Estoque:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite o estoque aqui"
                keyboardType="number-pad"
                onChangeText={setEstoque}
                value={estoque}
              />
              <Text style={styles.subheader}>Preço unitário:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                keyboardType="number-pad"
                placeholder="Digite o preço aqui"
                onChangeText={setPreco}
                value={preco}
              />
              <Text style={styles.subheader}>Unidade de medida:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite a unidade de medida aqui"
                onChangeText={setUnidade}
                value={unidade}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleEdicao}
              >
                <Text style={styles.modalButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCancelar}
              >
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    color: "#222222",
    fontSize: 17,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 10,
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
  searchInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "#222222",
    fontSize: 17,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  itemDetails: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    width: "100%",
  },
  text: {
    fontWeight: "bold",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#D8B4E2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCloseButton: {
    backgroundColor: "#E57373",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  deleteButton: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProdutosScreen;
