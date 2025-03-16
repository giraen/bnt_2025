import React, { useEffect, useState, useRef } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import QrScanner from 'qr-scanner';
import { Link } from "react-router-dom";

const DashboardPage = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);

    const videoRef = useRef(null);
    const [scannedData, setScannedData] = useState(null);
    const scannerRef = useRef(null);

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Sign out error:", error);
            return;
        }
        navigate("/login");
    };
    
    useEffect(() => {
        // Initialize QR scanner
        const scanner = new QrScanner(videoRef.current, (result) => {
            try {
                const data = JSON.parse(result.data);

                if (data.bnt_id && data.contact_number && data.email && data.food_allergies && data.fullname && data.school) {
                    setScannedData(data);
                    setMessage("You may now claim your lunch!");
                } else {
                    setMessage("This is not a valid BNT QR");
                }

            } catch (error) {
                setMessage("This is not a valid BNT QR");
                console.error("Invalid QR Code format:", error);
            }

            scanner.stop();
        }, {
            highlightScanRegion: true,
            highlightCodeOutline: true,
        });

        scanner.start();
        scannerRef.current = scanner;

        return () => {
            // Cleanup on component unmount
            scannerRef.current?.stop();
        };

    }, []);

    const handleClosePopup = async () => {
        try {
            const { data: registered_user, error } = await supabase
                .from("registration")
                .select("fullname")
                .eq("bnt_id", scannedData.bnt_id)
                .single();
            
            if (!registered_user) {
                setMessage("User not found in registration!");
                return;
            }

            if (error) {
                setMessage("An error has occured. Please contact the admin.");
                return;
            }

            const { data: claimed_lunch } = await supabase
                .from("claim_lunch")
                .select("fullname")
                .eq("fullname", scannedData.fullname)
                .single();
            
            if (claimed_lunch) {
                setMessage("Lunch already claimed!");
            } else {
                const { error:insertionError } = await supabase
                    .from("claim_lunch")
                    .insert([{ fullname: scannedData.fullname }])
                    .select();

                if (insertionError) {
                    setMessage("An error has occured. Please contact the admin.");
                    console.error("Error inserting claim:", insertionError);
                } else {
                    setMessage("You may now claim your lunch!");
                }
            }

        } catch (error) {
            console.error("Database Error:", error);
            setMessage("An error has occured. Please contact the admin.");
        }

        setMessage(null);

        if (scannerRef.current) {
            scannerRef.current.start();
        }
    }

    return(
        <section className="md:h-screen overflow-hidden">
            <div className="flex justify-between py-2">
                <button onClick={() => navigate("/")}>
                    <Link to="/registration" className="transition">&lt; Home</Link>
                </button>
                <button onClick={signOut} className="hover:text-button cursor-pointer">Log Out</button>
            </div>
            {/* Division of 2 divs */}
            <div className="grid grid-cols-1 grid-rows-9 md:grid-cols-5 md:grid-rows-5 gap-2 w-full md:h-screen h-full">
                {/* Left div */}
                <div className="row-span-6 md:col-span-2 md:row-span-5 w-full h-full flex flex-col gap-y-8 py-2">
                    <p className="text-left text-4xl">Welcome <br/><span className="font-extrabold font-exo2">BNT Participants</span>!</p>

                    <video ref={videoRef} className="aspect-[9/16] max-h-[500px] w-auto md:h-3/4 object-cover bg-[#000101]"></video>
                </div>

                {/* Right div */}
                <div className="row-span-3 md:col-span-3 md:row-span-5 md:col-start-3 sm:row-start-7 w-full overflow-y-auto md:py-28 md:pl-8">
                    <p>Recent Claim of Lunch</p>

                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th>Fullname</th>
                                <th>Claimed at</th>
                            </tr>
                            </thead>

                            <tbody>
                                {/* <Users user={}/> */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {message && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-bg p-4 rounded-lg shadow-lg w-80 flex justify-between flex-col text-center">
                        <button onClick={handleClosePopup} className="font-extrabold text-right">X</button>
                        <p className="px-4 py-4 text-2xl">
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </section>
        
    )
}

export default DashboardPage