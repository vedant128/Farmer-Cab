import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

/* ---------- Constants ---------- */
const AVATARS = [
    // Boys
    "https://api.dicebear.com/9.x/micah/png?seed=Max&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/micah/png?seed=Alex&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/micah/png?seed=Sam&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/micah/png?seed=John&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/png?seed=Mike&backgroundColor=ffd5dc",
    // Girls
    "https://api.dicebear.com/9.x/micah/png?seed=Lisa&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/micah/png?seed=Maria&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/micah/png?seed=Sara&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/micah/png?seed=Emily&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/micah/png?seed=Jess&backgroundColor=ffd5dc",
    // Others
    "https://api.dicebear.com/9.x/micah/png?seed=Robot&backgroundColor=f0abfc",
    "https://api.dicebear.com/9.x/micah/png?seed=Alien&backgroundColor=86efac",
    "https://api.dicebear.com/9.x/micah/png?seed=Farmer&backgroundColor=fcd34d",
    "https://api.dicebear.com/9.x/micah/png?seed=Bear&backgroundColor=fda4af",
];

const colors = {
    primary: "#10B981",
    primaryDark: "#059669",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    border: "rgba(16, 185, 129, 0.2)",
};

export default function EditProfile() {
    const [name, setName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Error", "No user logged in");
                router.back();
                return;
            }

            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (snap.exists()) {
                const data = snap.data();
                setName(data.name || "");
                setSelectedAvatar(data.photoURL || strToAvatar(data.name || "User"));
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            Alert.alert("Error", "Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Validation", "Name cannot be empty");
            return;
        }

        setSaving(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                name: name.trim(),
                photoURL: selectedAvatar,
            });

            Alert.alert("Success", "Profile updated successfully!");
            router.back();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Helper Preview */}
                <View style={styles.previewSection}>
                    <Image
                        source={{ uri: selectedAvatar || AVATARS[0] }}
                        style={styles.previewAvatar}
                    />
                    <Text style={styles.previewText}>Preview of your new look</Text>
                </View>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                {/* Avatar Selection */}
                <Text style={styles.sectionTitle}>Choose an Avatar</Text>
                <View style={styles.avatarGrid}>
                    {AVATARS.map((avatarUri, index) => {
                        const isSelected = selectedAvatar === avatarUri;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedAvatar(avatarUri)}
                                style={[
                                    styles.avatarOption,
                                    isSelected && styles.avatarOptionSelected,
                                ]}
                            >
                                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                {isSelected && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Fallback helper if needed, though we primarily set from fetched data
function strToAvatar(name: string) {
    return `https://api.dicebear.com/9.x/micah/png?seed=${name}&backgroundColor=b6e3f4`;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: colors.surface,
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },

    content: { padding: 20 },

    previewSection: { alignItems: 'center', marginBottom: 30 },
    previewAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 2, borderColor: colors.primary },
    previewText: { color: colors.textMuted, fontSize: 14 },

    inputGroup: { marginBottom: 30 },
    label: { color: colors.text, marginBottom: 8, fontWeight: '600' },
    input: {
        backgroundColor: colors.surface,
        color: colors.text,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
    },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    avatarOption: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: 2,
        position: 'relative',
    },
    avatarOptionSelected: {
        borderColor: colors.primary,
    },
    avatarImage: { width: '100%', height: '100%', borderRadius: 35 },
    checkmark: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: colors.background,
        borderRadius: 10,
    },

    footer: {
        padding: 20,
        backgroundColor: colors.surface, // or transparent if preferred
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    saveBtn: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
