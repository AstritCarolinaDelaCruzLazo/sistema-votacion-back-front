import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({
    nombres: "", apellidos: "", email: "", celular: "",
    direccion: "", distrito: "", pass: "", pass2: ""
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const guardar = () => {
    if (!form.nombres || !form.apellidos || !form.email) {
      alert("Completa nombres, apellidos y correo."); return;
    }
    if (tab === "pass" && form.pass !== form.pass2) {
      alert("Las contraseñas no coinciden."); return;
    }
    localStorage.setItem("usuario", JSON.stringify(form));
    alert("Cambios guardados.");
    navigate("/");
  };

  return (
    <div className="container-fluid p-0" style={{ minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Barra superior (solo móvil) */}
      <div className="d-md-none border-bottom bg-white px-3 py-2 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <img src="/onpe.png" alt="ONPE" style={{ width: 28 }} />
          <span className="fw-semibold">Proceso de registro</span>
        </div>
        <div className="btn-group">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => navigate("/")}>Inicio</button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>Volver</button>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { logout(); navigate("/"); }}>Salir</button>
        </div>
      </div>

      <div className="row g-0">
        {/* Sidebar (md y superior) */}
        <aside className="col-md-3 col-lg-2 d-none d-md-flex flex-column bg-white border-end" style={{ minHeight: "100vh" }}>
          <div className="p-4 d-flex align-items-center gap-3">
            <img src="/onpe.png" alt="ONPE" style={{ width: 44 }} />
            <div className="fw-semibold">Proceso de registro</div>
          </div>

          <ul className="list-unstyled px-4 small text-muted flex-grow-1">
            <li className="mb-2">
              <button type="button" className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate("/")}>
                <i className="bi bi-house-door me-2" />Inicio
              </button>
            </li>
            <li className="mb-2">
              <button type="button" className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left-circle me-2" />Volver
              </button>
            </li>
            
          </ul>

          <div className="border-top p-4">
            <button type="button" className="btn btn-link p-0 text-decoration-none text-danger"
                    onClick={() => { logout(); navigate("/"); }}>
              <i className="bi bi-box-arrow-right me-2" />Salir
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="col-12 col-md-9 col-lg-10 p-3 p-md-4 p-lg-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
            <h3 className="fw-bold mb-0">REGISTRO</h3>

          </div>

          {/* Tabs */}
          <ul className="nav nav-pills mb-3">
            <li className="nav-item me-2">
              <button type="button"
                className={`nav-link ${tab === "info" ? "active" : ""}`}
                onClick={() => setTab("info")}
              >
                <i className="bi bi-person me-2" />
                Información personal
              </button>
            </li>
            <li className="nav-item">
              <button type="button"
                className={`nav-link ${tab === "pass" ? "active" : ""}`}
                onClick={() => setTab("pass")}
              >
                <i className="bi bi-lock me-2" />
                Contraseña
              </button>
            </li>
          </ul>

          {/* Contenido */}
          {tab === "info" ? (
            <div className="row g-3 mx-auto" style={{ maxWidth: 860 }}>
              <div className="col-12 col-md-6">
                <label className="form-label">Nombres</label>
                <input className="form-control" value={form.nombres} onChange={set("nombres")} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Apellidos</label>
                <input className="form-control" value={form.apellidos} onChange={set("apellidos")} />
              </div>
              <div className="col-12">
                <label className="form-label">Correo electrónico</label>
                <input type="email" className="form-control" placeholder="email@gmail.com"
                       value={form.email} onChange={set("email")} />
              </div>
              <div className="col-12">
                <label className="form-label">Número de celular</label>
                <input className="form-control" placeholder="+51 900 000 000"
                       value={form.celular} onChange={set("celular")} />
              </div>
              <div className="col-12">
                <label className="form-label">Dirección</label>
                <input className="form-control" value={form.direccion} onChange={set("direccion")} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Distrito</label>
                <input className="form-control" value={form.distrito} onChange={set("distrito")} />
              </div>
            </div>
          ) : (
            <div className="row g-3 mx-auto" style={{ maxWidth: 520 }}>
              <div className="col-12">
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-control" value={form.pass} onChange={set("pass")} />
              </div>
              <div className="col-12">
                <label className="form-label">Confirmar contraseña</label>
                <input type="password" className="form-control" value={form.pass2} onChange={set("pass2")} />
              </div>
            </div>
          )}

          <div className="mx-auto mt-4" style={{ maxWidth: 860 }}>
            <button type="button" className="btn btn-dark w-100" onClick={guardar}>Guardar cambios</button>
            
          </div>
        </main>
      </div>
    </div>
  );
}
