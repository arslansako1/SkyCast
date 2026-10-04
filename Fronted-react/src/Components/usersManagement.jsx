import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../Config/Urls";
import Popup from "./popup";

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [popupMessage, setIsPopupMessage] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    console.log("Authorization header:", "Bearer " + token);
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchAllUsers = async (e) => {
      setError("");

      console.log("Fetching:", API_ENDPOINTS.getAllUsers);

      try {
        const response = await fetch(API_ENDPOINTS.getAllUsers, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (!response.ok) {
          console.log("Failed to fetch all users");
          setError("Failed to fetch all users");
          throw new Error("Failed to fetch all users");
        }

        const data = await response.json();
        console.log("Users: ", data);
        setUsers(data);
      } catch (error) {
        console.log("Error fetching users: ", error);
        setUsers(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const handleEditBtn = async (userId) => {
    navigate(`/adminUserProfile/${userId}`);
  };

  const handleDeleteBtn = async (userId) => {
    setError("");

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_ENDPOINTS.deleteUser}/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (response.status === 204) {
        console.log("User deleted successfully");

        setUsers(users.filter((user) => user.id !== userId));
      } else if (response.status === 404) {
        console.log("User not found");
      } else {
        const text = await response.text();
        throw new Error(text || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user: ", error.message);
      alert("Failed to delete user: ", error.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h3>Loading all users...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h3>{error}</h3>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div>
        <h3>Users:</h3>
        <div className="user-list-container">
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            users.map((user) => (
              <div className="user-item-row" key={user.id}>
                <input
                  type="text"
                  value={`${user.firstName} ${user.lastName}`}
                  className="user-input"
                  readOnly
                />
                <button
                  className="yellow-btn"
                  onClick={() => handleEditBtn(user.id)}
                >
                  Edit
                </button>
                <button
                  className="red-btn"
                  onClick={() => {
                    setIsPopupMessage(
                      "Are you sure you want to delete this user?",
                    );
                    setIsConfirmOpen(true);
                    setUserId(user.id);
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
        <div className="signup-link">
          <Link to="/dashboard">back to dashboard</Link>
        </div>
      </div>
      <p className="mark">© 2026 SkyCast</p>

      {isConfirmOpen && (
        <Popup
          message={popupMessage}
          onConfirm={() => {
            handleDeleteBtn(userId);
            setIsConfirmOpen(false);
          }}
          onCancel={() => setIsConfirmOpen(false)}
          type="confirm"
        />
      )}
    </div>
  );
}
