import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const handleLogin = () => {
    router.replace("/rent");
  };

  return (
    <ImageBackground
      source={require("../assets/images/tractor_bg.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Dark Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.9)"]}
        style={styles.overlay}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="tractor" size={28} color="#4a2c00" />
          </View>
          <Text style={styles.brandName}>Farmer Cab</Text>
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome Back</Text>

        {/* Login Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
            <TextInput
              placeholder="sanyog@gmail.com"
              placeholderTextColor="#666"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#666"
              style={styles.input}
              secureTextEntry
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
            <LinearGradient
              colors={["#4CAF50", "#388E3C"]}
              style={styles.loginBtn}
            >
              <Text style={styles.loginBtnText}>Log In</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFB300",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  brandName: {
    fontSize: 30,
    fontWeight: "700",
    color: "#4CAF50",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "300",
    color: "#aaa",
    marginBottom: 30,
    fontStyle: "italic",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(40, 40, 40, 0.9)",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 15,
    fontSize: 15,
    color: "#fff",
  },
  loginBtn: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  forgotBtn: {
    alignItems: "center",
    marginTop: 20,
  },
  forgotText: {
    color: "#777",
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 40,
  },
  registerText: {
    color: "#777",
    fontSize: 14,
  },
  registerLink: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
  },
});
