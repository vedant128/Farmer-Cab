import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
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
      // State updates automatically via onSnapshot
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
        onSave={setAddress}
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 2,
  },
  headerLocation: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
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
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  searchingText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  searchingHighlight: {
    color: colors.primary,
    fontWeight: "700",
  },
  mapContainer: {
    height: 300,
    width: '100%',
    marginTop: 10,
  },
  sliderContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sliderLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 5,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: colors.textMuted,
    fontSize: 10,
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
