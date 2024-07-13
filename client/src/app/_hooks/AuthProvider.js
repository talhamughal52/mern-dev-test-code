"use client";
import axios from "axios";
import { useContext, createContext, useState, useEffect } from "react";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("mernTestToken") || ""
      : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginAction = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
        {
          email: data.email,
          password: data.password,
        }
      );
      if (res.status === 200) {
        const user = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
        };
        setUser(user);
        setToken(res.data.token);
        localStorage.setItem("mernTestToken", res.data.token);
        setLoading(false);
      }
    } catch (err) {
      setError(err.response.data.message);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setToken,
        loginAction,
        error,
        setError,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
