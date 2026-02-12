import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

/* ---------------- COLORS ---------------- */
const colors = {
    primary: "#10B981",
    primaryDark: "#059669",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    border: "rgba(16, 185, 129, 0.2)",
};

/* ---------------- CLOUDINARY CONFIG ---------------- */
const CLOUD_NAME = "dwpod6cgm";
const UPLOAD_PRESET = "rentals_upload";

/* ---------------- SCREEN ---------------- */
export default function AddRental() {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    /* -------- Pick image from gallery -------- */
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    /* -------- Upload to Cloudinary -------- */
    const uploadToCloudinary = async () => {
        const data = new FormData();

        data.append("file", {
            uri: image.uri,
            type: "image/jpeg",
            name: "rental.jpg",
        } as any);

        data.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );

        const result = await res.json();
        return result.secure_url;
    };

    /* -------- Submit Rental -------- */
    const handlePostRental = async () => {
        if (!name || !location || !price || !image) {
            Alert.alert("Please fill all fields and upload image");
            return;
        }

        if (!auth.currentUser) {
            Alert.alert("Login required");
            return;
        }

        try {
            setLoading(true);

            // 1. Upload image
            const imageUrl = await uploadToCloudinary();

            // 2. Save data in Firestore
            await addDoc(collection(db, "rentals"), {
                name,
                location,
                pricePerHour: Number(price),
                imageUrl,
                ownerId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
            });

            Alert.alert("Success", "Equipment posted for rent");
            router.replace("/rent");
        } catch (err) {
            console.error(err);
            Alert.alert("Error posting rental");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post Rental</Text>
                <View style={{ width: 22 }} />
            </View>

            {/* Form */}
            <View style={styles.form}>
                <TextInput
                    placeholder="Equipment Name"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    placeholder="Location"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                />

                <TextInput
                    placeholder="Price per hour (₹)"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />

                {/* Image Picker */}
                <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    ) : (
                        <Text style={styles.imageText}>Upload Image</Text>
                    )}
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity onPress={handlePostRental} disabled={loading}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.postBtn}
                    >
                        <Text style={styles.postBtnText}>
                            {loading ? "Posting..." : "Post Rental"}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => router.replace("/rent")}
                >
                    <Ionicons name="leaf-outline" size={22} color={colors.textMuted} />
                    <Text style={styles.navText}>Rent</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBtnActive}>
                    <View style={styles.navActiveIndicator}>
                        <Ionicons name="add" size={22} color="#fff" />
                    </View>
                    <Text style={styles.navTextActive}>Post</Text>
                </TouchableOpacity>



                <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => router.replace("/profile")}
                >
                    <Ionicons
                        name="person-outline"
                        size={22}
                        color={colors.textMuted}
                    />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        color: colors.text,
        fontSize: 24,
        fontWeight: "800",
        marginLeft: 16,
        letterSpacing: 0.5,
    },
    form: {
        padding: 24,
        paddingBottom: 120, // Space for floating nav
    },
    input: {
        backgroundColor: colors.surface,
        color: colors.text,
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    imageBox: {
        height: 180,
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    imageText: {
        color: colors.textMuted,
        marginTop: 12,
        fontWeight: "500",
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        borderRadius: 22,
    },
    postBtn: {
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    postBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 1,
    },
    bottomNav: {
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(31, 41, 55, 0.95)",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    navBtn: {
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.6,
    },
    navBtnActive: {
        alignItems: "center",
        justifyContent: "center",
    },
    navActiveIndicator: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        padding: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    navText: { display: 'none' },
    navTextActive: { display: 'none' },
});
