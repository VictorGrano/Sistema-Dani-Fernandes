import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = () => {
    const loginData = {
      user: user,
      senha: senha,
    };
    console.log(loginData);
    axios
      .post("http://192.168.1.102:3000/usuarios/Login", loginData)
      .then((response) => {
        if (response.data.message == 'Logado') {
          navigation.replace("Menu");
        }
      })
      .catch((error) => {
        if (error.response.status == "404") {
          alert("Usuário ou senha inválidos!");
        }
      });
  };

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
        keyboardType="password"
        onChangeText={setSenha}
      />
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
    color: '#222222',
    fontWeight: 'bold',
    fontSize: 17,
  },
  input: {
    height: 40,
    width: '80%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "#222222",
    backgroundColor: "#FFFFFF",
    fontSize: 17,
    textAlign: "center",
    borderRadius: 8,
  },
});

export default LoginScreen;
