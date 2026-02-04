import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";

interface EquipmentMapProps {
    scanRangeKm: number; // Range in kilometers
}

// Mock equipment data generation based on center location
const generateMockEquipment = (lat: number, long: number, count: number, rangeKm: number) => {
    const equipment = [];
    const equipmentTypes = ["Tractor", "Harvester", "Tiller", "Pump"];

    for (let i = 0; i < count; i++) {
        // Random position within range
        // 1 deg lat ~ 111km
        const r = (rangeKm / 111) * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;

        const latitude = lat + r * Math.cos(theta);
        const longitude = long + (r * Math.sin(theta)) / Math.cos(lat * (Math.PI / 180));

        equipment.push({
            id: i,
            type: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
            latitude,
            longitude,
        });
    }
    return equipment;
};

export default function EquipmentMap({ scanRangeKm }: EquipmentMapProps) {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [equipmentList, setEquipmentList] = useState<any[]>([]);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setErrorMsg("Permission to access location was denied");
                    return;
                }

                let location;
                try {
                    // Try to get current position
                    location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                } catch (e) {
                    console.log("Error getting current location, trying last known:", e);
                    // Fallback to last known position
                    location = await Location.getLastKnownPositionAsync({});
                }

                // If still null, use a default location (e.g., Pune)
                if (!location) {
                    console.log("Location unavailable, using default.");
                    location = {
                        coords: {
                            latitude: 18.5204,
                            longitude: 73.8567,
                            altitude: 0,
                            accuracy: 0,
                            altitudeAccuracy: 0,
                            heading: 0,
                            speed: 0
                        },
                        timestamp: Date.now()
                    };
                }

                setLocation(location);

                // Generate mock equipment around user
                const mockData = generateMockEquipment(
                    location.coords.latitude,
                    location.coords.longitude,
                    10, // number of items
                    scanRangeKm
                );
                setEquipmentList(mockData);
            } catch (err) {
                console.error("Critical location error:", err);
                setErrorMsg("Could not fetch location.");
            }
        })();
    }, []);

    // Update mock data when range changes
    useEffect(() => {
        if (location) {
            const mockData = generateMockEquipment(
                location.coords.latitude,
                location.coords.longitude,
                Math.floor(scanRangeKm * 1.5), // More items as range increases
                scanRangeKm
            );
            setEquipmentList(mockData);
        }
    }, [scanRangeKm, location]);

    // Zoom to fit range
    useEffect(() => {
        if (location && mapRef.current) {
            // Calculate delta based on range
            // 1 deg latitude is approx 111km
            const latDelta = (scanRangeKm * 2.5) / 111;
            const longDelta = latDelta * (Dimensions.get('window').width / Dimensions.get('window').height);

            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: latDelta,
                longitudeDelta: longDelta,
            }, 1000);
        }
    }, [scanRangeKm, location]);

    if (errorMsg) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    if (!location) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Locating...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                customMapStyle={darkMapStyle}
                showsUserLocation
                showsMyLocationButton
            >
                {/* Range Circle */}
                <Circle
                    center={location.coords}
                    radius={scanRangeKm * 1000}
                    strokeColor="rgba(16, 185, 129, 0.5)"
                    fillColor="rgba(16, 185, 129, 0.1)"
                    strokeWidth={2}
                />

                {/* Equipment Markers */}
                {equipmentList.map((item) => (
                    <Marker
                        key={item.id}
                        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                        title={item.type}
                        description={`Available for rent`}
                    >
                        <View style={styles.markerContainer}>
                            <MaterialCommunityIcons name="tractor" size={20} color="#10B981" />
                        </View>
                    </Marker>
                ))}

            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
    },
    loadingText: {
        color: '#9CA3AF',
    },
    markerContainer: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#10B981',
    }
});

const darkMapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#bdbdbd"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#181818"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1b1b1b"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#2c2c2c"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8a8a8a"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#373737"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#3c3c3c"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#4e4e4e"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3d3d3d"
            }
        ]
    }
];
