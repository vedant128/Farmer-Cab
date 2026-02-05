import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
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

/* ---------- Dummy UI Data ---------- */
const stats = [
  { id: 1, label: "Listings", value: "12" },
  { id: 2, label: "Rentals", value: "28" },
  { id: 3, label: "Reviews", value: "4.8" },
];

const menuItems = [
  { id: 1, icon: "format-list-bulleted", label: "My Listings", value: "12 posts", color: colors.primary },
  { id: 2, icon: "swap-horizontal", label: "Transactions", value: "24 items", color: colors.primary },
  { id: 3, icon: "heart", label: "Favorites", value: "8 items", color: "#EF4444" },
  { id: 4, icon: "cash", label: "Subsidies", value: "3 applied", color: colors.accent },
];

const settingsItems = [
  { id: 1, icon: "credit-card-outline", label: "Payment Methods" },
  { id: 2, icon: "bell-outline", label: "Notifications" },
  { id: 3, icon: "shield-check-outline", label: "Privacy & Security" },
  { id: 4, icon: "help-circle-outline", label: "Help & Support" },
  { id: 5, icon: "cog-outline", label: "Settings" },
];

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);


  /* ---------- Fetch user from Firestore ---------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.log("No logged-in user");
          return;
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("Fetched user:", data);

          setUserData({
            name: data.name,
            phone: data.phone,
          });
        } else {
          console.log("User document not found");
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


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
                name={userData.name || "U"}
                imageUrl={null}
                size={100}
              />

              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            </View>

            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.role}>Farmer • Maharashtra</Text>
            <Text style={styles.email}>+91 {userData.phone}</Text>
          </View>

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
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

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsSection}>
          {settingsItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.settingsItem}>
              <View style={styles.settingsLeft}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={item.color}
                />
                <Text style={styles.settingsLabel}>{item.label}</Text>
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
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: { alignItems: "center", marginBottom: 24 },
  avatarContainer: { position: "relative", marginBottom: 14 },
  verifiedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 24, fontWeight: "700", color: colors.text },
  role: { fontSize: 14, color: colors.primary },
  email: { color: colors.textMuted, fontSize: 14 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 16,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    margin: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: { color: colors.text },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 20,
  },
  settingsSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    margin: 20,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  settingsLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsLabel: { color: colors.text },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(239,68,68,0.1)",
    gap: 8,
  },
  logoutText: { color: "#EF4444", fontWeight: "600" },
  versionText: { textAlign: "center", color: colors.textMuted, fontSize: 12 },
});
