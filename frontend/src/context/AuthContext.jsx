import { createContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/authSlice";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Syncing with Redux for backward compatibility
    const { user: reduxUser } = useSelector((store) => store.auth);
    const dispatch = useDispatch();

    // We'll use Redux as the source of truth but expose via Context API for the new components
    const [user, setLocalUser] = useState(reduxUser);

    useEffect(() => {
        setLocalUser(reduxUser);
    }, [reduxUser]);

    const updateUser = (userData) => {
        setLocalUser(userData);
        dispatch(setUser(userData));
    };

    return (
        <AuthContext.Provider value={{ user, setUser: updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
