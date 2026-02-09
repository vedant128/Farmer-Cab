import React, { createContext, ReactNode, useContext, useState } from "react";

interface LocationCoords {
    latitude: number;
    longitude: number;
}

interface UserLocationContextType {
    address: string;
    setAddress: (address: string) => void;
    locationCoords: LocationCoords | null;
    setLocationCoords: (coords: LocationCoords | null) => void;
}

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

export function UserLocationProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState("Pune, Maharashtra");
    const [locationCoords, setLocationCoords] = useState<LocationCoords | null>({
        latitude: 18.5204,
        longitude: 73.8567,
    });

    return (
        <UserLocationContext.Provider value={{ address, setAddress, locationCoords, setLocationCoords }}>
            {children}
        </UserLocationContext.Provider>
    );
}

export function useUserLocation() {
    const context = useContext(UserLocationContext);
    if (context === undefined) {
        throw new Error("useUserLocation must be used within a UserLocationProvider");
    }
    return context;
}
