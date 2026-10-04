import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from "../Config/Urls";

export default function ResetPassword(){
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    
    useEffect(() => {
        console.log("Loading resetPassword components");
        const parms = new URLSearchParams(location.search);
        const tokenParam = parms.get("token");
        const emailParam = parms.get("email");

        console.log("Loaded")
        console.log("Token: ", tokenParam);
        console.log("Email: ", emailParam);

        if (tokenParam && emailParam){
            setToken(tokenParam);
            setEmail(emailParam);

        } else{
            console.error("Invalid reset link, please request a new one")
            setError("Invalid reset link, please request a new one");

        }

    }, [location])

    const handleSubmit = async (e) => {
        console.log("handleSubmit loaded");
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword){
            console.log("Password do not match");
            setError("Password do not match");
            setLoading(false);
            return;
        };

        if (newPassword.length < 6){
            console.log("Password must be atleast 6 characters");
            setError("Password must be atleast 6 characters");
            return;
        };

        const userData = {
            Email: email,
            NewPassword: newPassword,
            Token: token
        };

        console.log("User data created");
        
        console.log("Fetching a new password");
        try{
            const response = await fetch(API_ENDPOINTS.resetPassword, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)           
            });

            if (!response.ok){
                console.log("Reset failed");
                setError("Reset failed");
                throw new Error("Status: ", response.status);
            };

            const data = await response.json();
            console.log(data.message || "Reset failed");

            setMessage(data.message || "Password reseted successfully");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch(error){
            console.error("Reset password failed: ", error);
            setError(error.message || "Something went wrong, please try again");

        } finally{
            setLoading(false);
        }
    }
    if (!token || !email){
        return(
            <div className="login-container">
                <div className="login-card"></div>
                  <h1>Invalid link</h1>
                  <p>This reset link is invalid or expired</p>
                  <Link to="/forgetPassword">Request a new one</Link>

            </div>
        )
    }

    return(
        <div className="login-container">
            <div className="login-card">
                <h1>Reset password</h1>
                <p>Create a new password</p>

                {error && <div className="error-message">{error}</div>}

                {message && <div className="success-message">{message}</div>}

                <form onSubmit={handleSubmit}>

                    <div className="input">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} minLength={6} required/>
                    </div>

                     <div className="input">
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} minLength={6} required/>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>{loading ? "Reseting..." : "Reset password"}</button>
                </form>

                 <div className="login-link">
                    <Link to="/login">Login</Link>
                 </div>
                <p className="mark">© 2026 SkyCast</p>

            </div>
        </div>
    )
 

}