import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { ConfirmationResult, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";


export default function RegisterScreen() {

    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

    const recaptchaVerifier = useRef<any>(null);

    const handleSendOtp = async () => {
        if (phone.length !== 10) {
            Alert.alert("Error", "Enter valid phone number");
            return;
        }

        try {
            setLoading(true);
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                "+91" + phone,
                recaptchaVerifier.current
            );

            setConfirmation(confirmationResult);
            setShowOtp(true);
            setOtpSent(true);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!confirmation || otp.length < 6) {
            Alert.alert("Error", "Enter valid OTP");
            return;
        }

        try {
            setLoading(true);
            console.log("Verifying OTP...");
            const result = await confirmation.confirm(otp);
            const uid = result.user.uid;
            console.log("OTP Verified. UID:", uid);

            console.log("Saving user to Firestore...");
            await setDoc(doc(db, "users", uid),
                {
                    phone,
                    createdAt: new Date()
                },
                { merge: true }
            );
            console.log("User saved. Navigating to /rent...");

            router.push("/rent");
        } catch (error: any) {
            console.error("Verification Error:", error);
            Alert.alert("Error", error.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require("../assets/images/tractor_bg.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
            />

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

                {/* Title */}
                <Text style={styles.title}>Get Started</Text>
                <Text style={styles.subtitle}>Enter mobile number to get started</Text>

                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Phone Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput
                            placeholder="Enter mobile number"
                            placeholderTextColor="#666"
                            style={styles.input}
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phone}
                            onChangeText={setPhone}
                            editable={!otpSent}
                        />
                    </View>

                    {/* Send OTP Button */}
                    {!showOtp && (
                        <TouchableOpacity onPress={handleSendOtp} activeOpacity={0.8} disabled={loading}>
                            <LinearGradient
                                colors={phone.length >= 10 ? ["#4CAF50", "#388E3C"] : ["#555", "#444"]}
                                style={styles.btn}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Send OTP</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* OTP Section */}
                    {showOtp && (
                        <>
                            <View style={styles.otpSentContainer}>
                                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                <Text style={styles.otpSentText}>OTP sent to +91 {phone}</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="keypad-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Enter OTP"
                                    placeholderTextColor="#666"
                                    style={styles.input}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                            </View>

                            <TouchableOpacity onPress={handleVerifyOtp} activeOpacity={0.8} disabled={loading}>
                                <LinearGradient
                                    colors={otp.length >= 4 ? ["#4CAF50", "#388E3C"] : ["#555", "#444"]}
                                    style={styles.btn}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.btnText}>Verify & Continue</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendBtn} onPress={() => { setShowOtp(false); setOtpSent(false); setOtp(""); }}>
                                <Text style={styles.resendText}>Change Number</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        marginBottom: 30,
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
    countryCode: {
        paddingLeft: 15,
        paddingRight: 10,
        fontSize: 16,
        color: "#4CAF50",
        fontWeight: "600",
    },
    inputIcon: {
        paddingLeft: 15,
        paddingRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingRight: 15,
        fontSize: 16,
        color: "#fff",
    },
    btn: {
        marginTop: 5,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    otpSentContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    otpSentText: {
        color: "#4CAF50",
        fontSize: 13,
        marginLeft: 6,
    },
    resendBtn: {
        alignItems: "center",
        marginTop: 20,
    },
    resendText: {
        color: "#FFB300",
        fontSize: 14,
    },
    loginContainer: {
        flexDirection: "row",
        marginTop: 40,
    },
    loginText: {
        color: "#777",
        fontSize: 14,
    },
    loginLink: {
        color: "#4CAF50",
        fontWeight: "600",
        fontSize: 14,
    },
});
