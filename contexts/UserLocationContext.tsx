import React, { createContext, ReactNode, useContext, useState } from "react";

interface UserLocationContextType {
    address: string;
    setAddress: (address: string) => void;
}

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

export function UserLocationProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState("Pune, Maharashtra");

    return (
        <UserLocationContext.Provider value={{ address, setAddress }}>
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
