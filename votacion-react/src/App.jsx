import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerificationSelection from "./pages/VerificationSelection";
import ValidacionDNI from "./pages/ValidacionDNI";
import ValidacionBiometrica from "./pages/ValidacionBiometrica";
import Votacion from "./pages/votacion";
import Confirmacion from "./pages/confirmation";
import Reportes from "./pages/reportes";
import NoAutorizado from "./pages/NoAutorizado";
import ProtectedRoute from "./auth/ProtectedRoute";
import StepGuard from "./auth/StepGuard";
import BioGuard from "./auth/BioGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/verificacion" element={<VerificationSelection />} />
      <Route path="/verificacion/dni" element={<ValidacionDNI />} />
      <Route
        path="/verificacion/biometrica"
        element={
          <ProtectedRoute>
            <StepGuard>
              <ValidacionBiometrica />
            </StepGuard>
          </ProtectedRoute>
        }
      />
      <Route path="/verificacion/rostro" element={<Navigate to="/votacion" replace />} />
      <Route path="/votacion" element={<ProtectedRoute><BioGuard><Votacion /></BioGuard></ProtectedRoute>} />
      <Route path="/confirmacion" element={<ProtectedRoute><BioGuard><Confirmacion /></BioGuard></ProtectedRoute>} />
      <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />
    </Routes>
  );
}
