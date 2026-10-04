import { useState } from "react";
import { Link } from 'react-router-dom'
import { API_ENDPOINTS } from "../Config/Urls";
import "./style.css";

export default function AdminSignup(){
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [adminKey, setAdminKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();

        setError("");
        setSuccess(false);

        if (password !== confirmPassword){
            setError("Password does not match");
            return;
        };

        setLoading(true);

        try{

            const userData = {
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                Password: password,
                ConfirmPassword: confirmPassword,
                AdminSecretKey: adminKey
            };

            console.log("Admin ser data is created");

            const response = await fetch(API_ENDPOINTS.adminSignup,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                   body: JSON.stringify(userData)
            });

            const text = await response.text();

            if (!response.ok){

                try{

                const textData = JSON.parse(text);

                if(textData.errors){
                const errorMessages = [];
                for (const [field, message] of Object.entries(textData.errors)){
                    errorMessages.push(`${field}: ${message.join(', ')}`);
                }
                setError(errorMessages.join('\n')); 
                throw new Error(errorMessages.join('\n'));

            } else{

                setError(textData.message || "Signup failed")
                throw new Error(textData.message || "Signup failed");

            }
                } catch{

                    setError(text || "Signup failed");
                    throw new Error(text || "Signup failed");
                }


            };

            const data =  JSON.parse(text);

            setSuccess(true);
            console.log("Signup success");

            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);

        } catch(error){
            console.error("Admin Signup error", error);

            if (!error){
            setError("Admin signup failed");
            }

        } finally{
            setLoading(false);
        }
    }

    return(
        <div className = "admin-signup-container">
            <div className="admin-signup-card">
                <h1>SkyCast</h1>
                <h2>Admin signup</h2>

                {error && (<div className="error-message">{error}</div>)}
                {success && (<div className="success-message">Success! admin account created</div>)}
                 
                 <form onSubmit={handleSubmit}>

                    <div className="input">
                        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                    </div>

                    <div className="input">
                        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)}/>
                    </div>

                    <div className="input">
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>

                    <div className="input">
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
                    </div>

                    <div className="input">
                        <input type="password" placeholder="Confirm passowrd" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                    </div>

                    <div className="input">
                        <input type="password" placeholder="AdminKey" value={adminKey} onChange={e => setAdminKey(e.target.value)}/>
                    </div>

                    <button type="submit" className="admin-signup-btn" disabled={loading || success}> {loading ? "Creating admin account" : "Signup as admin"} </button>

                 </form>

                 <div className="login-link">
                    Already have account? <Link to="/login">Login</Link>
                 </div>

                 <div className="signup-link">
                    Signup <Link to="/signup">signup</Link>
                 </div>

                <p className="mark">© 2026 SkyCast</p>

            </div>
        </div>
    )
}