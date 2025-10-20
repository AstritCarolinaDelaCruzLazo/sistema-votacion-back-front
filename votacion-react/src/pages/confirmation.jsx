import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Confirmacion() {
  const navigate = useNavigate();
  const [candidato, setCandidato] = useState(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("candidato") || "null");
    setCandidato(c);
  }, []);

  const confirmar = () => {
    // guarda voto en localStorage para reportes
    const votos = JSON.parse(localStorage.getItem("votos") || "[]");
    votos.push({
      partido: candidato?.partido ?? "N/D",
      nombre: candidato?.nombre ?? "N/D",
      ts: Date.now(),
    });
    localStorage.setItem("votos", JSON.stringify(votos));
    setOk(true);
  };

  const salir = () => {
    // intenta cerrar ventana; si el navegador lo bloquea, vuelve al inicio
    window.close();
    navigate("/", { replace: true });
  };

  if (!candidato) {
    return (
      <div className="container py-5 text-center">
        <p>No hay candidato seleccionado.</p>
        <button className="btn btn-secondary" onClick={() => navigate("/votacion")}>
          Volver a Votación
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <br />
      <div className="-flex justify-content-center align-items-center mb-3 gap-3">
        <h2 className="fw-bold text-center fs-3 mb-0"style={{ color: "#1f2329" }}>Oficina Nacional de Procesos Electorales</h2>
        <div>
          <div className="text-center"></div>
      </div>
    </div>
    <br />

    
      {/* Mensaje de éxito cuando se confirma */}
      {ok && (
        <div className="text-center mb-3">
          <h4 className="fw-bold" style={{ color: "#c1121f" }}>
            Sufragación exitosa
          </h4>
        </div>
      )}

      <div className="d-flex justify-content-center mb-4">
        <div className="card shadow-sm" style={{ maxWidth: 420, width: "100%" }}>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: 180, background: "#f3f4f6" }}
          >
            {candidato.logo && (
              <img
                src={candidato.logo}
                alt={candidato.partido}
                style={{ maxHeight: 140, maxWidth: "90%", objectFit: "contain" }}
              />
            )}
          </div>
          <div className="card-body text-center">
            <div className="fw-semibold">{candidato.partido}</div>
            <div className="text-muted">{candidato.nombre}</div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-3">
        {!ok ? (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/votacion")}
            >
              Cambiar candidato
            </button>
            <button className="btn btn-success" onClick={confirmar}>
              Confirmar
            </button>
          </>
        ) : (
          <button className="btn btn-dark" onClick={salir}>
            Salir
          </button>
        )}
      </div>
    </div>
  );
}
