// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getToken, setToken, clearToken, loginDNI as apiLogin } from "../services/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTok] = useState(() => getToken());
  const [faceVerified, setFaceVerified] = useState(
    () => localStorage.getItem("face_verified") === "1"
  );
  const [bioVerified, setBioVerified] = useState(
    () => localStorage.getItem("bio_verified") === "1"
  );

  // Sincroniza flags en localStorage
  useEffect(() => {
    if (faceVerified) localStorage.setItem("face_verified", "1");
    else localStorage.removeItem("face_verified");
  }, [faceVerified]);

  useEffect(() => {
    if (bioVerified) localStorage.setItem("bio_verified", "1");
    else localStorage.removeItem("bio_verified");
  }, [bioVerified]);

  const loginDNI = async (dni) => {
    const res = await apiLogin(dni); // espera { token }
    if (res?.token) {
      setToken(res.token);
      setTok(res.token);
    }
    return res;
  };

  const logout = () => {
    clearToken();
    setTok(null);
    setFaceVerified(false);
    setBioVerified(false);
  };

  const value = useMemo(
    () => ({ token, loginDNI, logout, faceVerified, setFaceVerified, bioVerified, setBioVerified }),
    [token, faceVerified, bioVerified]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
