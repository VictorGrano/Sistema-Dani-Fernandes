import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const GerenciarScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Produtos")}>
          <FontAwesome5 name="cart-plus" size={24} color="white" />
          <Text style={styles.buttonText}>Produtos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button} 
          onPress={() => navigation.navigate("Insumos")}
        >
          <FontAwesome5 name="pump-soap" size={24} color="white" />
          <Text style={styles.buttonText}>Insumos</Text>
        </TouchableOpacity>
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
    backgroundColor: "#D8B4E2",
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
  card: {
    backgroundColor: "#FFFFFF",
    padding: 50,
    elevation: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    marginTop: -50,
  },
  header: {
    fontSize: 25,
    marginBottom: 10,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default GerenciarScreen;
