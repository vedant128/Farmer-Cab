import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AddressEditModalProps {
    visible: boolean;
    onClose: () => void;
    currentAddress: string;
    onSave: (newAddress: string) => void;
}

export default function AddressEditModal({
    visible,
    onClose,
    currentAddress,
    onSave,
}: AddressEditModalProps) {
    const [address, setAddress] = useState(currentAddress);

    useEffect(() => {
        setAddress(currentAddress);
    }, [currentAddress]);

    const handleSave = () => {
        if (address.trim()) {
            onSave(address);
            onClose();
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Location</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Enter your current location</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color="#10B981"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={setAddress}
                            value={address}
                            placeholder="e.g. Pune, Maharashtra"
                            placeholderTextColor="#6B7280"
                            autoFocus={true}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSave} style={{ flex: 1 }}>
                            <LinearGradient
                                colors={["#10B981", "#059669"]}
                                style={styles.saveBtn}
                            >
                                <Text style={styles.saveBtnText}>Save Location</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        width: "90%",
        backgroundColor: "#1F2937",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.2)",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#F9FAFB",
    },
    label: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#374151",
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.4)",
    },
    inputIcon: {
        paddingLeft: 12,
        paddingRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 12,
        color: "#F9FAFB",
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#4B5563",
    },
    cancelBtnText: {
        color: "#D1D5DB",
        fontWeight: "600",
        fontSize: 14,
    },
    saveBtn: {
        paddingVertical: 12,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    saveBtnText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
});
