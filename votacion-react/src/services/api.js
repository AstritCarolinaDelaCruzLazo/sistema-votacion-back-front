// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, ""),
  withCredentials: true,
});

// ===== Token helpers =====
export function setToken(t) { localStorage.setItem("dni_token", t); }
export function getToken() { return localStorage.getItem("dni_token"); }
export function clearToken() { localStorage.removeItem("dni_token"); }

API.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `DNI ${t}`;
  return config;
});

// ===== Endpoints =====
export async function loginDNI(dni) {
  const { data } = await API.post("/login-dni/", { dni });
  if (data?.token) setToken(data.token);
  return data; // { token }
}

// Alias requerido por Login.jsx
export async function loginWithDni(dni) {
  return loginDNI(dni);
}

export async function verifyDNI(numero) {
  const { data } = await API.get("/dni/", { params: { numero } });
  return data; // { valido: bool, ... }
}

export async function verifyFace({ selfieFile, dniFile }) {
  const fd = new FormData();
  fd.append("selfie", selfieFile);
  fd.append("dni_img", dniFile);
  const { data } = await API.post("/face-verify/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { match: bool, score: number }
}

export default API;

// ===== WebAuthn helpers =====
export const webauthnCodec = {
  toB64Url(buf) {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  },
  fromB64Url(s) {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  },
};

// Serializa credenciales WebAuthn a JSON seguro
function credentialToJSON(cred) {
  if (!cred) return null;
  const { id, type, rawId, response } = cred;
  const out = {
    id,
    type,
    rawId: webauthnCodec.toB64Url(rawId),
    response: {},
  };
  if (response.attestationObject)
    out.response.attestationObject = webauthnCodec.toB64Url(response.attestationObject);
  if (response.clientDataJSON)
    out.response.clientDataJSON = webauthnCodec.toB64Url(response.clientDataJSON);
  if (response.authenticatorData)
    out.response.authenticatorData = webauthnCodec.toB64Url(response.authenticatorData);
  if (response.signature)
    out.response.signature = webauthnCodec.toB64Url(response.signature);
  if (response.userHandle)
    out.response.userHandle = webauthnCodec.toB64Url(response.userHandle);
  return out;
}

// ===== WebAuthn API =====
// Ajusta las rutas si tu backend usa otras (ej.: /api/webauthn/*).
const WA_BASE = "/webauthn";

export async function webauthnRegisterOptions() {
  const { data } = await API.post(`${WA_BASE}/register/options`);
  // Si llegan ArrayBuffers en base64url, conviértelos a Uint8Array:
  if (data?.publicKey?.challenge) {
    data.publicKey.challenge = webauthnCodec.fromB64Url(data.publicKey.challenge);
  }
  if (data?.publicKey?.user?.id) {
    data.publicKey.user.id = webauthnCodec.fromB64Url(data.publicKey.user.id);
  }
  return data;
}

export async function webauthnRegisterVerify(credential) {
  const payload = credentialToJSON(credential);
  const { data } = await API.post(`${WA_BASE}/register/verify`, payload);
  return data; // { ok: true }
}

export async function webauthnAuthenticateStart() {
  const { data } = await API.post(`${WA_BASE}/authenticate/options`);
  if (data?.publicKey?.challenge) {
    data.publicKey.challenge = webauthnCodec.fromB64Url(data.publicKey.challenge);
  }
  if (Array.isArray(data?.publicKey?.allowCredentials)) {
    data.publicKey.allowCredentials = data.publicKey.allowCredentials.map((c) => ({
      ...c,
      id: webauthnCodec.fromB64Url(c.id),
    }));
  }
  return data;
}

export async function webauthnAuthenticateVerify(credential) {
  const payload = credentialToJSON(credential);
  const { data } = await API.post(`${WA_BASE}/authenticate/verify`, payload);
  return data; // { ok: true }
}
