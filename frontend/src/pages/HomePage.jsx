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
            {isAuth ? (
                <>
                    <Link to="/dashboard">Dashboard (Participants)</Link> <br/>
                    <Link to="/committee">For Committee (TUP ID)</Link> <br/>
                    <Link to="/altcommittee">For Committee (BNT ID)</Link>
                </>
            ) : (
                <Link to="/login">Login (Admin)</Link>
            )}
            <br/>

            <Link to="/registration">To Registration (using QR)</Link> <br/>
        </>
    )
}

export default HomePage