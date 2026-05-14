import { useState } from "react";

const BASE_URL = "http://192.168.0.207:8000/api";

const METHODS = ["GET", "POST", "PUT", "DELETE"];

const METHOD_COLOR = {
  GET:    { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  POST:   { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  PUT:    { bg: "#fef9c3", text: "#a16207", border: "#fde047" },
  DELETE: { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
};

const PRESETS = [
  { label: "Login", method: "POST", endpoint: "/login", body: JSON.stringify({ email: "admin@example.com", password: "password" }, null, 2) },
  { label: "Register", method: "POST", endpoint: "/register", body: JSON.stringify({ name: "User Baru", email: "user@example.com", password: "password", password_confirmation: "password" }, null, 2) },
  { label: "Profile", method: "GET", endpoint: "/profile", body: "" },
  { label: "Dashboard Stats", method: "GET", endpoint: "/dashboard-stats", body: "" },
  { label: "Mood Stats", method: "GET", endpoint: "/mood-stats", body: "" },
  { label: "Save Mood", method: "POST", endpoint: "/moods", body: JSON.stringify({ mood: "happy", score: 8, catatan: "Hari yang menyenangkan" }, null, 2) },
  { label: "All Journals", method: "GET", endpoint: "/journals", body: "" },
  { label: "New Journal", method: "POST", endpoint: "/journals", body: JSON.stringify({ content: "Hari ini aku merasa...", mood: "calm" }, null, 2) },
  { label: "All Articles", method: "GET", endpoint: "/articles", body: "" },
  { label: "Recommended Articles", method: "GET", endpoint: "/my-recommended-articles", body: "" },
  { label: "Chat History", method: "GET", endpoint: "/chat-history", body: "" },
  { label: "Admin - Users", method: "GET", endpoint: "/admin/users", body: "" },
  { label: "Admin - Journals", method: "GET", endpoint: "/admin/journals", body: "" },
  { label: "Admin - Articles", method: "GET", endpoint: "/admin/articles", body: "" },
  { label: "Relaxation Session", method: "POST", endpoint: "/relaxation-sessions", body: JSON.stringify({ activity_name: "Meditasi", duration: 10 }, null, 2) },
];

function StatusBadge({ code }) {
  if (!code) return null;
  const ok = code >= 200 && code < 300;
  const warn = code >= 300 && code < 400;
  return (
    <span style={{
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      background: ok ? "#dcfce7" : warn ? "#fef9c3" : "#fee2e2",
      color: ok ? "#15803d" : warn ? "#a16207" : "#b91c1c",
      border: `1px solid ${ok ? "#86efac" : warn ? "#fde047" : "#fca5a5"}`,
    }}>
      {code} {ok ? "OK" : warn ? "Redirect" : "Error"}
    </span>
  );
}

export default function ApiTester() {
  const [method, setMethod]     = useState("GET");
  const [endpoint, setEndpoint] = useState("/profile");
  const [token, setToken]       = useState("");
  const [body, setBody]         = useState("");
  const [response, setResponse] = useState(null);
  const [status, setStatus]     = useState(null);
  const [time, setTime]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState("pretty");
  const [history, setHistory]   = useState([]);

  const fullUrl = `${BASE_URL}${endpoint}`;

  const applyPreset = (preset) => {
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    setBody(preset.body);
    setResponse(null);
    setStatus(null);
    setError(null);
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setError(null);

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const start = performance.now();
    try {
      const res = await fetch(fullUrl, {
        method,
        headers,
        ...(method !== "GET" && body ? { body } : {}),
      });

      const elapsed = Math.round(performance.now() - start);
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = text; }

      setStatus(res.status);
      setTime(elapsed);
      setResponse(parsed);
      setHistory((h) => [
        { method, endpoint, status: res.status, time: elapsed, ts: new Date().toLocaleTimeString() },
        ...h.slice(0, 9),
      ]);
    } catch (e) {
      setError(e.message);
      setTime(Math.round(performance.now() - start));
    } finally {
      setLoading(false);
    }
  };

  const mc = METHOD_COLOR[method];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      fontFamily: "'Courier New', 'Fira Code', monospace",
      color: "#e2e8f0",
    }}>

      {/* Top bar */}
      <div style={{
        background: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 8px #22c55e",
        }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", letterSpacing: "0.05em" }}>
          RUANGTENANG · API TESTER
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#475569" }}>
          {BASE_URL}
        </span>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 49px)" }}>

        {/* Sidebar — presets */}
        <div style={{
          width: 200,
          background: "#1e293b",
          borderRight: "1px solid #334155",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          <div style={{ padding: "12px 14px 6px", fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.1em" }}>
            QUICK PRESETS
          </div>
          {PRESETS.map((p) => {
            const c = METHOD_COLOR[p.method];
            return (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  borderBottom: "1px solid #0f172a",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: "1px 5px",
                  borderRadius: 4, background: c.bg, color: c.text,
                  border: `1px solid ${c.border}`, minWidth: 34, textAlign: "center",
                }}>
                  {p.method}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.3 }}>{p.label}</span>
              </button>
            );
          })}

          {/* History */}
          {history.length > 0 && (
            <>
              <div style={{ padding: "14px 14px 6px", fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", marginTop: 8 }}>
                HISTORY
              </div>
              {history.map((h, i) => {
                const ok = h.status >= 200 && h.status < 300;
                return (
                  <div key={i} style={{
                    padding: "7px 14px",
                    borderBottom: "1px solid #0f172a",
                    fontSize: 10,
                    color: "#64748b",
                  }}>
                    <span style={{ color: ok ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{h.status}</span>
                    {" · "}
                    <span style={{ color: "#94a3b8" }}>{h.method}</span>
                    {" · "}
                    <span>{h.time}ms</span>
                    <div style={{ color: "#334155", marginTop: 1 }}>{h.ts}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Request bar */}
          <div style={{
            padding: "16px 20px",
            background: "#1e293b",
            borderBottom: "1px solid #334155",
          }}>

            {/* Token */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "#475569", minWidth: 48 }}>TOKEN</span>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Bearer token (paste setelah login)..."
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  color: "#a78bfa",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Method + Endpoint + Send */}
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: mc.bg,
                  color: mc.text,
                  border: `1px solid ${mc.border}`,
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              >
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>

              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 8,
                overflow: "hidden",
                padding: "0 12px",
              }}>
                <span style={{ color: "#475569", fontSize: 12, whiteSpace: "nowrap" }}>{BASE_URL}</span>
                <input
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/endpoint"
                  style={{
                    flex: 1,
                    padding: "8px 6px",
                    background: "none",
                    border: "none",
                    color: "#f8fafc",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <button
                onClick={sendRequest}
                disabled={loading}
                style={{
                  padding: "8px 22px",
                  background: loading ? "#334155" : "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.03em",
                  transition: "background 0.15s",
                }}
              >
                {loading ? "..." : "SEND ▶"}
              </button>
            </div>
          </div>

          {/* Body input (non-GET) */}
          {method !== "GET" && (
            <div style={{
              padding: "12px 20px",
              background: "#1e293b",
              borderBottom: "1px solid #334155",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", marginBottom: 6 }}>
                REQUEST BODY (JSON)
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder='{ "key": "value" }'
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#a78bfa",
                  fontSize: 12,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  lineHeight: 1.6,
                }}
              />
            </div>
          )}

          {/* Response area */}
          <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
            {error && (
              <div style={{
                padding: 16, borderRadius: 10,
                background: "#450a0a", border: "1px solid #7f1d1d",
                color: "#fca5a5", fontSize: 13, marginBottom: 16,
              }}>
                ⚠ {error}
              </div>
            )}

            {response !== null && (
              <div>
                {/* Status row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <StatusBadge code={status} />
                  <span style={{ fontSize: 12, color: "#475569" }}>{time}ms</span>
                  <span style={{ fontSize: 12, color: "#475569" }}>·</span>
                  <span style={{ fontSize: 12, color: "#475569", fontFamily: "inherit" }}>{method} {endpoint}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(response, null, 2))}
                    style={{
                      marginLeft: "auto",
                      padding: "3px 10px",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "#94a3b8",
                      borderRadius: 6,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    copy
                  </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: "1px solid #334155" }}>
                  {["pretty", "raw"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background: "none",
                        border: "none",
                        borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                        color: activeTab === tab ? "#e2e8f0" : "#475569",
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: activeTab === tab ? 700 : 400,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Response body */}
                <pre style={{
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: 10,
                  padding: "16px 18px",
                  fontSize: 12,
                  lineHeight: 1.7,
                  overflowX: "auto",
                  color: "#a78bfa",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                }}>
                  {activeTab === "pretty"
                    ? JSON.stringify(response, null, 2)
                    : (typeof response === "string" ? response : JSON.stringify(response))}
                </pre>
              </div>
            )}

            {response === null && !error && !loading && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 10,
                color: "#334155",
              }}>
                <div style={{ fontSize: 36 }}>⬡</div>
                <div style={{ fontSize: 13 }}>Pilih preset atau ketik endpoint, lalu tekan SEND</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
