import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

const colors = {
    primary: "#10B981",
    primaryDark: "#059669",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    border: "rgba(16, 185, 129, 0.2)",
    danger: "#EF4444",
};

export default function MyListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "rentals"),
            where("ownerId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })).sort((a: any, b: any) => {
                // Sort by createdAt descending
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateB - dateA;
            });
            setListings(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching listings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Delete Listing",
            "Are you sure you want to remove this listing? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "rentals", id));
                        } catch (error) {
                            console.error("Error deleting listing:", error);
                            Alert.alert("Error", "Could not delete listing");
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Listings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                {listings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="tractor" size={64} color={colors.surface} />
                        <Text style={styles.emptyText}>No listings found</Text>
                        <Text style={styles.emptySubtext}>You haven't posted any equipment for rent yet.</Text>
                        <TouchableOpacity
                            style={styles.postBtn}
                            onPress={() => router.replace("/add-rental")}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primaryDark]}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.postBtnText}>Post Rental</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    listings.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <View style={styles.priceBadge}>
                                        <Text style={styles.priceText}>₹{item.pricePerHour}/hr</Text>
                                    </View>
                                </View>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                                    <Text style={styles.locationText}>{item.location}</Text>
                                </View>
                                <View style={styles.statsRow}>
                                    <View style={styles.stat}>
                                        <Ionicons name="eye-outline" size={16} color={colors.textMuted} />
                                        <Text style={styles.statText}>0 views</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => handleDelete(item.id)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                                        <Text style={styles.deleteText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    backBtn: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
    },
    listContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    cardImage: {
        width: "100%",
        height: 150,
        resizeMode: "cover",
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        flex: 1,
        marginRight: 10,
    },
    priceBadge: {
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.2)",
    },
    priceText: {
        color: colors.primary,
        fontWeight: "700",
        fontSize: 14,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 4,
    },
    locationText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
        paddingTop: 12,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statText: {
        color: colors.textMuted,
        fontSize: 13,
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.2)",
    },
    deleteText: {
        color: colors.danger,
        fontSize: 13,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
    },
    emptyText: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "700",
        marginTop: 16,
    },
    emptySubtext: {
        color: colors.textMuted,
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
        marginBottom: 24,
    },
    postBtn: {
        width: "60%",
    },
    gradientBtn: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    postBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
