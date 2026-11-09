
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  loginUser,
  logoutUser,
} from "../../services/authService";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(email.trim(), password);
      
      // I-convert sa lowercase ang role para walay libog sa capital/small letters
      const userRole = result.role ? result.role.toLowerCase().trim() : "";

      if (userRole === "boarder" || userRole === "student") {
        router.replace("/boarder-dashboard" as any);
      } else if (userRole === "dorm manager" || userRole === "caretaker") {
        router.replace("/caretaker-dashboard" as any);
      } else if (userRole === "owner" || userRole === "admin") {
        router.replace("/owner-dashboard" as any);
      } else {
        await logoutUser();
        Alert.alert(
          "Invalid Account",
          "Your account does not have a valid role. Please contact the administrator."
        );
      }
    } catch (error: any) {
      let message = "Unable to log in. Please try again.";

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        message = "Incorrect email or password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Please check your internet connection.";
      } else if (
        error.message === "User account information was not found."
      ) {
        message =
          "Your account information was not found. Please contact the administrator.";
      }

      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SLAYA HEADER */}
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="home" size={38} color="#24517D" />
            </View>

            <Text style={styles.logo}>SLAYA</Text>

            <Text style={styles.system}>
              DORMITORY MANAGEMENT
            </Text>

            <Text style={styles.tagline}>
              Safe. Organized. Connected.
            </Text>

            <View style={styles.headerLine} />
          </View>

          {/* LOGIN CARD */}
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>
                Log in to your account
              </Text>
            </View>

            {/* EMAIL */}
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#54718F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#8794A8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* PASSWORD */}
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#54718F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#8794A8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoComplete="current-password"
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={21}
                  color="#426487"
                />
              </TouchableOpacity>
            </View>

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>LOG IN</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* SIGNUP LINK */}
            <TouchableOpacity
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.link}>
                Don't have an account?{" "}
                <Text style={styles.linkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <Text style={styles.footer}>
            © SLAYA Dormitory Management System
          </Text>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#DCE9F7",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(220,235,250,0.72)",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  // HEADER
  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 25,
    backgroundColor: "#E5EFFB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 7,
    shadowColor: "#6685A8",
    shadowOpacity: 0.28,
    shadowRadius: 9,
    shadowOffset: { width: -4, height: -4 },
    borderWidth: 1,
    borderColor: "#F7FBFF",
  },

  logo: {
    fontSize: 43,
    fontWeight: "900",
    letterSpacing: 3,
    color: "#123D70",
    marginTop: 10,
  },

  system: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#244B78",
    marginTop: 3,
  },

  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#496C93",
    marginTop: 7,
  },

  headerLine: {
    width: 100,
    height: 5,
    backgroundColor: "#9DB9D9",
    borderRadius: 10,
    marginTop: 13,
  },

  // CLAY LOGIN CARD
  card: {
    backgroundColor: "#E5EFFB",
    borderRadius: 30,
    paddingHorizontal: 23,
    paddingTop: 28,
    paddingBottom: 25,
    width: "94%",
    alignSelf: "center",

    borderWidth: 1.5,
    borderColor: "#F8FBFF",

    elevation: 12,
    shadowColor: "#6B8DB3",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: {
      width: 7,
      height: 9,
    },
  },

  cardTop: {
    marginBottom: 23,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#173C68",
  },

  subtitle: {
    fontSize: 15,
    color: "#75869B",
    marginTop: 5,
  },

  // FIELD LABELS
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#557392",
    marginBottom: 9,
    marginLeft: 5,
  },

  // INSET CLAY INPUTS
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9E6F5",
    borderRadius: 17,
    paddingHorizontal: 15,
    minHeight: 57,
    marginBottom: 20,

    borderWidth: 1,
    borderColor: "#D0DFF0",

    elevation: 3,
    shadowColor: "#A1B8D3",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: -2,
      height: -2,
    },
  },

  inputIcon: {
    marginRight: 11,
  },

  input: {
    flex: 1,
    height: 52,
    fontSize: 14,
    color: "#25476F",
    paddingHorizontal: 4,
  },

  // RAISED CLAY BUTTON
  button: {
    backgroundColor: "#315F91",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 7,

    borderWidth: 1,
    borderColor: "#6E94BD",

    elevation: 7,
    shadowColor: "#163D67",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: {
      width: 4,
      height: 5,
    },
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  // SIGNUP
  link: {
    color: "#58718D",
    textAlign: "center",
    marginTop: 23,
    fontSize: 13,
  },

  linkBold: {
    color: "#245F9B",
    fontWeight: "900",
  },

  // FOOTER
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#FFFFFF",
    marginTop: 22,
    fontWeight: "600",
  },
});
