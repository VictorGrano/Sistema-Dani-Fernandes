import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import Loading from "../components/Loading";

const VencimentoScreen = () => {
  const [info, setInfo] = useState(false);
  const [dataL, setDataL] = useState([]);
  const [lotesVencimentoProximo, setLotesVencimentoProximo] = useState([]);
  const [filtro, setFiltro] = useState(30); // Default: 30 dias
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const lotesResponse = await axios.get(`${apiUrl}/produtos/AllLotes`);
        const lotesData = lotesResponse.data;

        const locaisResponse = await axios.get(`${apiUrl}/estoque/Locais`);
        const locaisData = locaisResponse.data.map((local) => ({
          label: local.nome_local,
          value: local.id,
        }));
        setDataL(locaisData);

        // Filtra lotes com vencimento dentro do período selecionado
        const today = new Date();
        const endDate = new Date(today.getTime() + filtro * 24 * 60 * 60 * 1000); // Data final do filtro

        const lotesProximos = lotesData.filter((lote) => {
          const validade = new Date(lote.data_validade);
          return validade > today && validade <= endDate; // Filtra se a validade está dentro do período
        });

        setLotesVencimentoProximo(lotesProximos);
        
        if (lotesProximos.length === 0) {
          setInfo(true);
        } else {
          setInfo(false);
        }
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setLoading(false);
          setInfo(true);
        }
      }
    };
    setLoading(false);
    fetchData();
  }, [filtro]);

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    const options = { month: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Dropdown
        style={styles.dropdown}
        data={[
          { label: "30 dias", value: 30 },
          { label: "3 meses", value: 90 },
          { label: "6 meses", value: 180 },
          { label: "1 ano", value: 365 },
        ]}
        labelField="label"
        valueField="value"
        placeholder="Selecione o período"
        value={filtro}
        onChange={(item) => setFiltro(item.value)}
      />

      {lotesVencimentoProximo.length > 0 && (
        <Text style={styles.detailsTextHeader}>Vencimento Próximo:</Text>
      )}

      {lotesVencimentoProximo.map((lote) => (
        <View
          key={lote.id}
          style={[
            styles.detailsContainer,
            new Date(lote.data_validade) <=
              new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) &&
              styles.proximoVencimento,
          ]}
        >
          <Text style={styles.detailsTextHeader}>{lote.nome}</Text>
          <Text style={styles.detailsText}>Lote: {lote.nome_lote}</Text>
          <Text style={styles.detailsText}>Estoque: {lote.quantidade}</Text>
          <Text style={styles.detailsText}>Quantidade de caixas: {lote.quantidade_caixas}</Text>
          <Text style={styles.detailsText}>
            Fabricação: {formatDate(lote.data_fabricacao)}
          </Text>
          <Text style={styles.detailsText}>
            Validade: {formatDate(lote.data_validade)}
          </Text>
        </View>
      ))}

      {info && (
        <Text style={styles.infoText}>Não há lotes próximos ao vencimento!</Text>
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
  proximoVencimento: {
    borderColor: "red",
    backgroundColor: "#ffe6e6",
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
  dropdown: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  infoText: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default VencimentoScreen;
