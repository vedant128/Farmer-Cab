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
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
    },
    form: {
        paddingHorizontal: 20,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 14,
        color: colors.text,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    imageBox: {
        height: 150,
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    imageText: {
        color: colors.textMuted,
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        borderRadius: 14,
    },
    postBtn: {
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: "center",
    },
    postBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: colors.surface,
        paddingVertical: 12,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    navBtn: {
        alignItems: "center",
    },
    navBtnActive: {
        alignItems: "center",
    },
    navActiveIndicator: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 8,
        marginBottom: 2,
    },
    navText: {
        color: colors.textMuted,
        fontSize: 12,
    },
    navTextActive: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
});
