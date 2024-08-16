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
import Loading from "../components/Loading";

const TipoInsumosScreen = () => {
  const navigation = useNavigation();
  const [tipos, setTipos] = useState([]);
  const [nome, setNome] = useState(null);
  const [insumos, setInsumos] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [cadastrar, setCadastrar] = useState(false);
  const [info, setInfo] = useState(true);
  const [modal, setModal] = useState(false);
  const [insumoSelecionado, setInsumoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // Buscar todos os insumos ao carregar o componente
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiUrl}/insumos/TiposInsumos`)
      .then((response) => {
        const tiposData = response.data.map((tipo) => ({
          label: tipo.nome,
          value: tipo.id,
        }));
        setTipos(tiposData);
        setInsumos(response.data); // Populando os insumos
      })
      .catch((error) => {
        console.error("Error fetching insumos:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtrar insumos com base na busca
  useEffect(() => {
    setFilteredInsumos(
      insumos.filter((insumo) => 
        insumo.nome && typeof insumo.nome === 'string' && insumo.nome.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, insumos]);
  

  // Registrar novo tipo de insumo
  const handleRegistro = async () => {
    if (!nome) {
      Alert.alert("Erro", "Por favor, preencha o nome do insumo.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/insumos/CadastroTipoInsumo`,
        { nome } // Enviando o nome como objeto
      );

      if (response.status === 201) {
        Alert.alert("Sucesso", "Tipo de Insumo cadastrado com sucesso!");
        setInsumos((prevInsumos) => [...prevInsumos, response.data]);
        setCadastrar(false);
      } else {
        Alert.alert("Erro", response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao registrar o tipo de insumo. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
      setNome(null);
    }
  };

  // Atualizar tipo de insumo
  const handleEdicao = async () => {
    if (!nome) {
      Alert.alert("Erro", "Por favor, preencha o nome do insumo.");
      return;
    }
    try {
      const dados = {
        id: insumoSelecionado.id,
        nome,
      };
      setLoading(true);
      const response = await axios.put(`${apiUrl}/insumos/AtualizarTipoInsumo`, dados);

      if (response.data.message === "Insumo atualizado com sucesso!") {
        Alert.alert("Sucesso", response.data.message);
        setModal(false);
        setNome(null);
        const updatedInsumos = insumos.map((insumo) =>
          insumo.id === insumoSelecionado.id ? { ...insumo, ...dados } : insumo
        );
        setInsumos(updatedInsumos);
      } else {
        Alert.alert("Erro", response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o insumo. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Deletar insumo

  const abrirModalEdicao = (insumo) => {
    setInsumoSelecionado(insumo);
    setNome(insumo.nome);
    setModal(true);
  };

  const handleCancelar = () => {
    setNome(null);
    setModal(false);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View>
          <Text style={styles.text}>Nome: {item.nome}</Text>
        </View>
        <TouchableOpacity onPress={() => abrirModalEdicao(item)}>
          <Text style={styles.editButton}>Editar</Text>
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
          {info && insumos.length === 0 && <Text>Não há insumos para serem exibidos!</Text>}
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

export default TipoInsumosScreen;
