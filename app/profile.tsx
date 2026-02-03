import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Elegant color palette (matching rent/buy pages)
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

const stats = [
  { id: 1, label: "Listings", value: "12", icon: "format-list-bulleted" },
  { id: 2, label: "Rentals", value: "28", icon: "tractor" },
  { id: 3, label: "Reviews", value: "4.8", icon: "star" },
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
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.surface, colors.background]}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="create-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            </View>
            <Text style={styles.name}>Yogesh Patel</Text>
            <Text style={styles.role}>Farmer • Maharashtra</Text>
            <Text style={styles.email}>sanyog@email.com</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Wallet Card */}
        <TouchableOpacity style={styles.walletCard} activeOpacity={0.8}>
          <View style={styles.walletLeft}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.walletIcon}
            >
              <Ionicons name="wallet" size={20} color="#fff" />
            </LinearGradient>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>₹5,200</Text>
            </View>
          </View>
          <TouchableOpacity>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.addMoneyBtn}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} activeOpacity={0.7}>
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
              <View style={styles.menuRight}>
                {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Referral Card */}
        <LinearGradient
          colors={[colors.accent, "#D97706"]}
          style={styles.referralCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.referralContent}>
            <View style={styles.referralIconBg}>
              <Ionicons name="gift" size={24} color={colors.accent} />
            </View>
            <View style={styles.referralText}>
              <Text style={styles.referralTitle}>Earn ₹500 per Referral!</Text>
              <Text style={styles.referralDesc}>
                Invite friends and earn rewards when they sign up
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-social" size={16} color={colors.accent} />
            <Text style={styles.shareBtnText}>Share Invite</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingsItem,
                index === settingsItems.length - 1 && styles.lastSettingsItem,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.settingsLeft}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={22}
                  color={colors.textMuted}
                />
                <Text style={styles.settingsLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>

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

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.replace("/sale")}
        >
          <Ionicons name="pricetags-outline" size={22} color={colors.textMuted} />
          <Text style={styles.navText}>Buy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtnActive}>
          <View style={styles.navActiveIndicator}>
            <Ionicons name="person" size={22} color="#fff" />
          </View>
          <Text style={styles.navTextActive}>Profile</Text>
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
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  editBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
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
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
    marginBottom: 4,
  },
  email: {
    color: colors.textMuted,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  walletCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  walletLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  walletInfo: {
    marginLeft: 12,
  },
  walletLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  walletAmount: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 20,
  },
  addMoneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
  },
  addMoneyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuValue: {
    color: colors.textMuted,
    fontSize: 13,
  },
  referralCard: {
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  referralContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  referralIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  referralText: {
    marginLeft: 14,
    flex: 1,
  },
  referralTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  referralDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  shareBtnText: {
    color: colors.accent,
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  settingsSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  lastSettingsItem: {
    borderBottomWidth: 0,
  },
  settingsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsLabel: {
    color: colors.text,
    fontSize: 15,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    gap: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 15,
  },
  versionText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 20,
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
