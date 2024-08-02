import React, { useEffect, useState } from "react";
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
  const [localArmazenado, setLocalArmazenado] = useState(null);
  const [coluna, setColuna] = useState(null);

  useEffect(() => {
    axios
      .get("http://192.168.1.177:3000/estoque/Locais")
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
      .get("http://192.168.1.177:3000/insumos/TiposInsumos")
      .then((response) => {
        const tiposData = response.data.map((tipo) => ({
          label: tipo.nome,
          value: tipo.id,
        }));
        setTipos(tiposData);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
  }, []);
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
      console.log(dados);
      const response = await axios.post(
        "http://192.168.1.177:3000/insumos/CadastroInsumo",
        dados
      );

      if (response.status == "201") {
        Alert.alert("Sucesso", "Insumo cadastrado com sucesso!");
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
        "Ocorreu um erro ao registrar o insumo. Tente novamente mais tarde."
      );
    }
  };

  return (
    <View style={styles.container}>
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
      <TouchableOpacity style={styles.button} onPress={handleRegistro}>
        <Text style={styles.buttonText}>Cadastrar Insumo</Text>
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

export default InsumosScreen;
