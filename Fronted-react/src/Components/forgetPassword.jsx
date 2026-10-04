import { useState } from "react";
import {Link} from 'react-router-dom';
import { API_ENDPOINTS } from "../Config/Urls";
import "./style.css";



export default function ForgetPassword(){
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    console.log("ForgetPassword component rendered");


    const handleSubmit = async e => {
        console.log("handleSubmit triggerd");
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");
        
        try{
            console.log("Sending to:", API_ENDPOINTS.forgetPassword);

            const response = await fetch(API_ENDPOINTS.forgetPassword, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email})
            });

            console.log("Response status: ", response.status);

            const data = await response.json();
            console.log("Parsed data: ", data);

            if (!response.ok){
                console.log(data.message || "Something went wrong");
                setError(data.message || "Something went wrong");
                throw new Error(data.message || "Something went wrong");
            }

            console.log("Success");
            setMessage(data.message || "Reset link sent to your email");
            setEmail("");

        } catch(error){
            console.error("Forget password error: ", error);
            setError(error.message || "Something went wrong, please try again");

        } finally{
            setLoading(false);
        };
    }

    

    return(
        <div className="login-container">
            <div className="login-card">
                <h1>SkyCast</h1>
                <h2>Password recovery</h2>
                <p>Enter your email to receive a reset link</p>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="input">

                    <input value={email} onChange = {(e) => setEmail(e.target.value)} type="text" placeholder="Enter your email" required disabled={loading}/>
                    <button type="submit" className="login-btn" disabled={loading}>{loading ? "Sending..." : "Send a reset link"}</button>

                  </div>
                </form>

                 <div className="login-link">
                    <Link to="/login">Back to login</Link>
                </div>

                <p className="mark">© 2026 SkyCast</p>

            </div>
        </div>
    )

}