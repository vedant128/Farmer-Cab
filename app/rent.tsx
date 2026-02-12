import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AddressEditModal from "../components/AddressEditModal";
import EquipmentMap from "../components/EquipmentMap";
import PaymentModal from "../components/PaymentModal";
import { useUserLocation } from "../contexts/UserLocationContext";
import { auth, db } from "../firebaseConfig";

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



export default function RentPage() {
  const { address, setAddress, locationCoords, setLocationCoords } = useUserLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [scanRange, setScanRange] = useState(10);
  const [balance, setBalance] = useState(0);

  // Fetch User Location on Mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocationCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        // Reverse geocode to get address if needed, but we have address from context usually
        // For now, we trust the address context or update it if we want bidirectional sync
      } catch (e) {
        console.log("Error fetching location:", e);
      }
    })();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBalance(data.balance || 0);
      } else {
        // Create document if it doesn't exist
        setDoc(userRef, { balance: 0 }, { merge: true });
        setBalance(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddMoney = async (amount: number) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        balance: increment(amount),
      });

      // Record transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "credit",
        amount: amount,
        description: "Wallet Deposit",
        date: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding money:", error);
    }
  };

  const [allRentals, setAllRentals] = useState<any[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<any[]>([]);

  // Distance calculation (Haversine formula)
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Fetch and Geocode Rentals
  useEffect(() => {
    const q = query(
      collection(db, "rentals"),
      orderBy("createdAt", "desc"),
      limit(20) // Fetch more to filter
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Geocode rentals that don't have coords
      const geocodedRentals = await Promise.all(
        rawData.map(async (item: any) => {
          if (item.latitude && item.longitude) return item;
          if (item.location) {
            try {
              const geocoded = await Location.geocodeAsync(item.location);
              if (geocoded && geocoded.length > 0) {
                return {
                  ...item,
                  latitude: geocoded[0].latitude,
                  longitude: geocoded[0].longitude,
                };
              }
            } catch (e) {
              console.log("Geocoding error for", item.location);
            }
          }
          return item;
        })
      );

      setAllRentals(geocodedRentals);
    });

    return () => unsubscribe();
  }, []);

  // Filter Rentals based on Range
  useEffect(() => {
    if (!locationCoords || allRentals.length === 0) {
      setFilteredRentals(allRentals);
      return;
    }

    const filtered = allRentals.filter((item) => {
      if (!item.latitude || !item.longitude) return false;
      const distance = getDistanceFromLatLonInKm(
        locationCoords.latitude,
        locationCoords.longitude,
        item.latitude,
        item.longitude
      );
      return distance <= scanRange;
    });

    setFilteredRentals(filtered);
  }, [allRentals, locationCoords, scanRange]);


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
          <View>
            <Text style={styles.headerTitle}>FarmerCab</Text>
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="location-sharp" size={12} color={colors.accent} />
              <Text style={styles.headerLocation}>{address}</Text>
              <Ionicons name="pencil" size={10} color={colors.textMuted} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => setPaymentModalVisible(true)}
        >
          <Ionicons name="wallet-outline" size={18} color={colors.primary} />
          <Text style={styles.headerBalance}>₹{balance.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>

      <AddressEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        currentAddress={address}
        onSave={(newAddress, coords) => {
          setAddress(newAddress);
          if (coords) {
            setLocationCoords(coords);
          }
        }}
      />

      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onAddMoney={handleAddMoney}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rent Equipment Title and Post Rental */}
        <View style={styles.rentRow}>
          <Text style={styles.rentTitle}>Rent Equipment</Text>
        </View>

        {/* Map Searching Section */}
        <View style={styles.searchingSection}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchingText}>
              Searching <Text style={styles.searchingHighlight}>{scanRange}km</Text>
            </Text>
          </View>

          <View style={styles.mapContainer}>
            <EquipmentMap scanRangeKm={scanRange} rentals={filteredRentals} userLocation={locationCoords} />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Scan Range: {scanRange} km</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={scanRange}
              onValueChange={setScanRange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#ffffff"
              thumbTintColor={colors.primary}
            />
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeText}>1km</Text>
              <Text style={styles.rangeText}>50km</Text>
            </View>
          </View>
        </View>

        {/* Recommended for Rent */}
        <Text style={styles.sectionTitle}>Recommended for Rent</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {filteredRentals.map((item) => (
            <TouchableOpacity key={item.id} style={styles.rentCard} activeOpacity={0.8}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.tractorImg}
              />

              <View style={styles.cardContent}>
                <Text style={styles.tractorTitle}>{item.name}</Text>
                <Text style={styles.tractorLoc}>{item.location}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.tractorPrice}>
                    ₹{item.pricePerHour}
                    <Text style={styles.perHour}>/hr</Text>
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/booking",
                        params: {
                          id: item.id,
                          name: item.name,
                          price: item.pricePerHour,
                          imageUrl: item.imageUrl,
                          location: item.location,
                          ownerId: item.ownerId,
                        },
                      })
                    }
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.bookBtn}
                    >
                      <Text style={styles.bookBtnText}>Book</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>


        {/* Wallet and Marketplace */}
        <View style={styles.walletRow}>
          <TouchableOpacity
            style={styles.walletBtn}
            activeOpacity={0.8}
            onPress={() => setPaymentModalVisible(true)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.walletTextContainer}>
              <Text style={styles.walletLabel}>Wallet</Text>
              <Text style={styles.walletAmount}>₹{balance.toLocaleString()}</Text>
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
        <TouchableOpacity style={styles.subsidyCard} activeOpacity={0.8} onPress={() => Linking.openURL("https://mahadbt.maharashtra.gov.in/Farmer/SchemeData/SchemeData?str=E9DDFA703C38E51A147B39AD4D6A9082")}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.subsidyIcon}
          >
            <Ionicons name="leaf" size={20} color="#fff" />
          </LinearGradient>
          <View style={styles.subsidyContent}>
            <Text style={styles.subsidyTitle} >Apply for Subsidy</Text>
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

        <TouchableOpacity style={styles.navBtn}
          onPress={() => router.replace("/add-rental")}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.navText}>Post</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  headerLocation: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerBalance: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  rentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  rentTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  searchingSection: {
    borderRadius: 28,
    marginHorizontal: 24,
    marginBottom: 32,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  searchHeader: {
    padding: 20,
    paddingBottom: 0,
  },
  searchingText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  searchingHighlight: {
    color: colors.primary,
    fontWeight: "800",
  },
  mapContainer: {
    height: 320,
    width: '100%',
    marginTop: 16,
  },
  sliderContainer: {
    padding: 24,
    paddingTop: 16,
  },
  sliderLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500",
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginHorizontal: 24,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  cardsContainer: {
    paddingLeft: 24,
    paddingRight: 10,
    paddingBottom: 24, // Add padding for shadow
  },
  rentCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginRight: 16,
    width: 200,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  tractorImg: {
    width: "100%",
    height: 140, // Taller image
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  tractorTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  tractorLoc: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tractorPrice: {
    color: colors.primaryLight,
    fontWeight: "800",
    fontSize: 18,
  },
  perHour: {
    color: colors.textMuted,
    fontWeight: "500",
    fontSize: 12,
  },
  bookBtn: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  walletRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 24,
    gap: 16,
  },
  walletBtn: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  walletTextContainer: {
    marginLeft: 14,
  },
  walletLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
    fontWeight: "500",
  },
  walletAmount: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
  },
  marketBtn: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  marketText: {
    color: colors.text,
    fontWeight: "700",
    marginLeft: 12,
    fontSize: 15,
  },
  subsidyCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 120, // More space for bottom nav
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  subsidyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  subsidyContent: {
    flex: 1,
    marginLeft: 16,
  },
  subsidyTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  subsidyDesc: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomNav: {
    position: "absolute",
    bottom: 24, // Lifted for floating effect
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between", // Spread out
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.95)", // Glassy
    paddingVertical: 16, // Taller
    paddingHorizontal: 32, // More side padding
    borderRadius: 32, // Pill shape
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
    marginBottom: 0, // No margin for clean icon-only look optionally, but let's keep text
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  navText: {
    display: 'none', // Hide inactive text for cleaner look? Or keep. Let's hide inactive for minimalism
  },
  navTextActive: {
    display: 'none', // Hide active text too for purely iconic pill? Or keep. The plan didn't specify. I'll hide labels for a very modern aesthetic or keep them minimal.
    // Let's keep them hidden for a "floating pill" look which is very trendy.
  },
});
