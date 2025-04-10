import { useEffect, useState } from "react";
import supabase from "../supabase-client";

const DashboardTable = ({refresh}) => {
    const [data, setData] = useState([]);

    const getRole = (bnt_id) => {
        const bnt_id_split = bnt_id.split('-')[1];

        switch (bnt_id_split[0]) {
            case '0':
                return("Quizzer");
            case '1':
                return("Tester");
            case '2':
                const { data: getCommittee, error: getCommitteeErr } = supabase
                    .from('committee')
                    .select('committee')
                    .eq('bnt_id', bnt_id)
                    .single()
                
                if (getCommitteeErr) {
                    console.log(getCommitteeErr);
                }
                
                console.log(getCommittee);
                break; 
            case '3':
                return("Coach/Participant");
            default:
                return("Unknown");
        }
    }

    useEffect(() => {
        const getUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from("claim_lunch_participants")
                    .select(`
                        claim_time,
                        participants (bnt_id, fullname)
                    `)
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
                    <tr className="font-extrabold">
                        <th className="col-span-1">Role</th>
                        <th className="col-span-1">Fullname</th>
                        <th className="col-span-2">Claimed at</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((data, index) => (
                        <tr key={index}>
                            <td className="p-2 row-span-1">{getRole(data.participants.bnt_id)}</td>
                            <td className="p-2 row-span-1">{data.participants?.fullname}</td>
                            <td className="p-2">{time_formatter(data.claim_time)}</td>
                        </tr>
                    ))}
                    
                </tbody>
            </table>
        </>
    )
}

export default DashboardTable