
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { registerUser } from "../../services/authService";

export default function Signup() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    if (!role) {
      Alert.alert(
        "Account Type Required",
        "Please select Boarder, Dorm Manager, or Owner."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Your passwords do not match.");
      return;
    }

    try {
  setLoading(true);

  await registerUser(
    fullName.trim(),
    email.trim(),
    password,
    role as "Boarder" | "Caretaker" | "Owner"
  );

  // Navigate directly according to the selected role
 if (role === "Boarder") {
  router.replace("/boarder-dashboard" as any);
} else if (role === "Caretaker") {
  router.replace("/caretaker-dashboard" as any);
} else if (role === "Owner") {
  router.replace("/owner-dashboard" as any);
}

} catch (error: any) {
  console.log("SIGNUP ERROR:", error);
  console.log("ERROR CODE:", error.code);
  console.log("ERROR MESSAGE:", error.message);

  let message = error.message || "Something went wrong.";

  if (error.code === "auth/email-already-in-use") {
    message = "This email is already registered. Please log in.";
  } else if (error.code === "auth/invalid-email") {
    message = "Please enter a valid email address.";
  } else if (error.code === "auth/weak-password") {
    message = "Password must be at least 6 characters.";
  } else if (error.code === "auth/network-request-failed") {
    message = "Please check your internet connection.";
  }

  Alert.alert("Registration Failed", message);
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

          {/* SIGNUP CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.subtitle}>
              Join the SLAYA community
            </Text>

            {/* ACCOUNT TYPES */}
            <Text style={styles.roleLabel}>SELECT YOUR ROLE</Text>

            <View style={styles.rolesContainer}>
              {[
                { name: "Boarder", icon: "crown" },
                { name: "Caretaker", icon: "account-outline" },
                { name: "Owner", icon: "cog-outline" },
              ].map((item) => {
                const isSelected = role === item.name;

                return (
                  <TouchableOpacity
                    key={item.name}
                    activeOpacity={0.85}
                    onPress={() => setRole(item.name)}
                    style={[
                      styles.role,
                      isSelected && styles.selected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={27}
                      color={isSelected ? "#FFFFFF" : "#315B86"}
                      style={{ marginBottom: 8 }}
                    />

                    <Text
                      style={
                        isSelected
                          ? styles.selectedRoleText
                          : styles.roleText
                      }
                    >
                      {item.name === "Caretaker"
                        ? "Caretaker"
                        : item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* FULL NAME */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#54718F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#8794A8"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* EMAIL */}
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
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#54718F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Create your password"
                placeholderTextColor="#8794A8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={21}
                  color="#426487"
                />
              </TouchableOpacity>
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#54718F"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#8794A8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={21}
                  color="#426487"
                />
              </TouchableOpacity>
            </View>

            {/* CREATE ACCOUNT BUTTON */}
            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.disabledButton,
              ]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>
                    CREATE ACCOUNT
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginBold}>Log in</Text>
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
    paddingHorizontal: 18,
    paddingVertical: 25,
  },

  // HEADER
  header: {
    alignItems: "center",
    marginBottom: 22,
  },

  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#E5EFFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F8FBFF",
    elevation: 7,
    shadowColor: "#6685A8",
    shadowOpacity: 0.28,
    shadowRadius: 9,
    shadowOffset: { width: -4, height: -4 },
  },

  logo: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 3,
    color: "#123D70",
    marginTop: 9,
  },

  system: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#244B78",
    marginTop: 3,
  },

  tagline: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#496C93",
    marginTop: 7,
  },

  headerLine: {
    width: 100,
    height: 5,
    backgroundColor: "#9DB9D9",
    borderRadius: 10,
    marginTop: 12,
  },

  // CLAY CARD
  card: {
    backgroundColor: "#E5EFFB",
    padding: 22,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 12,
    shadowColor: "#6B8DB3",
    shadowOffset: { width: 7, height: 9 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#173C68",
  },

  subtitle: {
    fontSize: 14,
    color: "#75869B",
    marginTop: 5,
    marginBottom: 23,
  },

  // ROLE SELECTION
  roleLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#557392",
    marginBottom: 12,
    marginLeft: 4,
  },

  rolesContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },

  role: {
    flex: 1,
    minHeight: 105,
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
    backgroundColor: "#E5EFFB",
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#F8FBFF",
    elevation: 5,
    shadowColor: "#8DA9C9",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 3, height: 4 },
  },

  selected: {
    backgroundColor: "#315F91",
    borderColor: "#6E94BD",
    elevation: 7,
    shadowColor: "#163D67",
    shadowOpacity: 0.25,
    shadowRadius: 7,
    shadowOffset: { width: 3, height: 4 },
  },

  roleText: {
    fontSize: 11,
    color: "#365575",
    textAlign: "center",
    fontWeight: "700",
  },

  selectedRoleText: {
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
  },

  // FIELD LABELS
  fieldLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#557392",
    marginBottom: 8,
    marginLeft: 5,
  },

  // CLAY INPUTS
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9E6F5",
    borderWidth: 1,
    borderColor: "#D0DFF0",
    borderRadius: 17,
    paddingHorizontal: 14,
    minHeight: 53,
    marginBottom: 17,
    elevation: 3,
    shadowColor: "#A1B8D3",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: -2, height: -2 },
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 13,
    color: "#243F60",
    paddingVertical: 10,
  },

  // CLAY BUTTON
  button: {
    backgroundColor: "#315F91",
    padding: 17,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#6E94BD",
    elevation: 7,
    shadowColor: "#163D67",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 4, height: 5 },
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // LOGIN LINK
  loginText: {
    color: "#58718D",
    textAlign: "center",
    marginTop: 22,
    fontSize: 12,
  },

  loginBold: {
    color: "#245F9B",
    fontWeight: "900",
  },

  // FOOTER
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#FFFFFF",
    marginTop: 18,
    fontWeight: "600",
  },
});

