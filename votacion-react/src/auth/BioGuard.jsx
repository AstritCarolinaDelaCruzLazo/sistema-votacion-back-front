import { Navigate, useLocation } from "react-router-dom";

export default function BioGuard({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const bioVerified = localStorage.getItem("bio_verified") === "1";

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  if (!bioVerified) {
    return <Navigate to="/verificacion/biometrica" replace state={{ from: location }} />;
  }
  return children;
}
