import QrScanner from 'qr-scanner';
import supabase from "../supabase-client";
import { useEffect, useState, useRef } from "react";
import Heading from "../components/Heading";
import { useNavigate } from "react-router-dom";
import DashboardTable from "../components/DashboardTable";

const AltCommitteeFoodPage = () => {
    const videoRef = useRef(null);
    // const [scannedData, setScannedData] = useState(null);
    const scannerRef = useRef(null);

    const [message, setMessage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [refreshTable, setRefreshTable] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Initialize QR scanner
        const scanner = new QrScanner(videoRef.current, async (result) => {
            try {
                const data = result.data.trim();
                console.log(result.data.trim())

                // Sanitize data to avoid SQL injection
                if (typeof data !== "string" || !data.startsWith("25-") || data.length !== 8) {
                    setMessage("Invalid QR code.");
                    return;
                }

                const split_data = data.split('-');
                scanner.stop();
                
                if (split_data.length !== 2 || split_data[0] !== '25' || split_data[1].length !== 5) {
                    setMessage("Invalid QR code.");
                    return;
                } 

                // Check bnt_id if it is in committee
                const { data: committeeMember, error: isCommitteeMember } = await supabase
                    .from("committee")
                    .select("bnt_id")
                    .eq("bnt_id", data)
                    .single();
                
                if (!committeeMember) {
                    setMessage("Incorrect QR Code");
                    return;
                }

                if (isCommitteeMember) {
                    setMessage('An error has occured.');
                    return;
                }

                // If lunch is not yet claimed, then insert their bnt_id
                const { data: insertClaim, error: insertClaimError } = await supabase
                    .from("altclaim_lunch_committee")
                    .insert([{ bnt_id: data }])
                    .select();
                
                if (insertClaimError) {
                    setMessage("Lunch already claimed");
                    return;
                }

                // Get the user's food allergy
                const { data: getFood, error: getFoodError } = await supabase
                    .from("committee")
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

    const handleClosePopup = () => {
        setMessage(null);
        setRefreshTable(prev => !prev);

        if (scannerRef.current) {
            scannerRef.current.start();
        }
    }

    return(
        <section className='grid grid-row-2 gap-y-5 md:gap-y-12 md:gap-x-20'>
            <button onClick={() => navigate("/")} className='flex px-4'>
                <a className="transition">&lt; Home</a>
            </button>

            <Heading custom_heading={"FOOD FOR COMMITTEE"}/>

            <div className="grid grid-cols-1 grid-rows-9 md:grid-cols-5 md:grid-rows-5 gap-2 w-full md:h-screen h-full">
                {/* Left div */}
                <div className="w-full h-96 flex flex-col items-center justify-center">
                    <p className='mb-2 md:text-lg'>Please present your Committee BNT ID</p>
                    <video ref={videoRef} className="h-full object-cover bg-[#000101]"></video>
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
                        <div className="px-4 py-4 text-2xl">
                            {message}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default AltCommitteeFoodPage