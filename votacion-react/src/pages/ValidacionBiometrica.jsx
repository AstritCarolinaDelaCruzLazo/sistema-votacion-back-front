import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { webauthnRegisterOptions, webauthnRegisterVerify, webauthnAuthenticateStart, webauthnAuthenticateVerify, webauthnCodec } from "../services/api";

export default function BiometricVerification() {
  const [status, setStatus] = useState("");
  const [ok, setOk] = useState(false);
  const [supportsWebAuthn, setSupportsWebAuthn] = useState(true);
  const [platformAvailable, setPlatformAvailable] = useState(null); // null | boolean
  const navigate = useNavigate();

  // En este flujo simplificado, asumimos dispositivo ya registrado; foco en autenticación.

  const register = async () => {
    setStatus("Solicitando opciones de registro...");
    const reg = await webauthnRegisterOptions();
    const opts = reg.publicKey || reg; // backend devuelve { publicKey }
    // Adaptar campos a ArrayBuffer
    opts.challenge = webauthnCodec.b64urlToArrayBuffer(opts.challenge);
    if (opts.user && opts.user.id) {
      opts.user.id = webauthnCodec.b64urlToArrayBuffer(opts.user.id);
    }
    if (opts.excludeCredentials) {
      opts.excludeCredentials = opts.excludeCredentials.map(c => ({ ...c, id: webauthnCodec.b64urlToArrayBuffer(c.id) }));
    }
    const att = await navigator.credentials.create({ publicKey: opts });
    if (!att) throw new Error("No se obtuvo la attestation");
    const payload = {
      rawId: webauthnCodec.arrayBufferToB64url(att.rawId),
      clientDataJSON: webauthnCodec.arrayBufferToB64url(att.response.clientDataJSON),
      attestationObject: webauthnCodec.arrayBufferToB64url(att.response.attestationObject),
    };
    setStatus("Verificando registro...");
    const res = await webauthnRegisterVerify(payload);
    if (!res?.ok) throw new Error(res?.error || "Registro WebAuthn fallido");
    setStatus("Registro completado. Procediendo a autenticación...");
  };

  const authenticate = async () => {
    try {
      setStatus("Solicitando opciones de autenticación...");
      const resp = await webauthnAuthenticateStart(); // POST protegido por token DNI
      if (resp?.needRegistration) {
        // No hay credenciales, registrar y reintentar
        await register();
        // volver a pedir opciones de autenticación
        const retry = await webauthnAuthenticateStart();
        // usar retry como opts
        const opts = retry;
        opts.challenge = webauthnCodec.b64urlToArrayBuffer(opts.challenge);
        if (opts.allowCredentials) {
          opts.allowCredentials = opts.allowCredentials.map(c => ({ ...c, id: webauthnCodec.b64urlToArrayBuffer(c.id) }));
        }
        const assertion = await navigator.credentials.get({ publicKey: opts });
        if (!assertion) throw new Error("No se obtuvo la aserción");
        const payload = {
          id: assertion.id,
          type: assertion.type,
          rawId: webauthnCodec.arrayBufferToB64url(assertion.rawId),
          response: {
            authenticatorData: webauthnCodec.arrayBufferToB64url(assertion.response.authenticatorData),
            clientDataJSON: webauthnCodec.arrayBufferToB64url(assertion.response.clientDataJSON),
            signature: webauthnCodec.arrayBufferToB64url(assertion.response.signature),
            userHandle: assertion.response.userHandle ? webauthnCodec.arrayBufferToB64url(assertion.response.userHandle) : null
          }
        };
        setStatus("Verificando autenticación...");
        const res = await webauthnAuthenticateVerify(payload);
        if (res?.ok) {
          setOk(true);
          setStatus("Autenticación biométrica exitosa.");
          try { localStorage.setItem('bio_verified', '1'); } catch { /* ignore */ }
        } else {
          setOk(false); setStatus(res?.error || "Autenticación WebAuthn fallida.");
        }
        return;
      }
      // flujo normal si ya existen credenciales
      const opts = resp;
      opts.challenge = webauthnCodec.b64urlToArrayBuffer(opts.challenge);
      if (opts.allowCredentials) {
        opts.allowCredentials = opts.allowCredentials.map(c => ({ ...c, id: webauthnCodec.b64urlToArrayBuffer(c.id) }));
      }
      const assertion = await navigator.credentials.get({ publicKey: opts });
      if (!assertion) throw new Error("No se obtuvo la aserción");
      const payload = {
        id: assertion.id,
        type: assertion.type,
        rawId: webauthnCodec.arrayBufferToB64url(assertion.rawId),
        response: {
          authenticatorData: webauthnCodec.arrayBufferToB64url(assertion.response.authenticatorData),
          clientDataJSON: webauthnCodec.arrayBufferToB64url(assertion.response.clientDataJSON),
          signature: webauthnCodec.arrayBufferToB64url(assertion.response.signature),
          userHandle: assertion.response.userHandle ? webauthnCodec.arrayBufferToB64url(assertion.response.userHandle) : null
        }
      };
      setStatus("Verificando autenticación...");
      const res = await webauthnAuthenticateVerify(payload);
      if (res?.ok) {
        setOk(true);
        setStatus("Autenticación biométrica exitosa.");
        try { localStorage.setItem('bio_verified', '1'); } catch { /* ignore */ }
      }
      else { setOk(false); setStatus(res?.error || "Autenticación WebAuthn fallida."); }
    } catch (e) {
      console.error(e);
      setOk(false);
      // Mensajes comunes: 404 (sin credenciales), 401 (sesión inválida)
      setStatus(e?.response?.data?.error || e?.message || "Error en autenticación WebAuthn.");
    }
  };

  useEffect(() => {
    // Pre-chequeo de capacidades del dispositivo
    const hasWebAuthn = typeof window !== 'undefined' && 'PublicKeyCredential' in window;
    setSupportsWebAuthn(hasWebAuthn);
    if (hasWebAuthn && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setPlatformAvailable)
        .catch(() => setPlatformAvailable(false));
    } else {
      setPlatformAvailable(false);
    }
    // Lanza autenticación automática solo si hay soporte WebAuthn
    if (hasWebAuthn) {
      authenticate();
    } else {
      setStatus("Este navegador/dispositivo no soporta WebAuthn.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid vh-100 d-flex p-0">
      <div className="col-md-6 bg-dark text-white d-flex flex-column align-items-center justify-content-center">
        <div className="text-center p-4">
          <img src="/dactilar.png" alt="Biometría" style={{ width: 220, marginBottom: 24, background: "#fff", padding: 12 }} />
          <h4 className="mb-3">Verificación Biométrica (WebAuthn)</h4>
          {!supportsWebAuthn && (
            <div className="alert alert-danger">Este dispositivo/navegador no soporta autenticación WebAuthn.</div>
          )}
          {supportsWebAuthn && platformAvailable === false && (
            <div className="alert alert-warning">No se detectó un autenticador de plataforma (huella/FaceID). Conecta una llave de seguridad compatible o usa un dispositivo con biometría.</div>
          )}
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-outline-light" onClick={authenticate} disabled={!supportsWebAuthn}>
              Autenticar
            </button>
          </div>
          {!!status && <div className={`alert mt-3 ${ok ? 'alert-success' : 'alert-info'}`}>{status}</div>}
          {ok && <div className="alert alert-success mt-2">Biometría verificada.</div>}
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
        <div style={{ maxWidth: 520 }}>
          <h2 className="mb-3">Paso 2: Verificación Biométrica</h2>
          <p>Registra tu dispositivo o autentícate con WebAuthn (huella/Face ID/llave de seguridad).</p>
          <div className="mt-4 d-flex justify-content-center">
            <button className="btn btn-dark btn-lg px-4" disabled={!ok} onClick={() => navigate("/votacion")}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
