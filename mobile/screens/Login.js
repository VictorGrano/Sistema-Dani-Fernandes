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
import Loading from "../components/Loading";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const [visualizarSenha, setVisualizarSenha] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleLogin = async () => {
    const loginData = {
      user: user,
      senha: senha,
    };
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/usuarios/Login`,
        loginData
      );
      const data = response.data;
  
      if (data.token) {
        // Armazene o token no AsyncStorage
        await AsyncStorage.setItem("token", data.token);
        
        // Definir o interceptor do axios diretamente após o login
        axios.interceptors.request.use(
          async (config) => {
            const token = await AsyncStorage.getItem("token");
            if (token) {
              config.headers['x-access-token'] = token; // Cabeçalho personalizado
            }
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
        
        // Armazene os outros dados do usuário
        await AsyncStorage.setItem("nome", data.usuario.nome);
        await AsyncStorage.setItem("id", String(data.usuario.id));
        await AsyncStorage.setItem("tipo", data.usuario.tipo);
  
        if (data.usuario.primeiro_login == true) {
          setIsModalVisible(true);
          setLoading(false);
        } else {
          navigation.replace("Menu", { primeiro_login: false });
        }
      } else {
        setLoading(false);
        alert("Usuário ou senha inválidos!");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setLoading(false);
        alert("Usuário ou senha inválidos!");
      } else {
        setLoading(false);
        console.error(error);
        alert("Ocorreu um erro ao fazer login. Por favor, tente novamente.");
      }
    }
    setLoading(false);
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
      setLoading(true);
      const id = await AsyncStorage.getItem("id");
      if (!id) {
        setLoading(false);
        throw new Error("ID do usuário não encontrado.");
      }
      const response = await axios.post(`${apiUrl}/usuarios/NovaSenha`, {
        id: id,
        senha: newPassword,
      });
 
      if (response.data.success) {
        setLoading(false);
        Alert.alert("Sucesso", "Senha alterada com sucesso!");
        setIsModalVisible(false);
        navigation.replace("Menu", {primeiro_login: true});
      } else {
        setLoading(false);
        Alert.alert("Erro", "Ocorreu um erro ao alterar a senha. Tente novamente.");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Erro", "Ocorreu um erro.");
    }
  };

  if (loading) {
    return <Loading />;
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
