import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const [visualizarSenha, setVisualizarSenha] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleLogin = async () => {
    const loginData = {
      user: user,
      senha: senha,
    };
    console.log(loginData);

    try {
      const response = await axios.post(
        `http://192.168.1.177:3000/usuarios/Login`,
        loginData
      );
      const data = response.data;
      await AsyncStorage.setItem("nome", data[0].nome);
      await AsyncStorage.setItem("id", String(data[0].id));
      await AsyncStorage.setItem("tipo", data[0].tipo);
      if (data[0].primeiro_login === "sim") {
        setIsModalVisible(true);
      } else {
        navigation.replace("Menu");
      }
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
  };

  const handleSetNewPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      const id = await AsyncStorage.getItem("id");
      if (!id) {
        throw new Error("ID do usuário não encontrado.");
      }
      const response = await axios.post(`http://192.168.1.177:3000/usuarios/NovaSenha`, {
        id: id,
        senha: newPassword,
      });
      console.log(response)
      if (response.data.success) {
        Alert.alert("Sucesso", "Senha alterada com sucesso!");
        setIsModalVisible(false);
        navigation.replace("Menu");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao alterar a senha. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Ocorreu um erro.");
    }
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
        secureTextEntry={visualizarSenha}
        onChangeText={setSenha}
      />
      <FontAwesome5
        name={visualizarSenha ? "eye" : "eye-slash"}
        size={25}
        color="black"
        onPress={handlePassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>Definir Nova Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a nova senha"
              secureTextEntry={true}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirme a nova senha"
              secureTextEntry={true}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleSetNewPassword}>
              <Text style={styles.buttonText}>Salvar</Text>
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
    padding: 20,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
});

export default LoginScreen;
