import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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
    onSave: (newAddress: string, coords?: { latitude: number; longitude: number }) => void;
}

export default function AddressEditModal({
    visible,
    onClose,
    currentAddress,
    onSave,
}: AddressEditModalProps) {
    const [address, setAddress] = useState(currentAddress);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setAddress(currentAddress);
    }, [currentAddress]);

    const handleUseCurrentLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permission to access location was denied");
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Reverse geocode
            let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                const formattedAddress = `${place.city || place.subregion}, ${place.region}`;
                setAddress(formattedAddress);
                onSave(formattedAddress, { latitude, longitude });
                onClose();
            }
        } catch (error) {
            console.error("Error getting location:", error);
            alert("Could not fetch location");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!address.trim()) return;

        setLoading(true);
        try {
            // Forward geocode to get coordinates for the typed address
            const geocoded = await Location.geocodeAsync(address);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                onSave(address, { latitude, longitude });
            } else {
                // If geocoding fails, just save the address string (fallback)
                onSave(address);
            }
            onClose();
        } catch (error) {
            console.error("Error geocoding address:", error);
            onSave(address);
            onClose();
        } finally {
            setLoading(false);
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

                    <TouchableOpacity
                        style={styles.currentLocationBtn}
                        onPress={handleUseCurrentLocation}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                            <>
                                <Ionicons name="locate" size={18} color="#10B981" />
                                <Text style={styles.currentLocationText}>Use Current Location</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSave} style={{ flex: 1 }} disabled={loading}>
                            <LinearGradient
                                colors={["#10B981", "#059669"]}
                                style={styles.saveBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Location</Text>
                                )}
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
        marginBottom: 16,
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
    currentLocationBtn: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        marginBottom: 24,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.3)",
    },
    currentLocationText: {
        color: "#10B981",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
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
