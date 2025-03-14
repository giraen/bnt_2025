import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabase-client";

const HomePage = () => {
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuth(!!session);
        };

        checkAuth();
    }, [])

    return(
        <>
            <p>THIS IS THE HOME PAGE</p>

            {isAuth ? (
                <Link to="/dashboard">Dashboard (Admin)</Link>
            ) : (
                <Link to="/login">Login (Admin)</Link>
            )}
            <br/>

            <Link to="/registration">To Registration (using QR)</Link> <br/>
            <Link to="/altregistration">To Registration</Link>
        </>
    )
}

export default HomePage