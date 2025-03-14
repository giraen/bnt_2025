import React from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const navigate = useNavigate();

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Sign out error:", error);
            return;
        }
        navigate("/login");
    };

    return(
        <>
            <p>This is dashboard</p>
            <button onClick={signOut}>Sign out</button>
        </>
        
    )
}

export default DashboardPage