import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS } from "../Config/Urls";

export default function AdminUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalRole, setOriginalRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [noChanges, setNoChanges] = useState(false);

  console.log("Use states craeted successfully");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setError("");

    const fetchUser = async () => {
      console.log("Full URL:", `${API_ENDPOINTS.getUser}/${userId}`);

      try {
        const response = await fetch(`${API_ENDPOINTS.getUser}/${userId}`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (!response.ok) {
          console.log("failed to get user");
          setError("Failed to get user");
          throw new Error("Failed to get user");
        }

        const data = await response.json();
        console.log("userData: ", data);

        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        if (Array.isArray(data.roles)) {
          setRole(data.roles[0] || "User");
        } else if (data.role) {
          setRole(data.role);
        } else {
          setRole("User");
        }

        setOriginalFirstName(data.firstName || "");
        setOriginalLastName(data.lastName || "");
        setOriginalEmail(data.email || "");
        if (Array.isArray(data.roles)) {
          setOriginalRole(data.roles[0] || "User");
        } else if (data.role) {
          setOriginalRole(data.role);
        } else {
          setOriginalRole("User");
        }


        setLoading(false);
      } catch (error) {
        console.error("Error fetching user: ", error.message);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

const handleSaveBtn = async (e) => {
  if (e) e.preventDefault();

  console.log("InHandleSaveBtn");

  setError("");
  setSaving(true);

    const firstNameChange = firstName !== originalFirstName;
    const lastNameChange =  lastName !== originalLastName;
    const emailChange = email !== originalEmail;
    const roleChange = role !== originalRole;

    if (!firstNameChange && !lastNameChange && !emailChange && !roleChange){
        console.log("No changes detected");
         setError("No changes to save");
          setNoChanges(true);
          return;
        }


  const token = localStorage.getItem("token");
  if (!token) {
    setError("You must be logged in");
    setSaving(false);
    return;
  }

  console.log("Creating userData..");

  try {
    const userData = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Role: role 
    };
    
    console.log("User data created: ", userData);

    const response = await fetch(`${API_ENDPOINTS.updateUser}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(userData),
    });

    const text = await response.text();

    if (!response.ok) {
      console.log("Response failed with status:", response.status);
      setError(`Update failed: ${text}`);
      throw new Error(text || "Response failed");
    }

    const data = JSON.parse(text);

    console.log("Response data:", data);
    console.log("New FirstName:", data.firstName);
    console.log("New LastName:", data.lastName);
    console.log("New Email:", data.email);
    
    const newRole = data.roles ? data.roles[0] : "No role";
    console.log("New Role:", newRole);

    console.log("User updated successfully");
    setNoChanges(false);
    setSaved(true);

    setTimeout(() => {
      navigate("/usersManagement");
    }, 2000);
  } catch (error) {
    console.log("Response failed: ", error);
    setError(error.message);
  } finally {
    setSaving(false);
  }
};
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="profile-section">
          <h3>Loading user profile...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="profile-section">

        <form onSubmit={handleSaveBtn}>
          <label>FirstName:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label>LastName:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label>Email:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>

          <button type="submit">Save</button>
           {saved && <span>Profile updated successfully</span>}
           {noChanges && <span>No changes detected</span>}
        </form>

        <div className="signup-link">
          <Link to="/usersManagement">Back to users</Link>
        </div>
        
        <p className="mark">© 2026 SkyCast</p>

      </div>
    </div>
  );
}
