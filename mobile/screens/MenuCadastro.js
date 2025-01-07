import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const GerenciarScreen = () => {
  const navigation = useNavigation();
  const [modalInsumo, setModalInsumo] = useState(false);

  const handleInsumos = () => {
    setModalInsumo(false);
    navigation.navigate("Insumos");
  }
  const handleTipoInsumo = () => {
    setModalInsumo(false);
    navigation.navigate("Tipo Insumos");
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Produtos")}
        >
          <FontAwesome5 name="cart-plus" size={24} color="white" />
          <Text style={styles.buttonText}>Produtos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Materias Primas")}
        >
          <FontAwesome5 name="pump-soap" size={24} color="white" />
          <Text style={styles.buttonText}>Matérias Primas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalInsumo(true)} // Corrigido para callback
        >
          <FontAwesome5 name="pump-soap" size={24} color="white" />
          <Text style={styles.buttonText}>Insumos</Text>
        </TouchableOpacity>
        <Modal visible={modalInsumo} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleInsumos}
              >
                <Text style={styles.buttonText}>Gerenciar Insumos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleTipoInsumo}
              >
                <Text style={styles.buttonText}>Gerenciar Tipo de Insumos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalInsumo(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Usuarios")}
        >
          <FontAwesome5 name="user" size={24} color="white" />
          <Text style={styles.buttonText}>Usuários</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flex: 1,
    padding: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#4D7EA8",
    padding: 20,
    elevation: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    width: 150,
    height: 150,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default GerenciarScreen;
