import QrScanner from 'qr-scanner';
import supabase from "../supabase-client";
import { useEffect, useState, useRef } from "react";
import Heading from "../components/Heading";

const CommitteeFoodPage = () => {
    const videoRef = useRef(null);
    // const [scannedData, setScannedData] = useState(null);
    const scannerRef = useRef(null);

    const [message, setMessage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const validate_tupid = (qr_data) => {
        if (!qr_data.startsWith("TUPM-")){
            return false;
        }

        // segments = ["TUPM", "XX", "XXXXX"]
        let segments = qr_data.split("-");
        if (segments.length != 3) {
            return false;
        }

        // Check if year is valid length
        if (segments[1].length != 2 || isNaN(segments[1])) {
            return false;
        }
        
        // Check if unique id is valid length
        // Only for 4 or 5 lengths id
        if ((segments[2].length != 4 && segments[2].length != 5) || isNaN(segments[2])) {
            return false;
        }

        // Return true if it is a valid TUPM ID
        return true;
    }

    useEffect(() => {
        // Initialize QR scanner
        const scanner = new QrScanner(videoRef.current, async (result) => {
            try {
                const data = JSON.parse(result.data);
                
                if (validate_tupid(data)) {  
                    scanner.stop();

                    const { data:done_claiming } = await supabase
                        .from('claim_lunch_committee')
                        .select("tup_id")
                        .eq("tup_id", data);

                    if (done_claiming) {
                        setMessage("You have already claimed your lunch!");
                        setShowPopup(true);
                        return;
                    }

                    const { data, error } = await supabase
                        .from('claim_lunch_committee')
                        .insert([{ tup_id: data }])
                        .select();

                    if (error) {
                        console.error(error);
                    }
                } else {
                    setMessage("Different QR Detected!");
                    setShowPopup(true);
                }

                // setScannedData(data);
                console.log("Scanned Data: ", data);
                // setShowPopup(true);
            } catch (error) {
                console.error("Invalid QR Code format:", error);
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

    const handleClosePopup = () => {
        setMessage(null);
        setShowPopup(false);
    }

    return(
        <section>
            <button onClick={() => navigate("/")} className='flex px-28'>
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
                        <p className="px-4 py-4 text-2xl">
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </section>
    )
}

export default CommitteeFoodPage