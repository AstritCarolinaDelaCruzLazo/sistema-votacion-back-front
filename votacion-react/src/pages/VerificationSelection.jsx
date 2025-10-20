import React from "react";
import { useNavigate } from "react-router-dom";

export default function VerificationSelection() {
  const navigate = useNavigate();
  return (
    <div className="container my-5">
      <h3>Validación de identidad</h3>
      <p className="text-muted">Seleccione un método de verificación.</p>
      <div className="row g-3 mt-3">
        <div className="col-12 col-md-4">
          <div className="card p-3 h-100">
            <h5>Código de DNI (barcode)</h5>
            <p>Apunte el código a la cámara y continúe.</p>
            <button className="btn btn-dark mt-auto" onClick={()=>navigate("/verificacion/barcode")}>Continuar</button>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card p-3 h-100">
            <h5>Biometría</h5>
            <p>Huella o palma frente a la cámara (simulado).</p>
            <button className="btn btn-dark mt-auto" onClick={()=>navigate("/verificacion/biometrica")}>Continuar</button>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card p-3 h-100">
            <h5>Rostro</h5>
            <p>Reconocimiento facial con liveness (simulado).</p>
            <button className="btn btn-dark mt-auto" onClick={()=>navigate("/verificacion/rostro")}>Continuar</button>
          </div>
        </div>
      </div>
      <button className="btn btn-link mt-3" onClick={()=>navigate(-1)}>Volver</button>
    </div>
  );
}
