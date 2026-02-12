import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, increment, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddressEditModal from "../components/AddressEditModal";
import { useUserLocation } from "../contexts/UserLocationContext";
import { auth, db } from "../firebaseConfig";


// Elegant color palette (matching rent page)
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

const categories = [
  { id: 1, name: "Tractors", icon: "tractor", count: 156 },
  { id: 2, name: "Harvesters", icon: "grass", count: 42 },
  { id: 3, name: "Tillers", icon: "cog", count: 78 },
  { id: 4, name: "Pumps", icon: "water-pump", count: 93 },
];

const popularItems = [
  {
    id: 1,
    name: "Swaraj 742 XT",
    location: "Hingoli, MH",
    price: "₹4,80,000",
    year: "2022",
    hours: "850 hrs",
  },
  {
    id: 2,
    name: "Solis 4515 SN",
    location: "Soralika, DH",
    price: "₹5,00,000",
    year: "2021",
    hours: "1200 hrs",
  },
  {
    id: 3,
    name: "Mahindra 275 DI",
    location: "Pune, MH",
    price: "₹3,50,000",
    year: "2020",
    hours: "2100 hrs",
  },
];

export default function BuyPage() {
  const { address, setAddress, setLocationCoords } = useUserLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [balance, setBalance] = useState(0);

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
              style={styles.headerLocationRow}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="location-sharp" size={12} color={colors.accent} />
              <Text style={styles.headerLocation}>{address}</Text>
              <Ionicons name="pencil" size={10} color={colors.textMuted} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.headerRight}>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Buy Equipment</Text>

        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              placeholder="Search tractors, harvesters..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.8}>
                <View style={styles.categoryIconWrapper}>
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{cat.count} items</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular for Sale */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular for Sale</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {popularItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.saleCard} activeOpacity={0.8}>
              <Image
                source={require("../assets/images/tractor_bg.png")}
                style={styles.tractorImg}
              />
              <View style={styles.cardBadge}>
                <Text style={styles.badgeText}>{item.year}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.tractorTitle}>{item.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.tractorLoc}>{item.location}</Text>
                </View>
                <Text style={styles.hoursText}>{item.hours}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.tractorPrice}>{item.price}</Text>
                  <TouchableOpacity>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.detailsBtn}
                    >
                      <Text style={styles.detailsBtnText}>View</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Get Easy Loan Card */}
        <TouchableOpacity style={styles.loanCard} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.accent, "#D97706"]}
            style={styles.loanIcon}
          >
            <Ionicons name="cash-outline" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.loanContent}>
            <Text style={styles.loanTitle}>Get Easy Loan</Text>
            <Text style={styles.loanDesc}>
              Instant approval for equipment purchases at low interest rates
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Sellers Near You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sellers Near You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sellerCard} activeOpacity={0.8}>
          <Image
            source={require("../assets/images/tractor_bg.png")}
            style={styles.sellerImg}
          />
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>Anil Pawar</Text>
            <Text style={styles.sellerLocation}>Madhya Pradesh</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.reviewsText}>(23 reviews)</Text>
            </View>
          </View>
          <View style={styles.sellerRight}>
            <Text style={styles.sellerEquipment}>3 Equipment</Text>
            <TouchableOpacity>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.chatBtn}
              >
                <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                <Text style={styles.chatBtnText}>Chat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sellerCard} activeOpacity={0.8}>
          <Image
            source={require("../assets/images/tractor_bg.png")}
            style={styles.sellerImg}
          />
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>Rajesh Kumar</Text>
            <Text style={styles.sellerLocation}>Maharashtra</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.reviewsText}>(15 reviews)</Text>
            </View>
          </View>
          <View style={styles.sellerRight}>
            <Text style={styles.sellerEquipment}>5 Equipment</Text>
            <TouchableOpacity>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.chatBtn}
              >
                <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                <Text style={styles.chatBtnText}>Chat</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace("/rent")}
        >
          <Ionicons name="leaf-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navText}>Rent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn}
          onPress={() => router.replace("/add-rental")}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.navText}>Post</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtnActive}>
          <View style={styles.navActiveIndicator}>
            <Ionicons name="pricetags" size={22} color="#fff" />
          </View>
          <Text style={styles.navTextActive}>Buy</Text>
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
    alignItems: "center",
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
  headerLocationRow: {
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  pageTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  postSaleBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
  },
  postSaleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 15,
  },
  filterBtn: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoriesContainer: {
    marginBottom: 24,
    paddingLeft: 20,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    alignItems: "center",
    width: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 2,
  },
  categoryCount: {
    color: colors.textMuted,
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  cardsContainer: {
    paddingLeft: 20,
    paddingRight: 6,
    marginBottom: 24,
  },
  saleCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginRight: 14,
    width: 180,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tractorImg: {
    width: "100%",
    height: 110,
    resizeMode: "cover",
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardContent: {
    padding: 14,
  },
  tractorTitle: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  tractorLoc: {
    color: colors.textMuted,
    fontSize: 12,
  },
  hoursText: {
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
    fontSize: 15,
  },
  detailsBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  detailsBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  loanCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  loanIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  loanContent: {
    flex: 1,
    marginLeft: 14,
  },
  loanTitle: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  loanDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  sellerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  sellerImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  sellerLocation: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
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
    fontSize: 11,
  },
  sellerRight: {
    alignItems: "flex-end",
  },
  sellerEquipment: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 8,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  chatBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
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
