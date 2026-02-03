import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function LoadingScreen() {
    const spinValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const fadeValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(fadeValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Continuous rotation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 0.9,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Navigate after 3 seconds
        const timer = setTimeout(() => {
            router.replace("/rent");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <LinearGradient
            colors={["#1a1a1a", "#0d0d0d"]}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeValue,
                        transform: [{ scale: scaleValue }],
                    },
                ]}
            >
                {/* Animated Logo */}
                <View style={styles.logoContainer}>
                    <Animated.View
                        style={[
                            styles.spinnerOuter,
                            { transform: [{ rotate: spin }] },
                        ]}
                    />
                    <View style={styles.logoCircle}>
                        <MaterialCommunityIcons name="tractor" size={40} color="#4a2c00" />
                    </View>
                </View>

                {/* Loading Text */}
                <Text style={styles.title}>Setting up your account</Text>
                <Text style={styles.subtitle}>Please wait...</Text>

                {/* Progress Dots */}
                <View style={styles.dotsContainer}>
                    <LoadingDot delay={0} />
                    <LoadingDot delay={200} />
                    <LoadingDot delay={400} />
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

function LoadingDot({ delay }: { delay: number }) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [delay]);

    return <Animated.View style={[styles.dot, { opacity }]} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
    },
    logoContainer: {
        width: 120,
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    spinnerOuter: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: "transparent",
        borderTopColor: "#4CAF50",
        borderRightColor: "#4CAF50",
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FFB300",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        marginBottom: 30,
    },
    dotsContainer: {
        flexDirection: "row",
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#4CAF50",
    },
});
