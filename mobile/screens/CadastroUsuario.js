import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

const CadastroUsuarioScreen = () => {
  const navigation = useNavigation();
  const [selectedTipoUsuario, setTipoUsuario] = useState(null);
  const [nome, setNome] = useState(null);
  const [senha, setSenha] = useState(null);
  const [login, setLogin] = useState(null);

  const tipos = ["admin", "almoxarifado", "escritorio"];
  const tiposdata = tipos.map((item) => ({
    label: item,
    value: item,
  }));

  const handleRegistro = async () => {
    try {
      const dados = {
        nome,
        login,
        tipo: selectedTipoUsuario, 
        senha
      };

      const response = await axios.post(
        "http://192.168.1.177:3000/usuarios/Cadastro",
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

  return (
    <View style={styles.container}>
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
      <Text style={styles.subheader}>Senha temporária do usuário:</Text>
      <TextInput
        style={styles.input}
        editable={true}
        secureTextEntry={true}
        keyboardType="password"
        placeholder="Digite o login do usuário aqui"
        onChangeText={setSenha}
        value={senha}
      />
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
      <TouchableOpacity style={styles.button} onPress={handleRegistro}>
        <Text style={styles.buttonText}>Registrar Usuário</Text>
      </TouchableOpacity>
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
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "#222222",
    fontSize: 17,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
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

export default CadastroUsuarioScreen;
