import { useState } from "react";
import { Link } from 'react-router-dom'
import "./style.css";
import { API_ENDPOINTS } from "../Config/Urls";

export default function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault()

        setError("");
        setLoading(true);

        try{
            const userData = {
                Email: email,
                Password: password
            };
            console.log("User data created");

            const response = await fetch(API_ENDPOINTS.login,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const text =  await response.text();

            if (!response.ok){
                setError("Invalid email or password");
                throw new Error(text || "Invalid email or password")

            }

            const data = JSON.parse(text);
            console.log("Login success");

            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("user", JSON.stringify({
            UserId: data.userId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roles: data.roles
        }));

        console.log(JSON.stringify({
            UserId: data.userId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            roles: data.roles}));

            window.location.href = "/dashboard";


            } catch(error){
                console.error("Login error", error);
                setError("Invalid email or password");          
                

            } finally{
                setLoading(false);
            };
    };

    return(
        <div className="login-container">
            <div className="login-card">
                <h1>SkyCast</h1>
                <h2>Login</h2>

                {error && (<div className="error-message">{error}</div>)}

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>

                    <div className="input-group">
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    
                <button type="submit" className="login-btn" disabled={loading}> {loading ? "Logging in.." : "Login"}</button>

                </form>

                <p className="signup-link">
                    <Link to="/forgetPassword">Forget Password?</Link>
                </p>

                <p className="signup-link">
                    Dont have an account? <Link to="/signup">Signup</Link>
                </p>

                <p className="admin-link">
                    Admin? <Link to="/adminSignup">Admin signup</Link>
                </p>

                <p className="mark">© 2026 SkyCast</p>


            </div>
        </div>
    )
}