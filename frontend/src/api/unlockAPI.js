import api from "../helpers/axiosInstance";

export async function verifyUnlockCode({ code, usuarioId, nombre }) {
  const { data } = await api.post("/unlock/verify", { code, usuarioId, nombre });
  return data; // { ok: boolean, scope: 'master'|'user', resetDownloads: true }
}

