import QrScanner from 'qr-scanner';
import React, { useEffect, useRef, useState } from 'react';
import supabase from "../supabase-client";
import Heading from "../components/Heading";

const RegistrationPage = () => {
    const videoRef = useRef(null);
    const [scannedData, setScannedData] = useState(null);
    const scannerRef = useRef(null);

    const [showPopup, setShowPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Initialize QR scanner
        const scanner = new QrScanner(videoRef.current, (result) => {

            try {
                const data = JSON.parse(result.data);
                setScannedData(data);
                console.log("Scanned Data: ", data);
                setShowPopup(true);

                // Go to the confirmation page
                // navigate("/confirmation", {state: data});
            } catch (error) {
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
    },[]);

    const handleClosePopup = async (isInfoCorrect) => {
        if (isInfoCorrect) {
            const { error } = await supabase.from("registration").insert([scannedData]);
            setShowPopup(false);

            if ( error ) {
                console.error("Supabase Insert Error:", error.message);
                if (error.code === "23505") {
                    setErrorMessage("This QR code has already been scanned.");
                } else {
                    setErrorMessage("An error occurred. Please try again.");
                }

                return;
            }
        }
        
        setScannedData(null);

        if (scannerRef.current) {
            scannerRef.current.start();
        }
    }

    const handleCloseErrMessage = () => {
        setErrorMessage(false);

        if (scannerRef.current) {
            scannerRef.current.start();
        }
    }

    return(
        <section className='grid grid-row-2 gap-y-5 md:gap-y-16 md:gap-x-20'>
            <Heading/>
            
            <div className="w-full h-96 flex flex-col items-center justify-center">
                <p className='mb-2 md:text-lg'>Please present your QR code</p>
                <video ref={videoRef} className="w-full h-full object-cover bg-[#000101]"></video>
            </div>

            {showPopup && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-bg p-12 rounded-lg shadow-lg w-80 text-center">
                        <p className='capitalize font-bold text-4xl'>Confirmation</p>
                        <br/>
                        <p className= "text-left">
                            <strong>BNT ID:</strong> <span>{scannedData.bnt_id}</span><br/>
                            <strong>Email:</strong> <span>{scannedData.email}</span><br/>
                            <strong>Fullname:</strong> <span>{scannedData.fullname}</span><br/>
                            <strong>School:</strong> <span>{scannedData.school}</span><br/>
                            <strong>School ID:</strong> <span>{scannedData.school_id}</span><br/>
                            <strong>Contact Number:</strong> <span>{scannedData.contact_number}</span><br/>
                            <strong>Food Allergies:</strong> <span>{scannedData.food_allergies}</span><br/>
                        </p>

                        <div className="flex justify-around mt-4">
                            <button className="bg-green-500 text-white px-4 py-2 rounded-lg" onClick={() => handleClosePopup(true)}>Correct</button>
                            <button className="bg-[#303030] text-white px-4 py-2 rounded-lg" onClick={() => handleClosePopup(true)}>Incorrect</button>
                        </div>
                        
                    </div>
                    
                </div>
            )}

            {errorMessage && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-bg p-12 rounded-lg shadow-lg w-80 text-center">
                        <p className="text-red-600 font-semibold text-justify">{errorMessage}</p>
                        <br/>
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg" onClick={handleCloseErrMessage}>Okay!</button>
                    </div>
                    
                </div>
            )}
        </section>
    )
}

export default RegistrationPage