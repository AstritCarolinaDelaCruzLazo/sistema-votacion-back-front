import { useEffect, useRef, useState } from "react";
import { verifyFace } from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function ValidacionFacial() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [dniFile, setDniFile] = useState(null);
  const [status, setStatus] = useState(null);
  const { setFaceVerified } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        setStatus("camara_error");
      }
    })();
    return () => {
      const s = videoRef.current?.srcObject;
      if (s) s.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(async (blob) => {
      if (!blob || !dniFile) return setStatus("falta_archivo");
      setStatus("verificando");
      try {
        const data = await verifyFace({ selfieFile: new File([blob], "selfie.jpg", { type: "image/jpeg" }), dniFile });
        if (data?.match) {
          setFaceVerified(true);
          setStatus("ok");
        } else {
          setFaceVerified(false);
          setStatus("rechazado");
        }
      } catch (e) {
        setStatus("error");
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="container p-4">
      <h2>Verificación facial</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <video ref={videoRef} autoPlay playsInline className="w-100 rounded border" />
          <div className="mt-2 d-flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setDniFile(e.target.files?.[0] || null)}
              className="form-control"
              title="Sube la foto del DNI"
            />
            <button onClick={capture} className="btn btn-success">Capturar y verificar</button>
          </div>
        </div>
        <div className="col-md-6">
          <canvas ref={canvasRef} className="w-100 rounded border" />
          <div className="mt-2">
            {status === "verificando" && <p>Verificando…</p>}
            {status === "ok" && <p className="text-success">Rostro coincide. Puedes continuar.</p>}
            {status === "rechazado" && <p className="text-danger">No coincide.</p>}
            {status === "error" && <p className="text-danger">Error del servidor.</p>}
            {status === "camara_error" && <p className="text-danger">No se pudo acceder a la cámara.</p>}
            {status === "falta_archivo" && <p className="text-warning">Sube la imagen del DNI.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
