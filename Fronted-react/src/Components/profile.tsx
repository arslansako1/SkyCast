import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import { API_ENDPOINTS } from "../Config/Urls";


export default function Profile(){
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [originalFirstName, setOriginalFirstName] = useState("");
    const [originalLastName, setOriginalLastName] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [noChanges, setNoChanges] = useState(false);

    console.log("Use states created");
    
    useEffect(() => {
        const storedUserData = localStorage.getItem("user");
        const userData = storedUserData ? JSON.parse(storedUserData) : null;

        if (userData){
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setEmail(userData.email || "");
        setRole(userData.roles || "");

        setOriginalFirstName(userData.firstName || "");
        setOriginalLastName(userData.lastName || "");
        setOriginalEmail(userData.email || "");

       } else{
        setError("No userData found");
       }  
     }, []);

    console.log("UseEffect runned");

    console.log("HandleSaveBtn about to run...");

    const handleSaveBtn = async(e: React.SubmitEvent<HTMLElement>) => {
        if (e) e.preventDefault();

        console.log("InHandleSaveBtn");

        const firstNameChange = firstName !== originalFirstName;
        const lastNameChange = lastName !== originalLastName;
        const emailChange = email !== originalEmail;

        if (!firstNameChange && !lastNameChange && !emailChange){
            console.log("No changes detected");
            setError("No changes to save");
            setNoChanges(true);
            return;
        }

        setError("");
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token){
            setError("You must be logged in");
            setLoading(false);
            return;
        }

        console.log("Creating userData..");

        try{
            const userData = {
                FirstName: firstName,
                LastName: lastName,
                Email: email
            };
            console.log("User data created: ", userData);

            console.log("API_ENDPOINTS.updateMe:", API_ENDPOINTS.updateMe);
            console.log("Token:", token);
            console.log("User data:", userData);

            const response = await fetch(API_ENDPOINTS.updateMe,{
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify(userData)
        });

            const text = await response.text();

            if (!response.ok){
                console.log("Response failed");
                setError("Response failed");
                throw new Error(text || "Response failed");
            };

            const data = JSON.parse(text);
            const storedUser = localStorage.getItem("user");
            const user = storedUser ? JSON.parse(storedUser) : null;
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.email = data.email;
            localStorage.setItem("user", JSON.stringify(user));


            console.log("Response data:", data);
            console.log("New FirstName:", data.firstName);
            console.log("New LastName:", data.lastName);
            console.log("New Email:", data.email);

            console.log("User updated successfully");
            setSaved(true);

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);

        }catch(error){
        console.log("Response failed: ", error);
        setError(error instanceof Error ? error.message : "error updating user");
    }  finally{
        setLoading(false);
    }
    } 



    return(
        <div className="dashboard-container">

            <div className="profile-section">
                <form onSubmit={handleSaveBtn}>
                    <h3>Your profile:</h3>

                     <label className="firstName">FirstName:</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>

                     <label className="lastName">LastName:</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}/>

                     <label>Email:</label>
                    <input type="text"  value={email} onChange={(e) => setEmail(e.target.value)}/>

                     <label>Role:</label>
                    <input type="text"  value={role} readOnly/>

                    <button type="submit" onClick={() => console.log("Clicked")}>{"Save"}</button>
                    {saved && <span>Profile updated successfully</span>}
                    {noChanges && <span>No changes detected</span>}

                </form>
                <div className="signup-link">
                 <Link to="/dashboard">Back to weather</Link>
                </div>

                <p className="mark">© 2026 SkyCast</p>

            </div>
        </div>
    )


    }

