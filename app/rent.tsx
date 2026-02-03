import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Elegant color palette
const colors = {
  primary: "#10B981",      // Emerald green
  primaryLight: "#34D399", // Light emerald
  primaryDark: "#059669",  // Dark emerald
  accent: "#F59E0B",       // Warm amber
  background: "#111827",   // Rich dark blue-gray
  surface: "#1F2937",      // Elevated surface
  surfaceLight: "#374151", // Light surface
  text: "#F9FAFB",         // White text
  textMuted: "#9CA3AF",    // Muted gray
  border: "rgba(16, 185, 129, 0.2)",
};

// Equipment markers positions (angle in degrees, distance from center as ratio)
const equipmentMarkers = [
  { id: 1, angle: 45, distance: 0.7, type: "tractor" },
  { id: 2, angle: 120, distance: 0.85, type: "tractor" },
  { id: 3, angle: 200, distance: 0.6, type: "tractor" },
  { id: 4, angle: 280, distance: 0.75, type: "harvester" },
  { id: 5, angle: 330, distance: 0.5, type: "tractor" },
];

function RadarMap() {
  const scanRotation = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.3)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Continuous radar scan rotation
    Animated.loop(
      Animated.timing(scanRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = scanRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const radarSize = 220;
  const centerOffset = radarSize / 2;

  return (
    <View style={styles.radarContainer}>
      {/* Radar background with rings */}
      <View style={[styles.radar, { width: radarSize, height: radarSize }]}>
        {/* Outer glow */}
        <View style={styles.radarGlow} />

        {/* Concentric rings */}
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
        <View style={[styles.ring, styles.ring3]} />

        {/* Cross lines */}
        <View style={styles.crossHorizontal} />
        <View style={styles.crossVertical} />

        {/* Pulse effect */}
        <Animated.View
          style={[
            styles.pulse,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Scanning beam */}
        <Animated.View
          style={[
            styles.scanBeamContainer,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <LinearGradient
            colors={["rgba(16, 185, 129, 0.6)", "transparent"]}
            style={styles.scanBeam}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>

        {/* Equipment markers */}
        {equipmentMarkers.map((marker) => {
          const radians = (marker.angle * Math.PI) / 180;
          const x = Math.cos(radians) * (centerOffset * marker.distance);
          const y = Math.sin(radians) * (centerOffset * marker.distance);
          return (
            <View
              key={marker.id}
              style={[
                styles.equipmentMarker,
                {
                  left: centerOffset + x - 12,
                  top: centerOffset + y - 12,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="tractor"
                size={18}
                color={colors.primaryLight}
              />
            </View>
          );
        })}

        {/* Center tractor (user location) */}
        <View style={styles.centerTractor}>
          <Image
            source={require("../assets/images/tractor_bg.png")}
            style={styles.centerTractorImage}
          />
        </View>
      </View>
    </View>
  );
}

export default function RentPage() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.logoCircle}
          >
            <MaterialCommunityIcons name="tractor" size={18} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>FarmerCab</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="wallet-outline" size={18} color={colors.primary} />
          <Text style={styles.headerBalance}>₹5,200</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rent Equipment Title and Post Rental */}
        <View style={styles.rentRow}>
          <Text style={styles.rentTitle}>Rent Equipment</Text>
          <TouchableOpacity>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.postRentalBtn}
            >
              <Text style={styles.postRentalText}>+ Post Rental</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Radar Searching Section */}
        <LinearGradient
          colors={[colors.surface, "rgba(17, 24, 39, 0.9)"]}
          style={styles.searchingSection}
        >
          <Text style={styles.searchingText}>
            Searching <Text style={styles.searchingHighlight}>10km...</Text>
          </Text>

          <RadarMap />

          <TouchableOpacity style={styles.voiceBtn}>
            <Ionicons name="mic" size={22} color={colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Recommended for Rent */}
        <Text style={styles.sectionTitle}>Recommended for Rent</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          <TouchableOpacity style={styles.rentCard} activeOpacity={0.8}>
            <Image
              source={require("../assets/images/tractor_bg.png")}
              style={styles.tractorImg}
            />
            <View style={styles.cardContent}>
              <Text style={styles.tractorTitle}>John Deere 5050D</Text>
              <Text style={styles.tractorLoc}>Lumeqa, Maharashtra</Text>
              <View style={styles.priceRow}>
                <Text style={styles.tractorPrice}>₹500<Text style={styles.perHour}>/hr</Text></Text>
                <TouchableOpacity onPress={() => router.push({ pathname: "/booking", params: { name: "John Deere 5050D", location: "Lumeqa, Maharashtra", hourlyRate: "500" } })}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.bookBtn}
                  >
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rentCard} activeOpacity={0.8}>
            <Image
              source={require("../assets/images/tractor_bg.png")}
              style={styles.tractorImg}
            />
            <View style={styles.cardContent}>
              <Text style={styles.tractorTitle}>Mahindra 575</Text>
              <Text style={styles.tractorLoc}>Malawadi, UP</Text>
              <View style={styles.priceRow}>
                <Text style={styles.tractorPrice}>₹600<Text style={styles.perHour}>/hr</Text></Text>
                <TouchableOpacity onPress={() => router.push({ pathname: "/booking", params: { name: "Mahindra 575", location: "Malawadi, UP", hourlyRate: "600" } })}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.bookBtn}
                  >
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Wallet and Marketplace */}
        <View style={styles.walletRow}>
          <TouchableOpacity style={styles.walletBtn} activeOpacity={0.8}>
            <View style={styles.iconWrapper}>
              <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.walletTextContainer}>
              <Text style={styles.walletLabel}>Wallet</Text>
              <Text style={styles.walletAmount}>₹5,200</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.marketBtn} activeOpacity={0.8}>
            <View style={styles.iconWrapper}>
              <Ionicons name="storefront-outline" size={20} color={colors.accent} />
            </View>
            <Text style={styles.marketText}>Marketplace</Text>
          </TouchableOpacity>
        </View>

        {/* Apply for Subsidy */}
        <TouchableOpacity style={styles.subsidyCard} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.subsidyIcon}
          >
            <Ionicons name="leaf" size={20} color="#fff" />
          </LinearGradient>
          <View style={styles.subsidyContent}>
            <Text style={styles.subsidyTitle}>Apply for Subsidy</Text>
            <Text style={styles.subsidyDesc}>
              Get 50% off on equipment purchase through government schemes.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navBtnActive}>
          <View style={styles.navActiveIndicator}>
            <Ionicons name="leaf" size={22} color="#fff" />
          </View>
          <Text style={styles.navTextActive}>Rent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace("/sale")}
        >
          <Ionicons name="pricetags-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navText}>Buy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace("/profile")}
        >
          <Ionicons name="person-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navText}>Profile</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBalance: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  rentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  rentTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  postRentalBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  postRentalText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  searchingSection: {
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchingText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 15,
    fontWeight: "500",
  },
  searchingHighlight: {
    color: colors.primary,
    fontWeight: "700",
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  radar: {
    borderRadius: 110,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  radarGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 110,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  ring1: {
    width: "80%",
    height: "80%",
  },
  ring2: {
    width: "55%",
    height: "55%",
  },
  ring3: {
    width: "30%",
    height: "30%",
  },
  crossHorizontal: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  crossVertical: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  pulse: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 110,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  scanBeamContainer: {
    position: "absolute",
    width: "50%",
    height: 4,
    right: "50%",
    transformOrigin: "right center",
  },
  scanBeam: {
    width: "100%",
    height: "100%",
    borderRadius: 2,
  },
  equipmentMarker: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  centerTractor: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  centerTractorImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  voiceBtn: {
    backgroundColor: colors.surface,
    borderRadius: 25,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 20,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  cardsContainer: {
    paddingLeft: 20,
    paddingRight: 6,
  },
  rentCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginRight: 14,
    width: 175,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tractorImg: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 14,
  },
  tractorTitle: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 3,
  },
  tractorLoc: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tractorPrice: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  perHour: {
    color: colors.textMuted,
    fontWeight: "400",
    fontSize: 12,
  },
  bookBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
  walletRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  walletBtn: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  walletTextContainer: {
    marginLeft: 12,
  },
  walletLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  walletAmount: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  marketBtn: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  marketText: {
    color: colors.text,
    fontWeight: "600",
    marginLeft: 12,
    fontSize: 14,
  },
  subsidyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 100,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  subsidyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  subsidyContent: {
    flex: 1,
    marginLeft: 14,
  },
  subsidyTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  subsidyDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navBtn: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navBtnActive: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navActiveIndicator: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 8,
    marginBottom: 2,
  },
  navText: {
    color: colors.textMuted,
    fontWeight: "500",
    fontSize: 12,
    marginTop: 4,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
});
