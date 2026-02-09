import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";

interface EquipmentMapProps {
    scanRangeKm: number; // Range in kilometers
    rentals: any[];
    userLocation: { latitude: number; longitude: number } | null;
}

export default function EquipmentMap({ scanRangeKm, rentals, userLocation }: EquipmentMapProps) {
    const mapRef = useRef<MapView>(null);

    // Zoom to fit range
    useEffect(() => {
        if (userLocation && mapRef.current) {
            // Calculate delta based on range
            // 1 deg latitude is approx 111km
            const latDelta = (scanRangeKm * 2.5) / 111;
            const longDelta = latDelta * (Dimensions.get('window').width / Dimensions.get('window').height);

            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: latDelta,
                longitudeDelta: longDelta,
            }, 1000);
        }
    }, [scanRangeKm, userLocation]);

    if (!userLocation) {
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
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                customMapStyle={darkMapStyle}
                showsUserLocation
                showsMyLocationButton
            >
                {/* Range Circle */}
                <Circle
                    center={userLocation}
                    radius={scanRangeKm * 1000}
                    strokeColor="rgba(16, 185, 129, 0.5)"
                    fillColor="rgba(16, 185, 129, 0.1)"
                    strokeWidth={2}
                />

                {/* Equipment Markers */}
                {rentals.map((item) => (
                    <Marker
                        key={item.id}
                        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                        title={item.name || item.type}
                        description={`₹${item.pricePerHour}/hr - ${item.location}`}
                        onCalloutPress={() => {
                            router.push({
                                pathname: "/booking",
                                params: {
                                    id: item.id,
                                    name: item.name,
                                    price: item.pricePerHour,
                                },
                            });
                        }}
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
