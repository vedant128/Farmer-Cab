import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const colors = {
    primary: "#10B981",
    primaryDark: "#059669",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    border: "rgba(16, 185, 129, 0.2)",
};

export default function PaymentSuccessPage() {
    const params = useLocalSearchParams();
    const amount = params.amount || "0";
    const equipment = params.equipment || "Equipment";
    const rentalType = params.rentalType || "hourly";
    const quantity = params.quantity || "1";
    const rate = params.rate || "500";
    const location = params.location || "Maharashtra";

    const [isGenerating, setIsGenerating] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;

    // Generate booking details
    const bookingId = `FCB${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const bookingTime = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(checkAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const generateReceiptHTML = () => {
        const totalAmount = parseInt(amount as string);
        const subtotal = Math.round(totalAmount / 1.05);
        const serviceFee = totalAmount - subtotal;

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #f5f5f5; 
            padding: 20px;
          }
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .logo-icon {
            font-size: 32px;
          }
          .success-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 20px;
            margin-top: 10px;
          }
          .content {
            padding: 30px;
          }
          .booking-id {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
            margin-bottom: 24px;
          }
          .booking-id-label {
            color: #666;
            font-size: 12px;
            margin-bottom: 4px;
          }
          .booking-id-value {
            font-size: 20px;
            font-weight: bold;
            color: #10B981;
            letter-spacing: 1px;
          }
          .section-title {
            color: #333;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #666;
            font-size: 14px;
          }
          .detail-value {
            color: #333;
            font-size: 14px;
            font-weight: 500;
          }
          .amount-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          .amount-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .total-row {
            border-top: 2px dashed #ddd;
            margin-top: 12px;
            padding-top: 12px;
          }
          .total-label {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
          .total-value {
            font-size: 20px;
            font-weight: bold;
            color: #10B981;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #eee;
          }
          .footer-text {
            color: #666;
            font-size: 12px;
            margin-bottom: 8px;
          }
          .footer-brand {
            color: #10B981;
            font-weight: 600;
          }
          .status-confirmed {
            display: inline-block;
            background: rgba(16, 185, 129, 0.1);
            color: #10B981;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo-icon">🚜</div>
            <div class="logo">FarmerCab</div>
            <div class="success-badge">✓ Payment Successful</div>
          </div>
          
          <div class="content">
            <div class="booking-id">
              <div class="booking-id-label">Booking ID</div>
              <div class="booking-id-value">#${bookingId}</div>
            </div>
            
            <div class="section-title">Booking Details</div>
            <div class="detail-row">
              <span class="detail-label">Equipment</span>
              <span class="detail-value">${equipment}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location</span>
              <span class="detail-value">${location}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Rental Type</span>
              <span class="detail-value">${rentalType === "hourly" ? "Hourly" : "Daily"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration</span>
              <span class="detail-value">${quantity} ${rentalType === "hourly" ? "Hours" : "Days"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time</span>
              <span class="detail-value">${bookingTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="status-confirmed">Confirmed</span>
            </div>
            
            <div class="amount-section">
              <div class="section-title">Payment Summary</div>
              <div class="amount-row">
                <span class="detail-label">Subtotal</span>
                <span class="detail-value">₹${subtotal.toLocaleString()}</span>
              </div>
              <div class="amount-row">
                <span class="detail-label">Service Fee (5%)</span>
                <span class="detail-value">₹${serviceFee.toLocaleString()}</span>
              </div>
              <div class="amount-row total-row">
                <span class="total-label">Total Paid</span>
                <span class="total-value">₹${totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">Thank you for choosing</div>
            <div class="footer-brand">FarmerCab 🌾</div>
            <div class="footer-text" style="margin-top: 12px;">
              For support, contact: support@farmercab.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    };

    const handleDownloadPDF = async () => {
        try {
            setIsGenerating(true);
            const html = generateReceiptHTML();

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: "application/pdf",
                    dialogTitle: "Booking Receipt",
                    UTI: "com.adobe.pdf",
                });
            } else {
                Alert.alert("Success", `Receipt saved to: ${uri}`);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to generate PDF. Please try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const totalAmount = parseInt(amount as string);
    const subtotal = Math.round(totalAmount / 1.05);
    const serviceFee = totalAmount - subtotal;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Success Icon */}
                    <Animated.View
                        style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark]}
                            style={styles.iconGradient}
                        >
                            <Animated.View style={{ opacity: checkAnim }}>
                                <Ionicons name="checkmark" size={50} color="#fff" />
                            </Animated.View>
                        </LinearGradient>
                    </Animated.View>

                    <Text style={styles.successTitle}>Booking Confirmed!</Text>
                    <Text style={styles.successMessage}>
                        Your equipment has been successfully booked
                    </Text>

                    {/* Booking ID Card */}
                    <View style={styles.bookingIdCard}>
                        <Text style={styles.bookingIdLabel}>Booking ID</Text>
                        <Text style={styles.bookingIdValue}>#{bookingId}</Text>
                    </View>

                    {/* Receipt Card */}
                    <View style={styles.receiptCard}>
                        <View style={styles.receiptHeader}>
                            <MaterialCommunityIcons name="receipt" size={22} color={colors.primary} />
                            <Text style={styles.receiptTitle}>Booking Receipt</Text>
                        </View>

                        <View style={styles.receiptDivider} />

                        {/* Equipment Details */}
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Equipment</Text>
                            <Text style={styles.receiptValue}>{equipment}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Location</Text>
                            <Text style={styles.receiptValue}>{location}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Rental Type</Text>
                            <Text style={styles.receiptValue}>
                                {rentalType === "hourly" ? "Hourly" : "Daily"}
                            </Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Duration</Text>
                            <Text style={styles.receiptValue}>
                                {quantity} {rentalType === "hourly" ? "Hours" : "Days"}
                            </Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Date</Text>
                            <Text style={styles.receiptValue}>{bookingDate}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Time</Text>
                            <Text style={styles.receiptValue}>{bookingTime}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Status</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Confirmed</Text>
                            </View>
                        </View>

                        <View style={styles.receiptDivider} />

                        {/* Payment Summary */}
                        <Text style={styles.paymentTitle}>Payment Summary</Text>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Subtotal</Text>
                            <Text style={styles.receiptValue}>₹{subtotal.toLocaleString()}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Service Fee (5%)</Text>
                            <Text style={styles.receiptValue}>₹{serviceFee.toLocaleString()}</Text>
                        </View>

                        <View style={styles.totalDivider} />

                        <View style={styles.receiptRow}>
                            <Text style={styles.totalLabel}>Total Paid</Text>
                            <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Download PDF Button */}
                    <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={handleDownloadPDF}
                        disabled={isGenerating}
                        activeOpacity={0.8}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={20} color={colors.primary} />
                                <Text style={styles.downloadText}>Download PDF Receipt</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Info Note */}
                    <View style={styles.infoNote}>
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            The equipment owner will contact you shortly to confirm pickup details.
                            Keep this receipt for your records.
                        </Text>
                    </View>

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.bottomButtons}>
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => router.push("/rent")}
                >
                    <Ionicons name="list-outline" size={18} color={colors.text} />
                    <Text style={styles.secondaryBtnText}>My Bookings</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace("/rent")} activeOpacity={0.9}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.primaryBtn}
                    >
                        <Ionicons name="home-outline" size={18} color="#fff" />
                        <Text style={styles.primaryBtnText}>Home</Text>
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
    content: {
        paddingHorizontal: 20,
        paddingTop: 60,
        alignItems: "center",
    },
    successCircle: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    successTitle: {
        color: colors.text,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    successMessage: {
        color: colors.textMuted,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    bookingIdCard: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bookingIdLabel: {
        color: colors.textMuted,
        fontSize: 12,
        marginBottom: 4,
    },
    bookingIdValue: {
        color: colors.primary,
        fontSize: 22,
        fontWeight: "700",
        letterSpacing: 1,
    },
    receiptCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 20,
        width: "100%",
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
    },
    receiptHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    receiptTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "600",
    },
    receiptDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: 16,
    },
    receiptRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    receiptLabel: {
        color: colors.textMuted,
        fontSize: 14,
    },
    receiptValue: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "500",
    },
    statusBadge: {
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    paymentTitle: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    totalDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: 12,
        borderStyle: "dashed",
    },
    totalLabel: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "600",
    },
    totalValue: {
        color: colors.primary,
        fontSize: 22,
        fontWeight: "700",
    },
    downloadBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderRadius: 14,
        paddingVertical: 16,
        width: "100%",
        gap: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    downloadText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: "600",
    },
    infoNote: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        gap: 10,
        width: "100%",
    },
    infoText: {
        color: colors.textMuted,
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    },
    bottomButtons: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 12,
    },
    secondaryBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderRadius: 14,
        paddingVertical: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryBtnText: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "600",
    },
    primaryBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        paddingVertical: 16,
        gap: 8,
    },
    primaryBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});
