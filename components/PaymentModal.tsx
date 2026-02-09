import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Shared color palette
const colors = {
    primary: "#10B981",
    primaryDark: "#059669",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    border: "rgba(16, 185, 129, 0.2)",
};

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onAddMoney: (amount: number) => void;
}

export default function PaymentModal({
    visible,
    onClose,
    onAddMoney,
}: PaymentModalProps) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePayment = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

        setLoading(true);

        // Fake payment gateway delay
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);

            // Reset after showing success
            setTimeout(() => {
                onAddMoney(Number(amount));
                setSuccess(false);
                setAmount("");
                onClose();
            }, 1500);
        }, 2000);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Money to Wallet</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {success ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
                            <Text style={styles.successText}>Payment Successful!</Text>
                            <Text style={styles.successSubtext}>
                                ₹{amount} added to your wallet.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.label}>Enter Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="e.g. 500"
                                placeholderTextColor={colors.textMuted}
                                editable={!loading}
                            />

                            <View style={styles.presetContainer}>
                                {[100, 500, 1000, 2000].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        style={styles.presetBtn}
                                        onPress={() => setAmount(val.toString())}
                                        disabled={loading}
                                    >
                                        <Text style={styles.presetText}>+₹{val}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handlePayment}
                                disabled={loading || !amount}
                                style={{ opacity: loading || !amount ? 0.7 : 1 }}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primaryDark]}
                                    style={styles.payBtn}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.payBtnText}>Proceed to Pay</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
    },
    label: {
        color: colors.textMuted,
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 12,
        color: colors.text,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
    },
    presetContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 24,
        flexWrap: "wrap",
    },
    presetBtn: {
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    presetText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    payBtn: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    payBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    successContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    successText: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "700",
        marginTop: 16,
    },
    successSubtext: {
        color: colors.textMuted,
        marginTop: 8,
        fontSize: 14,
    },
});
