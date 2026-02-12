import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";


import { collection, doc, getCountFromServer, getDoc, query, where } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import DefaultProfile from "./default-profile";

/* ---------- Colors ---------- */
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

const menuItems = [
  { id: 1, icon: "format-list-bulleted", label: "My Listings", value: "12 posts", color: colors.primary },
  { id: 2, icon: "swap-horizontal", label: "Transactions", value: "24 items", color: colors.primary },
];

export default function ProfilePage() {
  const [userData, setUserData] = useState<{
    name: string;
    phone: string;
    photoURL: string | null;
    userTypes: string[];
  }>({
    name: "",
    phone: "",
    photoURL: null,
    userTypes: [],
  });

  const [statsData, setStatsData] = useState({
    listings: 0,
    rentals: 0,
  });

  const [loading, setLoading] = useState(true);


  /* ---------- Fetch user from Firestore ---------- */
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const currentUser = auth.currentUser;

          if (!currentUser) {
            console.log("No logged-in user");
            return;
          }

          // 1. Fetch User Profile
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData({
              name: data.name || "New User",
              phone: data.phone || "",
              photoURL: data.photoURL || null,
              userTypes: data.userType || "Unknown",
            });
          }

          // 2. Fetch Listings Count
          const listingsQ = query(
            collection(db, "rentals"),
            where("ownerId", "==", currentUser.uid)
          );
          const listingsSnap = await getCountFromServer(listingsQ);

          // 3. Fetch Rentals (Bookings) Count
          const rentalsQ = query(
            collection(db, "transactions"),
            where("userId", "==", currentUser.uid),
            where("type", "==", "debit")
          );
          const rentalsSnap = await getCountFromServer(rentalsQ);

          setStatsData({
            listings: listingsSnap.data().count,
            rentals: rentalsSnap.data().count,
          });

        } catch (error) {
          console.log("Error fetching profile data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );


  /* ---------- Loading UI ---------- */
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>Loading profile...</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[colors.surface, colors.background]} style={styles.headerGradient}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <DefaultProfile
                imageUrl={userData.photoURL}
                size={100}
              />

              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            </View>

            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.role}>{userData.userTypes}</Text>
            <Text style={styles.email}>+91 {userData.phone}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("./edit-profile")}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.bookBtn}
            >
              <Text style={styles.bookBtnText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statsData.listings}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 20 }]}>
            <Text style={styles.statValue}>{statsData.rentals}</Text>
            <Text style={styles.statLabel}>Rentals</Text>
          </View>
        </View>


        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.label === "My Listings") {
                  router.push("/my-listings");
                } else if (item.label === "Transactions") {
                  router.push("/transactions");
                }
              }}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrapper, { backgroundColor: `${item.color}15` }]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>


        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            auth.signOut();
            router.replace("/register");
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace("/rent")}
        >
          <Ionicons name="leaf" size={22} color={colors.textMuted} />

          <Text style={styles.navText}>Rent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace("/add-rental")}
        >
          <Ionicons name="add" size={22} color={colors.textMuted} />

          <Text style={styles.navText}>Post Rental</Text>
        </TouchableOpacity>



        <TouchableOpacity style={styles.navBtnActive}>
          <View style={styles.navActiveIndicator}>
            <Ionicons name="person-outline" size={22} color="#fff" />
          </View>
          <Text style={styles.navTextActive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGradient: {
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  profileSection: { alignItems: "center", marginBottom: 24 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 4, letterSpacing: 0.5 },
  role: { fontSize: 15, color: colors.primaryLight, fontWeight: "600", marginBottom: 4 },
  email: { color: colors.textMuted, fontSize: 14 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 24,
    backgroundColor: "rgba(31, 41, 55, 0.6)",
    borderRadius: 24,
    paddingVertical: 20,
    marginTop: -30, // Overlap header
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "500", marginTop: 2 },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    margin: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuLabel: { color: colors.text, fontSize: 15, fontWeight: "600" },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 24,
    marginBottom: 12,
    marginTop: 8,
  },
  settingsSection: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    margin: 24,
    marginTop: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  bookBtn: {
    alignSelf: "center",
    minWidth: "35%",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#10B981",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingsLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  settingsLabel: { color: colors.text, fontSize: 15, fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.1)",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  logoutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
  versionText: { textAlign: "center", color: colors.textMuted, fontSize: 12, marginTop: 16 },
  bottomNav: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  navText: { display: 'none' },
  navTextActive: { display: 'none' },
});
