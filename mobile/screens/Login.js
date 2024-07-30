import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

const LoginScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const [visualizarSenha, setVisualizarSenha] = useState(true);

  const handleLogin = async () => {
    const loginData = {
      user: user,
      senha: senha,
    };
    console.log(loginData);

    try {
      const response = await axios.post(
        "http://192.168.1.177:3000/usuarios/Login",
        loginData
      );
      const data = response.data;
        AsyncStorage.setItem("nome", data[0].nome),
        AsyncStorage.setItem("id", String(data[0].id)),
        navigation.replace("Menu");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Usuário ou senha inválidos!");
      } else {
        console.error(error);
        alert("Ocorreu um erro ao fazer login. Por favor, tente novamente.");
      }
    }
  };

  const handlePassword = () => {
    setVisualizarSenha(!visualizarSenha);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      <Text style={styles.label}>Usuário:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o usuário aqui"
        onChangeText={setUser}
      />
      <Text style={styles.label}>Senha:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a senha aqui"
        secureTextEntry={visualizarSenha}
        keyboardType="password"
        onChangeText={setSenha}
      />
      {visualizarSenha ? (
        <FontAwesome5 name="eye" size={25} color="black" onPress={handlePassword}/>
      ) : (
        <FontAwesome5 name="eye-slash" size={25} color="black" onPress={handlePassword}/>
      )}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#D8B4E2",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    fontSize: 25,
    marginBottom: 10,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    marginLeft: -250,
    color: "#222222",
    fontWeight: "bold",
    fontSize: 17,
  },
  input: {
    height: 40,
    width: "80%",
    margin: 12,
    borderWidth: 0,
    padding: 10,
    color: "#222222",
    backgroundColor: "transparent",
    fontSize: 17,
    textAlign: "left",
    borderRadius: 8,
    borderBottomWidth: 1, 
  },
});

export default LoginScreen;
