// src/pages/votacion.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Votacion() {
  const navigate = useNavigate();

  const candidatos = [
    { partido: "Alianza Progreso", nombre: "Julio Mendez",     logo: "/logos/alianza.png" },
    { partido: "Partido P",        nombre: "Nicola Rich",      logo: "/logos/partidoP.png" },
    { partido: "Nuevo Perú",       nombre: "Alejandro Torres", logo: "/logos/nuevoPeru.png" },
    { partido: "JP",               nombre: "María Pérez",      logo: "/logos/JP.png" },
    { partido: "Acción Popular",   nombre: "Luis Ramos",       logo: "/logos/accionPopular.png" },
    { partido: "Avanza País",      nombre: "Rocío Díaz",       logo: "/logos/avanzaPais.png" },
    { partido: "Somos Perú",       nombre: "Carlos Vega",      logo: "/logos/somosPeru.png" },
    { partido: "APP",              nombre: "Elena Rivas",      logo: "/logos/app.png" },
    { partido: "Renovación",       nombre: "Jorge Silva",      logo: "/logos/renovacion.png" },
    { partido: "Perú Libre",       nombre: "Ana Torres",       logo: "/logos/peruLibre.png" },
    { partido: "FrepapFrente Popular Agrícola FIA del Perú", nombre: "Sofía León", logo: "/logos/frepap.png" },
    { partido: "Podemos",          nombre: "Diego Ríos",       logo: "/logos/podemos.png" },
    { partido: "Patria Segura",    nombre: "Iván Molina",      logo: "/logos/patriaSegura.png" },
    { partido: "Victoria",         nombre: "Grecia Poma",      logo: "/logos/victoria.png" },
    { partido: "Frente Amplio",    nombre: "Rubén Soto",       logo: "/logos/fa.png" },
    { partido: "TCPP",             nombre: "Esther Ñique",     logo: "/logos/tcpp.png" },
  ];

  const irInicio = () => navigate("/");
  const salir = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('dni');
      localStorage.removeItem('face_verified');
      localStorage.removeItem('bio_verified');
      localStorage.removeItem('candidato');
    } catch {}
    // Usar replace para evitar volver con Back
    navigate('/', { replace: true });
  };

  const handleVotar = (c) => {
    localStorage.setItem("candidato", JSON.stringify(c));
    navigate("/confirmacion");
  };

  return (
    <div className="d-flex min-vh-100 app-surface">
      {/* Sidebar gris suave */}
      <aside className="sidebar-soft d-flex flex-column" style={{ width: 240 }}>
        <br />
        <div className="w-100 p-4">
          <h5 className="fw-bold text-uppercase mb-3" style={{ letterSpacing: 1, color: "#2b313a" }}>
            VOTACIÓN
          </h5>
          <div className="d-flex justify-content-center">
            <img
              src="/onpe.png"
              alt="ONPE"
              style={{ width: 100, borderRadius: 8, padding: 6 }}
            />
          </div>
        </div>

        <nav className="w-100 px-4">
          <button
            className="btn btn-link text-decoration-none d-flex align-items-center gap-2 px-0 mb-2"
            onClick={irInicio}
          >
            <i className="bi bi-house-door" />
            <span>Inicio</span>
          </button>

          <button
            className="btn btn-link text-decoration-none d-flex align-items-center gap-2 px-0 mb-2"
            onClick={salir}
          >
            <i className="bi bi-box-arrow-right" />
            <span>Salir</span>
          </button>
        </nav>

        <div className="mt-auto p-4 small" style={{ color: "#94a3b8" }}>© ONPE</div>
      </aside>

      {/* Contenido */}
      <main className="flex-grow-1">
        <br />
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="fw-bold display-6 mb-0" style={{ color: "#1f2329" }}>
              Seleccione el candidato de su preferencia
            </h1>
            <div className="d-none d-md-flex align-items-center gap-2">
              <span className="text-muted">Usuario NN</span>
              <a href="/reportes" className="btn btn-outline-primary btn-sm">Ver reportes</a>
            </div>
          </div>
          <br />
          <hr />
          <br />

          <div className="row mt-3">
            {candidatos.map((c, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3 mb-4">
                <div className="card h-100 shadow-sm">
                  <div
                    className="d-flex justify-content-center align-items-center logo-area"
                    style={{ height: 140 }}
                  >
                    <img
                      src={c.logo}
                      alt={c.partido}
                      style={{ maxHeight: 120, maxWidth: "90%", objectFit: "contain" }}
                    />
                  </div>
                  <div className="card-body">
                    <h6 className="mb-1">{c.partido}</h6>
                    <div className="text-muted mb-3" style={{ fontSize: 14 }}>{c.nombre}</div>
                    <button className="btn btn-primary w-100" onClick={() => handleVotar(c)}>
                      Seleccionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
