import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

const EscanearScreen = ({ route }) => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [linkEntrada, setLinkEntrada] = useState(false);
  const [linkSaida, setLinkSaida] = useState(false);
  const { tipo, item } = route.params;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  useEffect(() => {
    if (tipo === "entrada") {
      setLinkEntrada(true);
      setLinkSaida(false);
    } else {
      setLinkEntrada(false);
      setLinkSaida(true);
    }
  }, [tipo]);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    const dados = JSON.parse(data);
    if (tipo === "entrada" && item === "produto") {
      navigation.navigate("Entrada", {
        id: dados.id,
        quantidade: dados.quantidade,
        lote: dados.lote,
        validade: dados.validade,
        fabricacao: dados.fabricacao,
      });
    } else if (tipo === "saida" && item === "produto") {
      navigation.navigate("Saida", {
        id: dados.id,
        quantidade: dados.quantidade,
        lote: dados.lote,
      });
    } else if (tipo === "entrada" && item === "insumo") {
      navigation.navigate("Entrada Insumo", {
        id: dados.id,
        lote: dados.lote,
        quantidade: dados.quantidade,
      });
    } else if (tipo === "saida" && item === "insumo") {
      navigation.navigate("Saida Insumo", {
        id: dados.id,
        lote: dados.lote,
        quantidade: dados.quantidade,
      });
    }
  };

  if (hasPermission === null) {
    return <Text>Pedindo permissão da câmera</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso a câmera</Text>;
  }

  const { width } = Dimensions.get("window");
  const maskSize = width * 0.7;

  return (
    <View style={styles.container}>
      <View style={styles.maskContainer}>
        <View style={styles.maskInnerContainer}>
          <CameraView
            onBarcodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barCodeScannerSettings={{
              barCodeTypes: ['qr'],
            }}
          />
          <View
            style={[styles.maskFrame, { height: maskSize, width: maskSize }]}
          />
        </View>
        {linkEntrada && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => item === "produto" ? navigation.navigate("Entrada") : navigation.navigate("Entrada Insumo")}
          >
            <Text style={styles.buttonText}>Dar Entrada manualmente</Text>
          </TouchableOpacity>
        )}
        {linkSaida && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => item === "produto" ? navigation.navigate("Saida") : navigation.navigate("Saida Insumo")}
          >
            <Text style={styles.buttonText}>Dar Saída manualmente</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
  },
  maskContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  maskInnerContainer: {
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
  maskFrame: {
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#4D7EA8",
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
});

export default EscanearScreen;