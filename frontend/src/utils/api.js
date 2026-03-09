const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod";

function getToken() {
  return localStorage.getItem("cv_id_token");
}

async function request(method, path, body, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  post: (path, body) => request("POST", path, body),
  get: (path) => request("GET", path, null, true),
  authPost: (path, body) => request("POST", path, body, true),
  authDelete: (path, body) => request("DELETE", path, body, true),
  authPut: (path, body) => request("PUT", path, body, true),
};
