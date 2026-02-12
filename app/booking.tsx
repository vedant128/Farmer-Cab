import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

// Premium Dark Theme Palette
const colors = {
    primary: "#10B981",
    primaryLight: "#34D399",
    primaryDark: "#059669",
    accent: "#F59E0B",
    background: "#111827",
    surface: "#1F2937",
    surfaceLight: "#374151",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    border: "rgba(16, 185, 129, 0.2)",
};

type RentalType = "hourly" | "daily";

export default function BookingPage() {
    const params = useLocalSearchParams();

    // Dynamic Params
    const equipmentId = (params.id as string) || "unknown";
    const equipmentName = (params.name as string) || "Unknown Equipment";
    const equipmentLocation = (params.location as string) || "Location not available";
    const equipmentImage = (params.imageUrl as string) || "https://via.placeholder.com/300";
    const ownerId = (params.ownerId as string) || "";

    const hourlyRate = parseInt(params.price as string) || 0;
    const dailyRate = hourlyRate * 8; // Assumed daily rate (8 working hours)

    const [rentalType, setRentalType] = useState<RentalType>("hourly");
    const [hours, setHours] = useState(2);
    const [days, setDays] = useState(1);
    const [balance, setBalance] = useState(0);
    const [owner, setOwner] = useState<{ name: string; photoURL: string } | null>(null);

    useEffect(() => {
        const fetchOwner = async () => {
            if (!ownerId) return;
            try {
                const userRef = doc(db, "users", ownerId);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setOwner({
                        name: data.name || "Unknown User",
                        photoURL: data.photoURL || null,
                    });
                }
            } catch (error) {
                console.log("Error fetching owner:", error);
            }
        };
        fetchOwner();
    }, [ownerId]);

    useEffect(() => {
        const fetchBalance = async () => {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setBalance(docSnap.data().balance || 0);
                }
            }
        };
        fetchBalance();
    }, []);

    const quantity = rentalType === "hourly" ? hours : days;
    const rate = rentalType === "hourly" ? hourlyRate : dailyRate;
    const subtotal = quantity * rate;
    const serviceFee = 0; // 5% fee
    const total = subtotal + serviceFee;

    const incrementQuantity = () => {
        if (rentalType === "hourly" && hours < 24) setHours(hours + 1);
        if (rentalType === "daily" && days < 30) setDays(days + 1);
    };

    const decrementQuantity = () => {
        if (rentalType === "hourly" && hours > 1) setHours(hours - 1);
        if (rentalType === "daily" && days > 1) setDays(days - 1);
    };

    const handlePayment = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "You must be logged in to book.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);

            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw "User data not found";
                }

                const currentBalance = userDoc.data().balance || 0;
                if (currentBalance < total) {
                    throw "Insufficient Balance";
                }

                // Deduct balance
                transaction.update(userRef, { balance: currentBalance - total });

                // Note: In a real app, we would also create a 'bookings' document here
                // transaction.set(doc(collection(db, 'bookings')), { ... })
            });

            // Record transaction
            await addDoc(collection(db, "transactions"), {
                userId: user.uid,
                type: "debit",
                amount: total,
                description: `Rental: ${equipmentName}`,
                date: serverTimestamp(),
            });

            // Navigate to payment success
            router.push({
                pathname: "/payment-success",
                params: {
                    amount: total.toString(),
                    equipment: equipmentName,
                    location: equipmentLocation,
                    rentalType: rentalType,
                    quantity: quantity.toString(),
                    rate: rate.toString(),
                    imageUrl: equipmentImage, // Pass image for success screen too if needed
                },
            });
        } catch (e) {
            if (e === "Insufficient Balance") {
                Alert.alert("Insufficient Balance", "Please add money to your wallet.");
            } else {
                console.error(e);
                Alert.alert("Error", "Booking failed. Please try again.");
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirm Booking</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>

                {/* Hero Image Card */}
                <View style={styles.heroCard}>
                    <Image source={{ uri: equipmentImage }} style={styles.heroImage} />
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.8)"]}
                        style={styles.heroOverlay}
                    >
                        <Text style={styles.heroTitle}>{equipmentName}</Text>
                        <View style={styles.heroLocationRow}>
                            <Ionicons name="location" size={14} color={colors.primary} />
                            <Text style={styles.heroLocation}>{equipmentLocation}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Owner Info */}
                {owner && (
                    <View style={styles.ownerCard}>
                        <Image
                            source={owner.photoURL ? { uri: owner.photoURL } : require("../assets/images/human.png")}
                            style={styles.ownerAvatar}
                        />
                        <View>
                            <Text style={styles.ownerLabel}>Listed by</Text>
                            <Text style={styles.ownerName}>{owner.name}</Text>
                        </View>
                    </View>
                )}

                {/* Rental Type Tabs */}
                <Text style={styles.sectionTitle}>Rental Duration</Text>
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, rentalType === "hourly" && styles.activeTab]}
                        onPress={() => setRentalType("hourly")}
                    >
                        <Text style={[styles.tabText, rentalType === "hourly" && styles.activeTabText]}>Hourly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, rentalType === "daily" && styles.activeTab]}
                        onPress={() => setRentalType("daily")}
                    >
                        <Text style={[styles.tabText, rentalType === "daily" && styles.activeTabText]}>Daily (Save 20%)</Text>
                    </TouchableOpacity>
                </View>

                {/* Quarter/Time Selector */}
                <View style={styles.durationSelector}>
                    <TouchableOpacity style={styles.circleBtn} onPress={decrementQuantity}>
                        <Ionicons name="remove" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.durationDisplay}>
                        <Text style={styles.durationValue}>{quantity}</Text>
                        <Text style={styles.durationUnit}>
                            {rentalType === "hourly" ? (quantity === 1 ? "Hour" : "Hours") : (quantity === 1 ? "Day" : "Days")}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.circleBtn} onPress={incrementQuantity}>
                        <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Cost Breakdown */}
                <View style={styles.receiptCard}>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Rate</Text>
                        <Text style={styles.receiptValue}>₹{rate}/{rentalType === "hourly" ? "hr" : "day"}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Duration</Text>
                        <Text style={styles.receiptValue}>{quantity} {rentalType === "hourly" ? "hrs" : "days"}</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>Service Fee</Text>
                        <Text style={styles.receiptValue}>₹{serviceFee}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.receiptRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.paymentMethod}>
                    <View style={styles.paymentIcon}>
                        <Ionicons name="wallet" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.paymentMethodTitle}>Wallet Balance</Text>
                        <Text style={styles.paymentMethodSubtitle}>Available: ₹{balance.toLocaleString()}</Text>
                    </View>
                    {balance >= total ? (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    ) : (
                        <Text style={styles.lowBalance}>Low Balance</Text>
                    )}
                </View>

            </ScrollView>

            {/* Bottom Floating Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.bottomLabel}>Total to pay</Text>
                    <Text style={styles.bottomPrice}>₹{total.toLocaleString()}</Text>
                </View>
                <TouchableOpacity onPress={handlePayment}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.payBtn}
                    >
                        <Text style={styles.payBtnText}>Confirm Booking</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        letterSpacing: 0.5,
    },
    heroCard: {
        height: 280,
        marginHorizontal: 20,
        borderRadius: 32,
        overflow: "hidden",
        marginBottom: 32,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
    heroOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 140,
        justifyContent: "flex-end",
        padding: 24,
    },
    heroTitle: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    heroLocationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    heroLocation: { color: "#ddd", fontSize: 14, fontWeight: "500" },
    ownerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        marginHorizontal: 24,
        padding: 12,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        gap: 12,
    },
    ownerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceLight,
    },
    ownerLabel: {
        color: colors.textMuted,
        fontSize: 12,
    },
    ownerName: {
        color: colors.text,
        fontWeight: "700",
        fontSize: 14,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
        marginHorizontal: 24,
        marginBottom: 16,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: colors.surface,
        marginHorizontal: 24,
        padding: 4,
        borderRadius: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 16,
    },
    activeTab: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    tabText: {
        color: colors.textMuted,
        fontWeight: "600",
        fontSize: 14,
    },
    activeTabText: {
        color: "#fff",
        fontWeight: "700",
    },
    durationSelector: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 40,
        marginBottom: 40,
    },
    circleBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    durationDisplay: { alignItems: "center" },
    durationValue: { fontSize: 42, fontWeight: "800", color: colors.text },
    durationUnit: { fontSize: 14, color: colors.textMuted, marginTop: -4 },
    receiptCard: {
        backgroundColor: colors.surface,
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    receiptRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    receiptLabel: { color: colors.textMuted, fontSize: 15 },
    receiptValue: { color: colors.text, fontSize: 15, fontWeight: "600" },
    divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 8 },
    totalLabel: { color: colors.text, fontSize: 18, fontWeight: "700" },
    totalValue: { color: colors.primary, fontSize: 22, fontWeight: "800" },
    paymentMethod: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        marginHorizontal: 24,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 16,
    },
    paymentIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    paymentMethodTitle: { color: colors.text, fontWeight: "700", fontSize: 15 },
    paymentMethodSubtitle: { color: colors.textMuted, fontSize: 13 },
    lowBalance: { color: "#EF4444", fontWeight: "700", fontSize: 13 },
    bottomBar: {
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
        backgroundColor: "rgba(31, 41, 55, 0.95)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    bottomLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
    bottomPrice: { color: colors.text, fontSize: 20, fontWeight: "800" },
    payBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
    },
    payBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
