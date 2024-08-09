import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";


const UsuariosScreen = () => {
  const navigation = useNavigation();
  const [selectedTipoUsuario, setTipoUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState(null);
  const [senha, setSenha] = useState(null);
  const [login, setLogin] = useState(null);
  const [cadastrar, setCadastrar] = useState(false);
  const [modal, setModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);

  const tipos = ["admin", "almoxarifado", "escritorio"];
  const tiposdata = tipos.map((item) => ({
    label: item,
    value: item,
  }));

  useEffect(() => {
    try {
      axios.get(`http://192.168.1.177:3000/usuarios/`).then((response) => {
        const usuarios = response.data.map((usuario) => ({
          id: usuario.id, // Assumindo que cada usuário tem um ID único
          nome: usuario.nome,
          tipo: usuario.tipo,
          login: usuario.login,
        }));
        setUsuarios(usuarios);
        setFilteredUsuarios(usuarios);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    setFilteredUsuarios(
      usuarios.filter((usuario) =>
        usuario.nome.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, usuarios]);

  const handleRegistro = async () => {
    try {
      const dados = {
        nome,
        login,
        tipo: selectedTipoUsuario,
        senha,
      };

      const response = await axios.post(
        `http://192.168.1.177:3000/usuarios/Cadastro`,
        dados
      );

      if (response.data.message === "Usuário cadastrado com sucesso!") {
        Alert.alert("Sucesso", response.data.message);
        navigation.goBack();
      } else {
        Alert.alert("Erro", response.data.message);
        setNome(null);
        setLogin(null);
        setTipoUsuario(null);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao registrar o usuário. Tente novamente mais tarde."
      );
    }
  };

  const handleEdicao = async () => {
    try {
      const dados = {
        id: usuarioSelecionado.id,
        nome,
        login,
        tipo: selectedTipoUsuario,
      };

      const response = await axios.put(
        `http://192.168.1.177:3000/usuarios/Atualizar`,
        dados
      );

      if (response.data.message === "Usuário atualizado com sucesso!") {
        Alert.alert("Sucesso", response.data.message);
        setModal(false);
        setNome(null);
        setLogin(null);
        setTipoUsuario(null);
        // Atualizar a lista de usuários
        const updatedUsuarios = usuarios.map((usuario) =>
          usuario.id === usuarioSelecionado.id ? { ...usuario, ...dados } : usuario
        );
        setUsuarios(updatedUsuarios);
      } else {
        Alert.alert("Erro", response.data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao atualizar o usuário. Tente novamente mais tarde."
      );
    }
  };

  const abrirModalEdicao = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNome(usuario.nome);
    setLogin(usuario.login);
    setTipoUsuario(usuario.tipo);
    setModal(true);
  };

  const handleCancelar = () => {
    setNome(null);
    setLogin(null);
    setTipoUsuario(null);
    setModal(false);
  };

  const handleDelete = async () => {
    const id = usuarioSelecionado.id
    axios.delete(`http://192.168.1.177:3000/usuarios/${id}:id`).then((response) => {
      if (response.status == "200") {
        Alert.alert("Sucesso!", "Usuário deletado com sucesso!")
      }
      else {
        Alert.alert("Erro!", "Erro ao deletar!")
      }
    })
  }

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View>
          <Text style={styles.text}>Nome: {item.nome}</Text>
          <Text style={styles.text}>Tipo: {item.tipo}</Text>
          <Text style={styles.text}>Login: {item.login}</Text>
        </View>
        <TouchableOpacity onPress={() => abrirModalEdicao(item)}>
          <FontAwesome5 name="user-edit" size={30} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {cadastrar ? (
        <>
          <View style={styles.cardContainer}>
            <Text style={styles.subheader}>Nome do Usuário:</Text>
            <TextInput
              style={styles.input}
              editable={true}
              placeholder="Digite o nome do usuário aqui"
              onChangeText={setNome}
              value={nome}
            />
          </View>
          <View style={styles.cardContainer}>
            <Text style={styles.subheader}>Login do Usuário:</Text>
            <TextInput
              style={styles.input}
              editable={true}
              placeholder="Digite o login do usuário aqui"
              onChangeText={setLogin}
              value={login}
            />
          </View>
          <View style={styles.cardContainer}>
            <Text style={styles.subheader}>Senha temporária do usuário:</Text>
            <TextInput
              style={styles.input}
              editable={true}
              secureTextEntry={true}
              keyboardType="password"
              placeholder="Digite a senha temporária do usuário aqui"
              onChangeText={setSenha}
              value={senha}
            />
          </View>
          <View style={styles.cardContainer}>
            <Dropdown
              style={styles.dropdown}
              data={tiposdata}
              search={true}
              labelField="label"
              valueField="value"
              placeholder="Selecione o tipo de usuário"
              value={selectedTipoUsuario}
              onChange={(item) => {
                setTipoUsuario(item.value);
              }}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRegistro}>
            <Text style={styles.buttonText}>Registrar Usuário</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCadastrar(false)}
          >
            <Text style={styles.buttonText}>Ver lista de usuários</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuário"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filteredUsuarios}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCadastrar(true)}
          >
            <Text style={styles.buttonText}>Cadastrar Usuário</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Editar Usuário</Text>
            <Text style={styles.subheader}>Nome do Usuário:</Text>
            <TextInput
              style={styles.input}
              editable={true}
              placeholder="Digite o nome do usuário aqui"
              onChangeText={setNome}
              value={nome}
            />
            <Text style={styles.subheader}>Login do Usuário:</Text>
            <TextInput
              style={styles.input}
              editable={true}
              placeholder="Digite o login do usuário aqui"
              onChangeText={setLogin}
              value={login}
            />
            <Text style={styles.subheader}>Tipo do Usuário:</Text>
            <Dropdown
              style={styles.dropdown}
              data={tiposdata}
              search={true}
              labelField="label"
              valueField="value"
              placeholder="Selecione o tipo de usuário"
              value={selectedTipoUsuario}
              onChange={(item) => {
                setTipoUsuario(item.value);
              }}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleEdicao}>
              <Text style={styles.modalButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.modalButtonText}>Excluir Usuário</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCancelar}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
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
    alignItems: "center",
  },
  input: {
    height: 40,
    margin: 12,
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
    width: 250,
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
  searchInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "#222222",
    fontSize: 17,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
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
    marginBottom: 10,
    width: "100%",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UsuariosScreen;
