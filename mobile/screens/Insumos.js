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
import Loading from "../components/Loading";

const InsumosScreen = () => {
  const navigation = useNavigation();
  const [locais, setLocais] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [nome, setNome] = useState(null);
  const [descricao, setDescricao] = useState(null);
  const [estoque, setEstoque] = useState(null);
  const [preco, setPreco] = useState(null);
  const [coluna, setColuna] = useState(null);
  const [insumos, setInsumos] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [cadastrar, setCadastrar] = useState(false);
  const [info, setInfo] = useState(true);
  const [modal, setModal] = useState(false);
  const [insumoSelecionado, setInsumoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiUrl}/estoque/Locais`)
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

    axios
      .get(`${apiUrl}/insumos/TiposInsumos`)
      .then((response) => {
        const tiposData = response.data.map((tipo) => ({
          label: tipo.nome,
          value: tipo.id,
        }));
        setTipos(tiposData);
      })
      .catch((error) => {
        console.error("Error fetching types:", error);
      });

    axios
      .get(`${apiUrl}/insumos/`)
      .then((response) => {
        const insumosData = response.data.map((insumo) => ({
          id: insumo.id,
          nome: insumo.nome,
          descricao: insumo.descricao,
          estoque: insumo.estoque,
          preco: insumo.preco,
          tipo: insumo.tipo,
          nome_local: insumo.local,
          local_armazenado: insumo.local_armazenado,
          coluna: insumo.coluna,
        }));
        setInsumos(insumosData);
        setInfo(false);
        setFilteredInsumos(insumosData);
      })
      .catch(() => {
        setInfo(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setFilteredInsumos(
      insumos.filter((insumo) =>
        insumo.nome.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, insumos]);

  const handleRegistro = async () => {
    try {
      const dados = {
        nome: nome,
        descricao: descricao,
        estoque: estoque,
        preco: preco,
        tipo_id: selectedTipo,
        local_armazenado: selectedLocal,
        coluna: coluna,
      };
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/insumos/CadastroInsumo`,
        dados
      );

      if (response.status === 201) {
        Alert.alert("Sucesso", "Insumo cadastrado com sucesso!");
        navigation.goBack();
      } else {
        Alert.alert("Erro", response.data.message);
      }
    } catch (error) {
 
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao registrar o insumo. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
      setNome(null);
      setEstoque(null);
    }
  };

  const handleEdicao = async () => {
    try {
      const dados = {
        id: insumoSelecionado.id,
        nome: nome,
        descricao: descricao,
        estoque: estoque,
        preco: preco,
        tipo_id: selectedTipo,
        local_armazenado: selectedLocal,
        coluna: coluna,
      };
      setLoading(true);
      const response = await axios.put(`${apiUrl}/insumos/Atualizar`, dados);

      if (response.data.message === "Insumo atualizado com sucesso!") {
        Alert.alert("Sucesso", response.data.message);
        setModal(false);
        setNome(null);
        setDescricao(null);
        setEstoque(null);
        setPreco(null);
        setColuna(null);
        const updatedInsumos = insumos.map((insumo) =>
          insumo.id === insumoSelecionado.id ? { ...insumo, ...dados } : insumo
        );
        setInsumos(updatedInsumos);
      } else {
        Alert.alert("Erro", response.data.message);
      }
    } catch (error) {
 
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o insumo. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${apiUrl}/insumos/${item.id}`);
      if (response.status === 200) {
        Alert.alert("Sucesso!", "Insumo deletado com sucesso!");
        setInsumos((prevInsumos) =>
          prevInsumos.filter((insumo) => insumo.id !== item.id)
        );
      } else {
        Alert.alert("Erro!", "Erro ao deletar!");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicao = (insumo) => {
    setInsumoSelecionado(insumo);
    setNome(insumo.nome);
    setDescricao(insumo.descricao);
    setEstoque(insumo.estoque);
    setPreco(insumo.preco);
    setSelectedTipo(insumo.tipo_id);
    setSelectedLocal(insumo.local_armazenado);
    setColuna(insumo.coluna);
    setModal(true);
  };

  const handleCancelar = () => {
    setNome(null);
    setDescricao(null);
    setEstoque(null);
    setPreco(null);
    setSelectedTipo(null);
    setSelectedLocal(null);
    setColuna(null);
    setModal(false);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View>
          <Text style={styles.text}>Nome: {item.nome}</Text>
          <Text style={styles.text}>Descrição: {item.descricao}</Text>
          <Text style={styles.text}>Tipo: {item.tipo}</Text>
          <Text style={styles.text}>Estoque: {item.estoque}</Text>
          <Text style={styles.text}>Preço: R${item.preco}</Text>
          <Text style={styles.text}>Local: {item.nome_local}</Text>
          <Text style={styles.text}>Coluna: {item.coluna}</Text>
        </View>
        <TouchableOpacity onPress={() => abrirModalEdicao(item)}>
          <Text style={styles.editButton}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={styles.deleteButton}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {cadastrar ? (
        <View>
          <ScrollView>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCadastrar(false)}
            >
              <Text style={styles.buttonText}>Ver lista de insumos</Text>
            </TouchableOpacity>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Nome do insumo:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite o nome do insumo aqui"
                onChangeText={setNome}
                value={nome}
              />
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Tipo do insumo:</Text>
              <Dropdown
                style={styles.dropdown}
                data={tipos}
                search={true}
                labelField="label"
                valueField="value"
                placeholder="Selecione o tipo de insumo"
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
              <Text style={styles.subheader}>Local armazenado:</Text>
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
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.subheader}>Coluna:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite a coluna aqui"
                onChangeText={setColuna}
                value={coluna}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegistro}>
              <Text style={styles.buttonText}>Cadastrar Insumo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar insumo"
            value={search}
            onChangeText={setSearch}
          />
          {info && <Text>Não há insumos para serem exibidos!</Text>}
          <FlatList
            data={filteredInsumos}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCadastrar(true)}
          >
            <Text style={styles.buttonText}>Cadastrar Insumo</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Editar Insumo</Text>
            <ScrollView>
              <Text style={styles.subheader}>Nome do insumo:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite o nome do insumo aqui"
                onChangeText={setNome}
                value={nome}
              />
              <Text style={styles.subheader}>Tipo do insumo:</Text>
              <Dropdown
                style={styles.dropdown}
                data={tipos}
                search={true}
                labelField="label"
                valueField="value"
                placeholder="Selecione o tipo de insumo"
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
              <Text style={styles.subheader}>Local armazenado:</Text>
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
              <Text style={styles.subheader}>Coluna:</Text>
              <TextInput
                style={styles.input}
                editable={true}
                placeholder="Digite a coluna aqui"
                onChangeText={setColuna}
                value={coluna}
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
    width: "90%",
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
  },
  deleteButton: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default InsumosScreen;
