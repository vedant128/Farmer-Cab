import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const userTypes = [
    {
        id: "farmer",
        title: "Farmer",
        description: "I need to rent equipment",
        icon: "account-cowboy-hat",
        color: "#4CAF50",
    },
    {
        id: "owner",
        title: "Equipment Owner",
        description: "I want to list my equipment",
        icon: "tractor",
        color: "#FFB300",
    },
    {
        id: "driver",
        title: "Driver",
        description: "I operate farm equipment",
        icon: "steering",
        color: "#2196F3",
    },
];

export default function UserTypeScreen() {
    const handleSelect = (type: string) => {
        router.push("/loading");
    };

    return (
        <ImageBackground
            source={require("../assets/images/tractor_bg.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            <LinearGradient
                colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.85)", "rgba(0,0,0,0.95)"]}
                style={styles.overlay}
            />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Who are you?</Text>
                    <Text style={styles.subtitle}>Select your role to personalize your experience</Text>
                </View>

                {/* User Type Cards */}
                <View style={styles.cardsContainer}>
                    {userTypes.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            onPress={() => handleSelect(type.id)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.card, { borderColor: type.color }]}>
                                <View style={[styles.iconCircle, { backgroundColor: type.color }]}>
                                    <MaterialCommunityIcons
                                        name={type.icon as any}
                                        size={32}
                                        color="#fff"
                                    />
                                </View>
                                <View style={styles.cardText}>
                                    <Text style={styles.cardTitle}>{type.title}</Text>
                                    <Text style={styles.cardDescription}>{type.description}</Text>
                                </View>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color="#666"
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: "#000",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(30, 30, 30, 0.9)",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    cardText: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        color: "#888",
    },
});
