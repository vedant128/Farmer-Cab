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

import { useState } from "react";

export default function LoginScreen() {
  const [step, setStep] = useState(0); // 0: Phone, 1: OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const handleGetOtp = () => {
    if (phoneNumber.length >= 10) {
      setStep(1);
    } else {
      // Simple validation alert or toast (mock)
      console.log("Invalid Phone Number");
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      // Mock verification success
      router.replace("/profile");
    } else {
      console.log("Invalid OTP");
    }
  };

  const handleBackToPhone = () => {
    setStep(0);
    setOtp("");
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
        <Text style={styles.welcomeText}>
          {step === 0 ? "Welcome Back" : "Verify OTP"}
        </Text>

        {/* Login Form */}
        <View style={styles.formContainer}>

          {step === 0 ? (
            /* Step 0: Phone Number Input */
            <View>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                  placeholder="Mobile Number"
                  placeholderTextColor="#666"
                  style={styles.input}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity onPress={handleGetOtp} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#4CAF50", "#388E3C"]}
                  style={styles.loginBtn}
                >
                  <Text style={styles.loginBtnText}>Get OTP</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            /* Step 1: OTP Input */
            <View>
              <Text style={styles.otpSentText}>
                OTP sent to +91 {phoneNumber}
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter 4-digit OTP"
                  placeholderTextColor="#666"
                  style={styles.input}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={4}
                />
              </View>

              <TouchableOpacity onPress={handleVerifyOtp} activeOpacity={0.8}>
                <LinearGradient
                  colors={["#4CAF50", "#388E3C"]}
                  style={styles.loginBtn}
                >
                  <Text style={styles.loginBtnText}>Verify & Login</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.otpActions}>
                <TouchableOpacity onPress={handleBackToPhone}>
                  <Text style={styles.otpActionText}>Change Number</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.otpActionText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>

        {/* Register Link (Only on step 0 optionally, or keep it always) */}
        {step === 0 && (
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        )}
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
  otpSentText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 5
  },
  otpActionText: {
    color: "#4CAF50",
    fontSize: 14,
  }
});
