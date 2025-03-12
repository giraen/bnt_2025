import Heading from "../components/Heading";
import { useState } from "react";

const AltRegistrationPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        fullname: "",
        affiliated_school: "",
        contact_number: "",
        food_allergies: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const scriptUrl = import.meta.env.VITE_SHEETS_URL;

        try {
            const response = await fetch(scriptUrl, {
                method: "POST",
                body: JSON.stringify(formData),
                mode: "no-cors",
            })

            
        } catch (error) {
            console.error("Error:", error);
            alert("Error submitting form.");
        }
    };

    return(
        <section className='grid grid-row-2 gap-y-5 md:gap-y-12 md:gap-x-20'>
            <Heading/>

            <form  className="text-left" onSubmit={handleSubmit}>
                <fieldset className="flex flex-col gap-y-2">
                    <div>
                        <label htmlFor="email" className="font-bold mr-2.5">Email: </label>
                        <input type="email" name="email" id="email" required onChange={handleChange} placeholder="example@email.com" className="w-full px-2 border bg-input border-gray-300 rounded-sm focus:ring focus:ring-blue-300 text-black"/>
                    </div>
                    
                    <div>
                        <label htmlFor="fullname" className="font-bold">Full Name: </label>
                        <input type="text" name="fullname" id="fullname" required onChange={handleChange} placeholder="Dela Cruz, Juan A." className="w-full px-2 border bg-input border-gray-300 rounded-sm focus:ring focus:ring-blue-300 text-black"/>
                    </div>

                    <div>
                        <label htmlFor="affiliated_school" className="font-bold">School: </label>
                        <input type="text" name="affiliated_school" id="school" required onChange={handleChange} placeholder="Technological University of the Philippines - Manila" className="w-full px-2 border bg-input border-gray-300 rounded-sm focus:ring focus:ring-blue-300 text-black"/>
                    </div>

                    <div>
                        <label htmlFor="contact_number" className="font-bold">Contact Number: </label>
                        <input type="tel" name="contact_number" id="contact_number" required onChange={handleChange} pattern="[0-9]{11}" maxLength="11" placeholder="09123456789" className="w-full px-2 border bg-input border-gray-300 rounded-sm focus:ring focus:ring-blue-300 text-black"/>
                    </div>
                    
                    <div>
                        <label htmlFor="food_allergies" className="font-bold">Food Allergies: </label>
                        <input type="text" name="food_allergies" id="food_allergies" required onChange={handleChange} placeholder="Please enter your food allergies" className="w-full px-2 border bg-input border-gray-300 rounded-sm focus:ring focus:ring-blue-300 text-black"/>
                    </div>
                    
                    <button type="submit">Submit</button>
                </fieldset>
            </form>
        </section>
    )
}

export default AltRegistrationPage