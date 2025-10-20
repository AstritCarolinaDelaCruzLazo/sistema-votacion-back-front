import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { verifyFace } from "../services/api";

export default function BarcodeVerification() {
  // Resultado opcional de verificación facial
  const [resultado, setResultado] = useState(null);
  const [dniNumero, setDniNumero] = useState("");
  const navigate = useNavigate();

  // Camera refs and state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamError, setStreamError] = useState("");
  const [selfieBlob, setSelfieBlob] = useState(null);
  const [dniBlob, setDniBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalVariant, setModalVariant] = useState("success"); // success | danger | warning

  useEffect(() => {
    // Read DNI inserted during login
    const storedDni = localStorage.getItem("dni");
    if (storedDni) setDniNumero(storedDni);
    const token = localStorage.getItem('token');
    if (!token) {
      // Forzar inicio de sesión antes de este paso
      navigate('/', { replace: true });
      return;
    }

    let currentStream;
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        console.error(e);
        setStreamError("No se pudo acceder a la cámara. Verifique permisos.");
      }
    }
    initCamera();
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Eliminado flujo de verificación de número de DNI

  const drawAndCapture = async (labelText) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // Draw frame
    ctx.drawImage(video, 0, 0, width, height);
    // Overlay DNI number/text
    if (labelText) {
      const padding = 12;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      const boxWidth = Math.min(width, 420);
      const boxHeight = 40;
      ctx.fillRect(padding, height - boxHeight - padding, boxWidth, boxHeight);
      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#00ff99";
      ctx.fillText(labelText, padding + 10, height - padding - 12);
    }

    return await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  };

  const onCaptureSelfie = async () => {
    const text = dniNumero ? `DNI: ${dniNumero}` : "SELFIE";
    const blob = await drawAndCapture(text);
    if (blob) setSelfieBlob(blob);
  };

  const onCaptureDNI = async () => {
    const text = dniNumero ? `DOC DNI: ${dniNumero}` : "DNI";
    const blob = await drawAndCapture(text);
    if (blob) setDniBlob(blob);
  };

  const onSendVerification = async () => {
    if (!selfieBlob || !dniBlob) {
      return alert("Primero capture la selfie y la foto del DNI.");
    }
    try {
      setUploading(true);
      const selfieFile = new File([selfieBlob], "selfie.jpg", { type: "image/jpeg" });
      const dniFile = new File([dniBlob], "dni.jpg", { type: "image/jpeg" });
      const resp = await verifyFace(selfieFile, dniFile);
      const verified = Boolean(resp?.verified);
      setResultado({ ok: verified, data: resp });
      if (verified) {
        try { localStorage.setItem('face_verified', '1'); } catch { /* ignore */ }
        setModalTitle("Verificación exitosa");
        setModalBody("Las imágenes coinciden. Continuando con la biometría...");
        setModalVariant("success");
        setModalOpen(true);
        // Redirigir tras una breve pausa
        setTimeout(() => navigate("/verificacion/biometrica"), 1200);
      } else {
        setModalTitle("No coincide");
        setModalBody("Las imágenes no coinciden. Por favor, vuelva a intentarlo.");
        setModalVariant("danger");
        setModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      if (status === 401) {
        setModalTitle("Sesión no válida");
        setModalBody("Tu sesión no es válida o expiró. Inicia sesión nuevamente.");
        setModalVariant("warning");
        setModalOpen(true);
      } else if (status === 501) {
        const msg501 = err?.response?.data?.error || "El servicio de verificación facial no está disponible.";
        setModalTitle("Servicio no disponible");
        setModalBody(msg501 + " (instala 'deepface' en el backend)");
        setModalVariant("warning");
        setModalOpen(true);
      } else {
        const msg = err?.response?.data?.error || "No se pudo verificar el rostro";
        setResultado({ ok: false, error: msg });
        setModalTitle("Error");
        setModalBody(msg);
        setModalVariant("danger");
        setModalOpen(true);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="container-fluid vh-100 d-flex p-0">
        {/* Left branding panel (icon & colors) */}
        <div className="col-md-6 bg-dark text-white d-flex flex-column align-items-center justify-content-center">
          <div className="text-center p-4">
            <img src="/dni.png" alt="DNI" style={{ width: 320, marginBottom: 24, background: "#fff", padding: 12 }} />
            <p className="mb-0 text-white-50">Captura tu selfie y una foto de tu documento para continuar.</p>
            {dniNumero && (
              <div className="mt-3 small text-white-50">DNI detectado del login: <b className="text-success">{dniNumero}</b></div>
            )}
          </div>
        </div>

        {/* Right camera & actions */}
        <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
          <div style={{ maxWidth: 640, width: "100%" }}>
            <h2 className="mb-3">Captura de Selfie y DNI</h2>
            <p>Se encenderá tu cámara. Captura tu selfie y luego la foto de tu DNI.</p>

            {streamError && (
              <div className="alert alert-danger mb-3">{streamError}</div>
            )}

            <div className="ratio ratio-4x3 bg-dark rounded overflow-hidden mb-3" style={{ maxWidth: 640 }}>
              <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="d-flex gap-2 mb-3">
              <button className="btn btn-outline-primary" onClick={onCaptureSelfie}>
                Capturar Selfie
              </button>
              <button className="btn btn-outline-secondary" onClick={onCaptureDNI}>
                Capturar DNI
              </button>
              <button className="btn btn-success ms-auto" onClick={onSendVerification} disabled={!selfieBlob || !dniBlob || uploading}>
                {uploading ? "Enviando..." : "Enviar a verificación"}
              </button>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <div className="border rounded p-2 text-center" style={{ minHeight: 160 }}>
                  <div className="small text-muted mb-1">Selfie capturada</div>
                  {selfieBlob ? (
                    <img alt="selfie" src={URL.createObjectURL(selfieBlob)} style={{ maxWidth: "100%", borderRadius: 6 }} />
                  ) : (
                    <div className="text-muted">Aún no capturada</div>
                  )}
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded p-2 text-center" style={{ minHeight: 160 }}>
                  <div className="small text-muted mb-1">Foto del DNI</div>
                  {dniBlob ? (
                    <img alt="dni" src={URL.createObjectURL(dniBlob)} style={{ maxWidth: "100%", borderRadius: 6 }} />
                  ) : (
                    <div className="text-muted">Aún no capturada</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3">
              {resultado && (
                <div className={`alert ${resultado.ok ? "alert-success" : "alert-danger"}`}>
                  {resultado.ok ? "Verificación facial enviada correctamente." : `Error: ${resultado.error}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Bootstrap-like (sin JS de Bootstrap) */}
      {modalOpen && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className={`modal-header ${modalVariant === 'success' ? 'bg-success text-white' : modalVariant === 'warning' ? 'bg-warning' : 'bg-danger text-white'}`}>
                  <h5 className="modal-title">{modalTitle}</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">{modalBody}</p>
                  {resultado?.data && resultado?.data?.distance !== undefined && (
                    <p className="mb-0 mt-2 small text-muted">Distancia: {String(resultado.data.distance)}</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}
