import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Elegant color palette
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
    const equipmentName = (params.name as string) || "John Deere 5050D";
    const equipmentLocation = (params.location as string) || "Lumeqa, Maharashtra";
    const hourlyRate = parseInt(params.hourlyRate as string) || 500;
    const dailyRate = hourlyRate * 8; // Daily rate is 8x hourly

    const [rentalType, setRentalType] = useState<RentalType>("hourly");
    const [hours, setHours] = useState(2);
    const [days, setDays] = useState(1);

    const quantity = rentalType === "hourly" ? hours : days;
    const rate = rentalType === "hourly" ? hourlyRate : dailyRate;
    const subtotal = quantity * rate;
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + serviceFee;

    const incrementQuantity = () => {
        if (rentalType === "hourly" && hours < 24) setHours(hours + 1);
        if (rentalType === "daily" && days < 30) setDays(days + 1);
    };

    const decrementQuantity = () => {
        if (rentalType === "hourly" && hours > 1) setHours(hours - 1);
        if (rentalType === "daily" && days > 1) setDays(days - 1);
    };

    const handlePayment = () => {
        // Navigate to payment success with all booking details
        router.push({
            pathname: "/payment-success",
            params: {
                amount: total.toString(),
                equipment: equipmentName,
                location: equipmentLocation,
                rentalType: rentalType,
                quantity: quantity.toString(),
                rate: rate.toString(),
            },
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Book Equipment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Equipment Card */}
                <View style={styles.equipmentCard}>
                    <Image
                        source={require("../assets/images/tractor_bg.png")}
                        style={styles.equipmentImage}
                    />
                    <View style={styles.equipmentInfo}>
                        <Text style={styles.equipmentName}>{equipmentName}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                            <Text style={styles.equipmentLocation}>{equipmentLocation}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={colors.accent} />
                            <Text style={styles.ratingText}>4.8</Text>
                            <Text style={styles.reviewsText}>(23 reviews)</Text>
                        </View>
                    </View>
                </View>

                {/* Rental Type Selection */}
                <Text style={styles.sectionTitle}>Select Rental Type</Text>
                <View style={styles.rentalTypeRow}>
                    <TouchableOpacity
                        style={[
                            styles.rentalTypeCard,
                            rentalType === "hourly" && styles.rentalTypeActive,
                        ]}
                        onPress={() => setRentalType("hourly")}
                        activeOpacity={0.8}
                    >
                        <View style={styles.rentalTypeHeader}>
                            <Ionicons
                                name="time-outline"
                                size={24}
                                color={rentalType === "hourly" ? colors.primary : colors.textMuted}
                            />
                            {rentalType === "hourly" && (
                                <View style={styles.checkBadge}>
                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                </View>
                            )}
                        </View>
                        <Text style={[styles.rentalTypeLabel, rentalType === "hourly" && styles.rentalTypeLabelActive]}>
                            Hourly
                        </Text>
                        <Text style={styles.rentalTypePrice}>₹{hourlyRate}/hr</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.rentalTypeCard,
                            rentalType === "daily" && styles.rentalTypeActive,
                        ]}
                        onPress={() => setRentalType("daily")}
                        activeOpacity={0.8}
                    >
                        <View style={styles.rentalTypeHeader}>
                            <Ionicons
                                name="calendar-outline"
                                size={24}
                                color={rentalType === "daily" ? colors.primary : colors.textMuted}
                            />
                            {rentalType === "daily" && (
                                <View style={styles.checkBadge}>
                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                </View>
                            )}
                        </View>
                        <Text style={[styles.rentalTypeLabel, rentalType === "daily" && styles.rentalTypeLabelActive]}>
                            Daily
                        </Text>
                        <Text style={styles.rentalTypePrice}>₹{dailyRate}/day</Text>
                        <Text style={styles.savingsText}>Save 20%</Text>
                    </TouchableOpacity>
                </View>

                {/* Duration Selector */}
                <Text style={styles.sectionTitle}>
                    {rentalType === "hourly" ? "Select Hours" : "Select Days"}
                </Text>
                <View style={styles.durationCard}>
                    <TouchableOpacity style={styles.durationBtn} onPress={decrementQuantity}>
                        <Ionicons name="remove" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.durationValue}>
                        <Text style={styles.durationNumber}>{quantity}</Text>
                        <Text style={styles.durationLabel}>
                            {rentalType === "hourly" ? (quantity === 1 ? "Hour" : "Hours") : (quantity === 1 ? "Day" : "Days")}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.durationBtn} onPress={incrementQuantity}>
                        <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Price Breakdown */}
                <Text style={styles.sectionTitle}>Price Breakdown</Text>
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>
                            {rentalType === "hourly" ? `${quantity} hours × ₹${hourlyRate}` : `${quantity} days × ₹${dailyRate}`}
                        </Text>
                        <Text style={styles.priceValue}>₹{subtotal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Service Fee (5%)</Text>
                        <Text style={styles.priceValue}>₹{serviceFee.toLocaleString()}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Payment Methods */}
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentCard}>
                    <TouchableOpacity style={styles.paymentOption}>
                        <View style={styles.paymentLeft}>
                            <View style={styles.paymentIconWrapper}>
                                <Ionicons name="wallet" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.paymentLabel}>Wallet Balance</Text>
                                <Text style={styles.paymentBalance}>₹5,200 available</Text>
                            </View>
                        </View>
                        <View style={styles.radioSelected}>
                            <View style={styles.radioInner} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Payment Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomPrice}>
                    <Text style={styles.bottomTotalLabel}>Total</Text>
                    <Text style={styles.bottomTotalValue}>₹{total.toLocaleString()}</Text>
                </View>
                <TouchableOpacity onPress={handlePayment} activeOpacity={0.9}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.payBtn}
                    >
                        <Ionicons name="shield-checkmark" size={18} color="#fff" />
                        <Text style={styles.payBtnText}>Confirm & Pay</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "600",
    },
    equipmentCard: {
        flexDirection: "row",
        backgroundColor: colors.surface,
        borderRadius: 18,
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    equipmentImage: {
        width: 90,
        height: 90,
        borderRadius: 14,
    },
    equipmentInfo: {
        flex: 1,
        marginLeft: 14,
        justifyContent: "center",
    },
    equipmentName: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 6,
    },
    equipmentLocation: {
        color: colors.textMuted,
        fontSize: 13,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        color: colors.accent,
        fontWeight: "600",
        fontSize: 13,
    },
    reviewsText: {
        color: colors.textMuted,
        fontSize: 12,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "600",
        marginHorizontal: 20,
        marginBottom: 12,
    },
    rentalTypeRow: {
        flexDirection: "row",
        marginHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    rentalTypeCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    rentalTypeActive: {
        borderColor: colors.primary,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
    },
    rentalTypeHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    checkBadge: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    rentalTypeLabel: {
        color: colors.textMuted,
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 4,
    },
    rentalTypeLabelActive: {
        color: colors.text,
    },
    rentalTypePrice: {
        color: colors.text,
        fontSize: 17,
        fontWeight: "700",
    },
    savingsText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: "600",
        marginTop: 4,
    },
    durationCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    durationBtn: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: colors.surfaceLight || "#374151",
        justifyContent: "center",
        alignItems: "center",
    },
    durationValue: {
        alignItems: "center",
    },
    durationNumber: {
        color: colors.text,
        fontSize: 36,
        fontWeight: "700",
    },
    durationLabel: {
        color: colors.textMuted,
        fontSize: 14,
    },
    priceCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    priceLabel: {
        color: colors.textMuted,
        fontSize: 14,
    },
    priceValue: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: 12,
    },
    totalLabel: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "600",
    },
    totalValue: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: "700",
    },
    paymentCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    paymentOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    paymentLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    paymentIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    paymentLabel: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "500",
    },
    paymentBalance: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    radioSelected: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    bottomPrice: {
        flex: 1,
    },
    bottomTotalLabel: {
        color: colors.textMuted,
        fontSize: 12,
        marginBottom: 2,
    },
    bottomTotalValue: {
        color: colors.text,
        fontSize: 22,
        fontWeight: "700",
    },
    payBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 28,
        gap: 8,
    },
    payBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
