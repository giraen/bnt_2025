import { useEffect, useState } from "react";
import supabase from "../supabase-client";

const DashboardTable = ({refresh}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from("claim_lunch")
                    .select("fullname, claim_time")
                    .order("claim_time", { ascending: false })
                    .limit(10);

                if (error) {
                    console.error("An error occured: ", error);
                }

                setData(data);
            } catch (error) {
                console.error("An error occured: ", error);
            }
        }

        getUsers();
    }, [refresh])

    const time_formatter = (date_time) => {
        const date = new Date(date_time);
        return date.toLocaleString("en-PH", { 
            timeZone: "Asia/Manila",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    return(
        <>
            <table className="table-auto">
                <thead>
                    <tr>
                        <th className="col-span-1">Fullname</th>
                        <th className="col-span-2">Claimed at</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((data, index) => (
                        <tr key={index}>
                            <td className="p-2 row-span-1">{data.fullname}</td>
                            <td className="p-2">{time_formatter(data.claim_time)}</td>
                        </tr>
                    ))}
                    
                </tbody>
            </table>
        </>
    )
}

export default DashboardTable