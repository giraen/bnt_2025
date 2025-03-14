import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate("/dashboard");
            }
        };

        checkAuth();
    }, [navigate])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            setMessage(error.message);
            setEmail("");
            setPassword("");
            return;
        }
      
        if (data) {
            navigate("/dashboard");
            return null;
        }
    };

    return(
        <>
            <p className="font-bold text-2xl">Log In Page</p>
            <br/>
            {message && <span>{message}</span>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    required
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email}/> <br/>

                <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password}/> <br/> <br/>

                <button type="submit">Log In</button>
            </form>
        </>
    )
}

export default LoginPage