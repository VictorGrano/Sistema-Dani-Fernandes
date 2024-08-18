import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-gifted-charts";
import axios from "axios";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../components/Loading";

const MenuScreen = ({ route }) => {
  const navigation = useNavigation();
  const [dados, setDados] = useState([]);
  const [id, setId] = useState(1);
  const [quantidadeL, setQuantidadeL] = useState();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [local, setLocal] = useState("");
  const [total, setTotal] = useState();
  const [loading, setLoading] = useState(false);
  const [modalEntradaSaida, setModalEntradaSaida] = useState(false);
  const { primeiro_login } = route.params;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const fetchDados = useCallback(async () => {
    setLoading(true);
    await axios
      .get(`${apiUrl}/estoque/Locais`)
      .then((response) => {
        const dataL = response.data;
        setQuantidadeL(dataL.length);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
    await axios
      .get(`${apiUrl}/estoque/QuantidadeEstoque?id=${id}`)
      .then((response) => {
        const data = response.data[0];
        setTotal(data.estoque_total);
        const dadosr = [
          {
            value: data.estoque_utilizado,
            color: "blue",
            text: calculaPorcentagem(
              data.estoque_utilizado,
              data.estoque_total
            ),
            nome: `Espaço Utilizado: ${data.estoque_utilizado} caixas`,
          },
          {
            value: data.estoque_livre,
            color: "green",
            text: calculaPorcentagem(data.estoque_livre, data.estoque_total),
            nome: `Espaço livre para uso: ${data.estoque_livre} caixas`,
          },
        ];
        setLocal(data.nome_local);
        setDados(dadosr);
        setLoading(false);
      })
      .catch((error) => {
 
      });
      setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchDados();
    }, [fetchDados])
  );

  useEffect(() => {
    const fetchNome = async () => {
      const storedNome = await AsyncStorage.getItem("nome");
      const storedTipo = await AsyncStorage.getItem("tipo");
      setNome(storedNome || "Usuário");
      setTipo(storedTipo || "usuario");
    };
    fetchNome();
  }, []);

  const calculaPorcentagem = (num, total) => {
    if (total === 0) return "0%";
    const conta = (num / total) * 100;
    const porcentagem = String(Math.round(conta)).concat("%");
    return porcentagem;
  };

  const handleAvancar = () => {
    if (id < quantidadeL) {
      setId(id + 1);
    } else {
      setId(1);
    }
  };

  const handleRegredir = () => {
    if (id > 1) {
      setId(id - 1);
    } else {
      setId(quantidadeL);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("nome");
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  const handleEntradaSaida = (tipoMovimento, tipoItem) => {
    setModalEntradaSaida(false);
    navigation.navigate("Escanear", { tipo: tipoMovimento, item: tipoItem });
  };

  if (loading) {
    return <Loading />;
  }

  const Legend = ({ data }) => {
    return (
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendText}>{item.nome}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {primeiro_login ? (
          <>
            <Text style={styles.headerNome}>Olá {nome}! Seja bem vindo!</Text>
          </>
        ) : (
          <>
            <Text style={styles.headerNome}>Bem vindo de volta, {nome}!</Text>
          </>
        )}
        <View style={styles.card}>
          <Text style={styles.header}>{local}</Text>
          <PieChart
            donut
            showText
            textBackgroundColor="white"
            textColor="white"
            radius={130}
            textSize={20}
            textBackgroundRadius={30}
            centerLabelComponent={() => {
              return (
                <Text style={{ fontSize: 15, textAlign: "center" }}>
                  TOTAL: {total} caixas
                </Text>
              );
            }}
            data={dados}
          />
          <Legend data={dados} />
          <View style={styles.change}>
            <TouchableOpacity
              onPress={handleRegredir}
              style={styles.changeButton}
            >
              <FontAwesome5 name="chevron-left" style={styles.changeItem} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAvancar}
              style={styles.changeButton}
            >
              <FontAwesome5 name="chevron-right" style={styles.changeItem} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          {tipo == "admin" && (
            <>
              <Text style={styles.cardTittle}>Administração</Text>
              <ScrollView
                horizontal
                style={styles.horizontalScrollContainer}
                contentContainerStyle={
                  styles.horizontalScrollContainer.contentContainer
                }
              >
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("Menu Relatorio")}
                >
                  <FontAwesome5 name="chart-bar" size={24} color="white" />
                  <Text style={styles.buttonText}>Relatórios</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("Historico")}
                >
                  <FontAwesome5 name="clock" size={24} color="white" />
                  <Text style={styles.buttonText}>
                    Histórico de Movimentação
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("Gerenciar")}
                >
                  <FontAwesome5 name="edit" size={24} color="white" />
                  <Text style={styles.buttonText}>Gerenciar</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
          <Text style={styles.cardTittle}>Produtos</Text>
          <ScrollView
            horizontal
            style={styles.horizontalScrollContainer}
            contentContainerStyle={
              styles.horizontalScrollContainer.contentContainer
            }
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Buscar Produtos")}
            >
              <FontAwesome5 name="search" size={24} color="white" />
              <Text style={styles.buttonText}>Buscar Produtos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleEntradaSaida("entrada", "produto")}
            >
              <FontAwesome5 name="upload" size={24} color="white" />
              <Text style={styles.buttonText}>Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleEntradaSaida("saida", "produto")}
            >
              <FontAwesome5 name="download" size={24} color="white" />
              <Text style={styles.buttonText}>Saída</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Vencimentos")}
            >
              <FontAwesome5 name="clock" size={24} color="white" />
              <Text style={styles.buttonText}>Vencimentos</Text>
            </TouchableOpacity>
          </ScrollView>
          <Text style={styles.cardTittle}>Insumos</Text>
          <ScrollView
            horizontal
            style={styles.horizontalScrollContainer}
            contentContainerStyle={
              styles.horizontalScrollContainer.contentContainer
            }
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Buscar Insumos")}
            >
              <FontAwesome5 name="search" size={24} color="white" />
              <Text style={styles.buttonText}>Buscar Insumos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleEntradaSaida("entrada", "insumo")}
            >
              <FontAwesome5 name="upload" size={24} color="white" />
              <Text style={styles.buttonText}>Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleEntradaSaida("saida", "insumo")}
            >
              <FontAwesome5 name="download" size={24} color="white" />
              <Text style={styles.buttonText}>Saída</Text>
            </TouchableOpacity>
          </ScrollView>
          <Text style={styles.cardTittle}>Outros</Text>
          <ScrollView
            horizontal
            style={styles.horizontalScrollContainer}
            contentContainerStyle={
              styles.horizontalScrollContainer.contentContainer
            }
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Lista Prateleira")}
            >
              <FontAwesome5 name="list" size={24} color="white" />
              <Text style={styles.buttonText}>Lista Prateleira</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <FontAwesome5 name="sign-out-alt" size={24} color="white" />
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flex: 1,
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#D8B4E2",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    margin: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    elevation: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    margin: 20,
    flex: 1,
  },
  cardTittle: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "left",
  },

  horizontalScrollContainer: {
    contentContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingRight: 30,
    },
    backgroundColor: "#FFFFFF",
    margin: 10,
    elevation: 10,
    padding: 20,
    borderRadius: 20,
  },
  headerNome: {
    fontSize: 25,
    marginTop: 20,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    fontSize: 25,
    marginBottom: 10,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  changeItem: {
    fontSize: 25,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 16,
  },
  change: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    marginHorizontal: 20,
  },
  changeButton: {
    paddingHorizontal: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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

export default MenuScreen;
