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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Loading from "../components/Loading";

const MateriasPrimasScreen = () => {
  const navigation = useNavigation();
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [filteredMateriasPrimas, setFilteredMateriasPrimas] = useState([]);
  const [search, setSearch] = useState("");
  const [cadastrar, setCadastrar] = useState(false);
  const [novaMateriaPrima, setNovaMateriaPrima] = useState({
    materia_prima: "",
    descricao: "",
    estoque: 0,
    preco: 0,
    local_armazenado: "",
    coluna: "",
    medida: "",
  });
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      console.error("A variável EXPO_PUBLIC_API_URL não está configurada.");
      return;
    }
    setLoading(true);
    axios
      .get(`${apiUrl}/materia-prima/`)
      .then((response) => {
        setMateriasPrimas(response.data);
        setFilteredMateriasPrimas(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar matérias-primas:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setFilteredMateriasPrimas(
      materiasPrimas.filter((item) =>
        item.materia_prima.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, materiasPrimas]);

  const handleCadastro = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/estoque/EntradaMateriaPrima`,
        novaMateriaPrima
      );
      setMateriasPrimas((prev) => [...prev, response.data]);
      Alert.alert("Sucesso!", "Matéria-prima cadastrada com sucesso.");
      setCadastrar(false);
      setNovaMateriaPrima({
        materia_prima: "",
        descricao: "",
        estoque: 0,
        preco: 0,
        local_armazenado: "",
        coluna: "",
        medida: "",
      });
    } catch (error) {
      Alert.alert("Erro!", "Não foi possível cadastrar a matéria-prima.");
      console.error("Erro ao cadastrar matéria-prima:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.text}>Nome: {item.materia_prima}</Text>
        <Text style={styles.text}>Descrição: {item.descricao}</Text>
        <Text style={styles.text}>Estoque: {item.estoque}</Text>
        <Text style={styles.text}>Preço: R${item.preco}</Text>
        <Text style={styles.text}>Local: {item.local_armazenado}</Text>
        <Text style={styles.text}>Coluna: {item.coluna}</Text>
        <Text style={styles.text}>Medida: {item.medida}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {cadastrar ? (
        <ScrollView>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCadastrar(false)}
          >
            <Text style={styles.buttonText}>Voltar à lista</Text>
          </TouchableOpacity>
          <Text style={styles.subheader}>Nome:</Text>
          <TextInput
            style={styles.input}
            value={novaMateriaPrima.materia_prima}
            onChangeText={(text) =>
              setNovaMateriaPrima((prev) => ({
                ...prev,
                materia_prima: text,
              }))
            }
          />
          <Text style={styles.subheader}>Descrição:</Text>
          <TextInput
            style={styles.input}
            value={novaMateriaPrima.descricao}
            onChangeText={(text) =>
              setNovaMateriaPrima((prev) => ({
                ...prev,
                descricao: text,
              }))
            }
          />
          <Text style={styles.subheader}>Estoque:</Text>
          <TextInput
            style={styles.input}
            value={novaMateriaPrima.estoque.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setNovaMateriaPrima((prev) => ({
                ...prev,
                estoque: parseInt(text) || 0,
              }))
            }
          />
          <Text style={styles.subheader}>Preço:</Text>
          <TextInput
            style={styles.input}
            value={novaMateriaPrima.preco.toString()}
            keyboardType="numeric"
            onChangeText={(text) =>
              setNovaMateriaPrima((prev) => ({
                ...prev,
                preco: parseFloat(text) || 0,
              }))
            }
          />
          <Text style={styles.subheader}>Local Armazenado:</Text>
          <TextInput
            style={styles.input}
            value={novaMateriaPrima.local_armazenado}
            onChangeText={(text) =>
              setNovaMateriaPrima((prev) => ({
                ...prev,
                local_armazenado: text,
              }))
            }
          />
          <Text style={styles.subheader}>Coluna:</Text>
          <TextInput
            style={styles.input}
            value={novaMateriaPrima.coluna}
            onChangeText={(text) =>
              setNovaMateriaPrima((prev) => ({
                ...prev,
                coluna: text,
              }))
            }
          />
          <Text style={styles.subheader}>Medida:</Text>
          <TextInput
            style={styles.input}
            value={novaMateriaPrima.medida}
            onChangeText={(text) =>
              setNovaMateriaPrima((prev) => ({
                ...prev,
                medida: text,
              }))
            }
          />
          <TouchableOpacity style={styles.button} onPress={handleCadastro}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar matéria-prima"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filteredMateriasPrimas}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCadastrar(true)}
          >
            <Text style={styles.buttonText}>Cadastrar Matéria-Prima</Text>
          </TouchableOpacity>
        </>
      )}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 10,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4D7EA8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  searchInput: {
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
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
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MateriasPrimasScreen;
