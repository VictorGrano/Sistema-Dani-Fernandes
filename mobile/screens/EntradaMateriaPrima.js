import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../components/Loading";
import { Dropdown } from "react-native-element-dropdown";

const EntradaMateriaPrimaScreen = () => {
  const navigation = useNavigation();
  const [nome, setNome] = useState("");
  const [id, setID] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [coluna, setColuna] = useState("");
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [locais, setLocais] = useState([]);
  const [selectedMateriaPrima, setSelectedMateriaPrima] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [nomeUser, setNomeUser] = useState("");
  const [medida, setMedida] = useState("");
  const [idUser, setIdUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [estoqueAtual, setEstoqueAtual] = useState(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedNome = await AsyncStorage.getItem("nome");
        const storedID = await AsyncStorage.getItem("id");
        setNomeUser(storedNome || "Usuário");
        setIdUser(storedID || null);

        const [materiasPrimasResponse, locaisResponse] = await Promise.all([
          axios.get(`${apiUrl}/materia-prima/`),
          axios.get(`${apiUrl}/estoque/Locais`),
        ]);

        const materiasPrimasData = materiasPrimasResponse.data.map(
          (materia) => ({
            label: materia.materia_prima,
            value: materia.id,
          })
        );
        setMateriasPrimas(materiasPrimasData);

        const locaisData = locaisResponse.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }));
        setLocais(locaisData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    if (selectedMateriaPrima) {
      axios
        .get(`${apiUrl}/materia-prima/Info?id=${selectedMateriaPrima}`)
        .then((response) => {
          setNome(response.data.materia_prima);
          setEstoqueAtual(response.data.estoque);
          setMedida(response.data.medida);
        })
        .catch((error) => {
          console.error("Erro ao buscar dados da matéria-prima:", error);
        });
    }
  }, [selectedMateriaPrima, apiUrl]);

  const handleEntrar = () => {
    const entradaData = {
      id: selectedMateriaPrima || id,
      quantidade: quantidade,
      localArmazenado: selectedLocal,
      coluna: coluna,
      user: nomeUser,
      iduser: idUser,
    };

    setLoading(true);
    axios
      .post(`${apiUrl}/estoque/EntradaMateriaPrima`, entradaData)
      .then(() => {
        navigation.goBack();
      })
      .catch((error) => {
        console.error("Erro ao criar entrada:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dados da Matéria-Prima:</Text>
      <View style={styles.card}>
        <Text style={styles.subheader}>Nome da Matéria-Prima:</Text>
        <Dropdown
          style={styles.dropdown}
          data={materiasPrimas}
          search={true}
          labelField="label"
          valueField="value"
          placeholder="Selecione uma matéria-prima"
          value={selectedMateriaPrima}
          onChange={(item) => {
            setSelectedMateriaPrima(item.value);
            setID(item.value);
          }}
        />
        {estoqueAtual !== null && (
          <Text style={styles.subheader}>
            Estoque Atual: {estoqueAtual}
            {medida}
          </Text>
        )}
      </View>
      <Text style={styles.header}>Quantidade:</Text>
      <View style={styles.card}>
        <Text style={styles.subheader}>Quantidade a adicionar:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a quantidade"
          keyboardType="numeric"
          onChangeText={setQuantidade}
          value={quantidade}
        />
      </View>
      <Text style={styles.header}>Local:</Text>
      <View style={styles.card}>
        <Text style={styles.subheader}>Local Armazenado:</Text>
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
        <Text style={styles.subheader}>Coluna armazenada:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: A1"
          onChangeText={setColuna}
          value={coluna}
        />
      </View>
      <TouchableOpacity style={styles.buttonEntrada} onPress={handleEntrar}>
        <Text style={styles.buttonText}>Criar Entrada</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    borderRadius: 20,
    marginBottom: 15,
    flex: 1,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: "#222222",
    backgroundColor: "#FFFFFF",
    fontSize: 17,
    textAlign: "center",
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
  buttonEntrada: {
    backgroundColor: "#4D7EA8",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
  },
});

export default EntradaMateriaPrimaScreen;
