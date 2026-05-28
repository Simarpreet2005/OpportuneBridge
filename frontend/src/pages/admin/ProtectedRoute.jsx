import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ children, allowedRoles = ['recruiter', 'admin'] }) => {
    const { user } = useSelector(store => store.auth);

    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) {
            toast.error("Please login or sign up to access this feature");
            setTimeout(() => navigate("/login"), 1500);
        } else if (!allowedRoles.includes(user.role)) {
            toast.error("You don't have permission to access this feature");
            setTimeout(() => navigate("/"), 1500);
        }
    }, [user, allowedRoles, navigate]);

    if (user === null || !allowedRoles.includes(user.role)) {
        return null;
    }

    return (
        <>
            {children}
        </>
    )
};
export default ProtectedRoute;

