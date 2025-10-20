import React from "react";
import { Link } from "react-router-dom";

export default function NoAutorizado() {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <h1 className="display-5 fw-bold text-danger">No autorizado</h1>
        <p className="text-muted">No tienes permisos para acceder a esta página o no has completado los pasos requeridos.</p>
        <div className="mt-3">
          <Link to="/" className="btn btn-primary">Ir al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
}
