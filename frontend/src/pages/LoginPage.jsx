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
            <p className="font-bold text-3xl text-center mb-6">Log In Page</p>
            <br/>
            <form onSubmit={handleSubmit} className="w-full">
                <input 
                    type="email" 
                    placeholder="Email" 
                    required
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email}
                    className="w-full p-3 order border-black focus:ring-1 rounded-lg"/> <br/>

                <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password}
                    className="w-full p-3 border border-black focus:ring-1 rounded-lg"/> <br/> <br/>

                {message && 
                    <>
                        <span className="text-red-500 text-center mb-4">{message}</span> <br/> <br/>
                    </>} 

                <button type="submit"
                    className="w-full bg-button text-white py-3 rounded-lg font-semibold hover:bg-darker-button transition">Log In</button>
            </form>
        </>
    )
}

export default LoginPage