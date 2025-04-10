import React, { useEffect, useState, useRef } from "react";
import supabase from "../supabase-client";
import { useNavigate } from "react-router-dom";
import QrScanner from 'qr-scanner';
import DashboardTable from "../components/DashboardTable";

const DashboardPage = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);

    const videoRef = useRef(null);
    const scannerRef = useRef(null);
    const [refreshTable, setRefreshTable] = useState(false);

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
        const scanner = new QrScanner(videoRef.current, async (result) => {
            try {
                const data = result.data.trim();

                // Sanitize data to avoid SQL injection
                if (typeof data !== "string" || !data.startsWith("25-") || data.length !== 8) {
                    setMessage("Invalid QR code format.");
                    return;
                }

                const split_data = data.split('-');
                scanner.stop();
                
                if (split_data.length !== 2 || split_data[0] !== '25' || split_data[1].length !== 5) {
                    setMessage("Invalid QR code format.");
                    return;
                } 
                
                // Check if the participant attendance was recorded
                const { data: isRecorded, error: checkRecError } = await supabase
                    .from("record_participants")
                    .select("bnt_id")
                    .eq("bnt_id", data)
                    .single();
                
                if (!isRecorded) {
                    setMessage("User isn't registered.");
                    return;
                }

                if (checkRecError) {
                    setMessage('An error has occured.');
                    return;
                }

                // If not yet, then insert their bnt_id
                const { data: insertClaim, error: insertClaimError } = await supabase
                    .from("claim_lunch_participants")
                    .insert([{ bnt_id: data }])
                    .select();
                
                if (insertClaimError) {
                    setMessage("Lunch already claimed");
                    return;
                }

                // Get the user's food allergy
                const { data: getFood, error: getFoodError } = await supabase
                    .from("participants")
                    .select("fullname, food_allergies")
                    .eq("bnt_id", data)
                    .single();

                setMessage(
                    <>
                        <p>{getFood.fullname} can now claim the food.</p> <br/>
                        <div className="grid grid-cols-1 grid-rows-[auto auto] text-sm">
                            <p className="font-bold row-start-1 text-left">Food Note:</p>
                            <p className="row-start-2 text-justify">{getFood.food_allergies}</p>
                        </div>
                    </>
                );

            } catch (error) {
                setMessage("This is not a valid BNT QR");
                console.error("Invalid QR Code format:", error);
                return;
            }

            
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
        setMessage(null);
        setRefreshTable(prev => !prev);

        if (scannerRef.current) {
            scannerRef.current.start();
        }
    }

    return(
        <section className="md:h-screen overflow-hidden">
            <div className="flex justify-between py-2">
                <button onClick={() => navigate("/")}>
                    <a className="transition">&lt; Home</a>
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
                <div className="row-span-3 md:col-span-3 md:row-span-5 md:col-start-3 sm:row-start-7 w-full overflow-y-auto md:py-28 md:pl-8 flex flex-col items-center">
                    <p className="font-bold text-2xl mb-4">Recent Claim of Lunch</p>

                    <div>
                        <DashboardTable refresh={refreshTable}/>
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