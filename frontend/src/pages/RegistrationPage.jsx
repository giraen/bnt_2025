import QrScanner from 'qr-scanner';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import supabase from "../supabase-client";
import Heading from "../components/Heading";

const RegistrationPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const scannerRef = useRef(null);

    const [message, setMessage] = useState(false);

    useEffect(() => {
        // Initialize QR scanner
        const scanner = new QrScanner(videoRef.current, async (result) => {

            try {
                const data = result.data.trim();
                scanner.stop();
                
                // Sanitize data to avoid SQL injection
                if (typeof data !== "string" || !data.startsWith("25-") || data.length !== 8) {
                    setMessage("Invalid QR code format.");
                    return;
                }

                const split_data = data.split('-');
                

                if (split_data.length !== 2 || split_data[0] !== '25' || split_data[1].length !== 5) {
                    setMessage("Invalid QR code format.");
                    return;
                }

                // If the owner of QR scanned has registered
                // check if their BNT ID is in the table participants
                const { data: isRegistered, error: checkRegError } = await supabase
                    .from("participants")
                    .select("fullname, school")
                    .eq("bnt_id", data)
                    .single();

                if (!isRegistered) {
                    setMessage("User isn't registered online.");
                    return;
                }

                if (checkRegError) {
                    setMessage("An error has occurred while checking registration. Please try again.");
                    return;
                }

                // Check if the QR has already been scanned and recorded for registration
                // Check if their BNT ID is in the table record_participants
                const { data: isRecorded } = await supabase
                    .from("record_participants")
                    .select("bnt_id")
                    .eq("bnt_id", data)
                    .single();

                if (isRecorded) {
                    setMessage("Participant is already registered.");
                    return;
                }

                // If they registered but not yet recorded, insert into table record_participant
                const { error: insertionError } = await supabase
                    .from("record_participants")
                    .insert([{ bnt_id: data }])
                    .select();


                if (insertionError) {
                    setMessage("An error has occured.");
                    return
                }

                // Set the pop up message into
                // "{fullname} from {school} is now registered."
                setMessage(`${isRegistered.fullname} from ${isRegistered.school} is now registered.`);

            } catch (error) {
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
    },[]);

    const handleClosePopup = () => {
        setMessage(null);

        if (scannerRef.current) {
            scannerRef.current.start();
        }
    }

    return(
        <section className='grid grid-row-2 gap-y-5 md:gap-y-12 md:gap-x-20'>
            <button onClick={() => navigate("/")} className='flex px-4'>
                <a className="transition">&lt; Home</a>
            </button>

            <Heading/>
            
            <div className="w-full h-96 flex flex-col items-center justify-center">
                <p className='mb-2 md:text-lg'>Please present your QR code</p>
                <video ref={videoRef} className="h-full object-cover bg-[#000101]"></video>
            </div>

            {message && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-bg p-4 rounded-lg shadow-lg w-80 flex justify-between flex-col text-center">
                        <button onClick={handleClosePopup} className="font-extrabold text-right">X</button>
                        <p className="px-4 py-4 text-xl">
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </section>
    )
}

export default RegistrationPage