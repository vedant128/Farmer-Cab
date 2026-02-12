import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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
    success: "#10B981",
    danger: "#EF4444",
};

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch Balance
            const userRef = doc(db, "users", user.uid);
            getDoc(userRef).then((docSnap) => {
                if (docSnap.exists()) {
                    setBalance(docSnap.data().balance || 0);
                }
            });

            // Fetch Transactions
            const q = query(
                collection(db, "transactions"),
                where("userId", "==", user.uid)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })).sort((a: any, b: any) => {
                    // Sort client-side by date descending
                    const dateA = a.date?.toDate ? a.date.toDate() : new Date(0);
                    const dateB = b.date?.toDate ? b.date.toDate() : new Date(0);
                    return dateB - dateA;
                });
                setTransactions(data);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching transactions:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        };

        fetchUserData();
    }, []);

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
                <Text style={styles.headerTitle}>Transaction History</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Balance Card */}
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.balanceCard}
                >
                    <View>
                        <Text style={styles.balanceLabel}>Current Balance</Text>
                        <Text style={styles.balanceValue}>₹{balance.toLocaleString()}</Text>
                    </View>
                    <View style={styles.walletIcon}>
                        <Ionicons name="wallet" size={32} color="#fff" />
                    </View>
                </LinearGradient>

                <Text style={styles.sectionTitle}>Recent Transactions</Text>

                {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="history" size={64} color={colors.surface} />
                        <Text style={styles.emptyText}>No transactions yet</Text>
                        <Text style={styles.emptySubtext}>Your recent payments and deposits will appear here.</Text>
                    </View>
                ) : (
                    transactions.map((item) => (
                        <View key={item.id} style={styles.transactionItem}>
                            <View style={styles.transactionLeft}>
                                <View style={[
                                    styles.iconWrapper,
                                    { backgroundColor: item.type === 'credit' ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }
                                ]}>
                                    <Ionicons
                                        name={item.type === 'credit' ? "arrow-down" : "arrow-up"}
                                        size={20}
                                        color={item.type === 'credit' ? colors.success : colors.danger}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.transactionDesc}>{item.description}</Text>
                                    <Text style={styles.transactionDate}>
                                        {item.date?.toDate ? item.date.toDate().toLocaleDateString() : "Just now"}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                { color: item.type === 'credit' ? colors.success : colors.danger }
                            ]}>
                                {item.type === 'credit' ? "+" : "-"}₹{item.amount.toLocaleString()}
                            </Text>
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
    scrollContent: {
        padding: 20,
    },
    balanceCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    balanceLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
        marginBottom: 4,
        fontWeight: "600",
    },
    balanceValue: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "800",
    },
    walletIcon: {
        backgroundColor: "rgba(255,255,255,0.2)",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    transactionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    transactionDesc: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    transactionDate: {
        color: colors.textMuted,
        fontSize: 12,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: "700",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
    },
    emptyText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
        marginTop: 16,
    },
    emptySubtext: {
        color: colors.textMuted,
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },
});
