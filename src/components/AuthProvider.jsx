"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Auth User
    const [userData, setUserData] = useState(null); // Firestore Profile (Role)
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch extra profile data (role)
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (name, email, password, role) => {
        // 1. Create Auth User
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // 2. Create Firestore Profile with Role
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email,
            role, // 'citizen' or 'worker'
            createdAt: serverTimestamp()
        });

        // 3. Update local state immediately for faster UI feedback
        setUserData({ uid: user.uid, name, email, role });

        return user;
    };

    const logout = async () => {
        setUser(null);
        setUserData(null);
        await signOut(auth);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, userData, login, register, logout, loading }}>
            {loading ? (
                <div className="h-screen w-full flex items-center justify-center bg-white">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
