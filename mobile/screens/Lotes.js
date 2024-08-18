import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import Loading from "../components/Loading";

const LotesScreen = ({ route }) => {
  const [lotes, setLotes] = useState([]);
  const [info, setInfo] = useState(false);
  const [editar, setEditar] = useState(null);
  const [dataL, setDataL] = useState([]);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [coluna, setColuna] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = route.params;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const lotesResponse = await axios.get(`${apiUrl}/produtos/Lotes?produto_id=${id}`);
        setLotes(lotesResponse.data);
        
        const locaisResponse = await axios.get(`${apiUrl}/estoque/Locais`);
        const locaisData = locaisResponse.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }));
        setDataL(locaisData);
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setLoading(false);
          setInfo(true);
        } else {
          console.error("Error fetching data:", error);
        }
      }
      setLoading(false);
    };
    setLoading(false);
    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    const options = { month: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  const handleEditar = (loteId) => {
    setEditar(loteId);
  };

  const handleSave = async (loteId) => {
    try {
      const dados = {
        lote_id: loteId,
        local_armazenado_id: selectedLocal !== null ? selectedLocal : lotes.find(lote => lote.id === loteId).local_armazenado_id,
        coluna: coluna,
      };
 
      setLoading(true);
      await axios.post(`${apiUrl}/produtos/AtualizarLote`, dados);
      Alert.alert("Sucesso", "Localização atualizada com sucesso!")
      setLoading(false);
      setEditar(null);
      setSelectedLocal(null);
      setColuna('');
      fetchData(); 
       // Recarrega os dados após a atualização
    } catch (error) {
      setLoading(false);
      console.error("Error saving data:", error.response.data);
      Alert.alert("Erro", "Ocorreu um erro ao salvar a nova localização.");
    }
    setLoading(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {lotes.map((lote, index) => (
        <View
          key={lote.id}
          style={[styles.detailsContainer, index === 0 && styles.firstLote]}
        >
          {index == 0 && (
            <Text style={styles.detailsTextHeader}>Prioridade de saída</Text>
          )}
          <Text style={styles.detailsTextHeader}>Lote: {lote.nome_lote}</Text>
          <Text style={styles.detailsText}>Estoque: {lote.quantidade}</Text>
          <Text style={styles.detailsText}>Quantidade de caixas: {lote.quantidade_caixas}</Text>
          <Text style={styles.detailsText}>
            Fabricação: {formatDate(lote.data_fabricacao)}
          </Text>
          <Text style={styles.detailsText}>
            Validade: {formatDate(lote.data_validade)}
          </Text>
          {editar === lote.id ? (
            <>
              <Dropdown
                style={styles.dropdown}
                data={dataL}
                search={true}
                labelField="label"
                valueField="value"
                placeholder="Selecione o local"
                value={selectedLocal}
                onChange={(item) => setSelectedLocal(item.value)}
              />
              <TextInput
                style={styles.input}
                placeholder="Coluna"
                value={coluna}
                onChangeText={(value) => setColuna(value)}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSave(lote.id)}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setEditar(null)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.detailsText}>
                Local Armazenado: {lote.nome_local || "Não registrado"}
              </Text>
              <Text style={styles.detailsText}>
                Coluna: {lote.coluna || "Não há esse produto no estoque"}
              </Text>
            </>
          )}
          {!editar && (
          <TouchableOpacity
                style={styles.button}
                onPress={() => handleEditar(lote.id)}
              >
                <Text style={styles.buttonText}>Editar Localização</Text>
              </TouchableOpacity>
          )}
        </View>
      ))}
      {info && (
        <Text style={styles.infoText}>Não há lotes para serem exibidos!</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailsContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f7f7f7",
    width: "100%",
  },
  firstLote: {
    borderColor: "red",
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  detailsTextHeader: {
    fontSize: 25,
    marginBottom: 10,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
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
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonCancel: {
    backgroundColor: "#F08080",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
    justifyContent: "center",
    width: "100%",
  },
  dropdown: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 10,
    width: "100%",
  },
  infoText: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default LotesScreen;
