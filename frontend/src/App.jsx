import React, { useEffect, useState } from "react";
import { api, setToken } from "./api";

export default function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  // 1. Dodano brakujący stan dla kodu 2FA
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [token, setTok] = useState(localStorage.getItem("token") || "");

  const [entries, setEntries] = useState([]);
  const [msg, setMsg] = useState("");

  const [title, setTitle] = useState("");
  const [u, setU] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [pw, setPw] = useState("");

  useEffect(() => {
    setToken(token);
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  async function loadEntries() {
    try {
      const { data } = await api.get("/vault");
      setEntries(data);
    } catch (e) {
      setMsg("Błąd ładowania danych");
    }
  }

  useEffect(() => {
    if (token) loadEntries().catch((e) => setMsg(e?.response?.data?.error || "Load failed"));
  }, [token]);

  async function handleAuth() {
    setMsg("");
    try {
      if (mode === "register") {
        await api.post("/auth/register", { email, password });
        setMode("login");
        setMsg("Zarejestrowano. Zaloguj się.");
      } else {
        const { data } = await api.post("/auth/login", { email, password, twoFactorCode });
        setTok(data.token);
      }
    } catch (e) {
      setMsg(e?.response?.data?.error || "Błąd logowania");
    }
  }

  async function addEntry() {
    setMsg("");
    try {
      await api.post("/vault", { title, username: u, url, notes, password: pw });
      setTitle(""); setU(""); setUrl(""); setNotes(""); setPw("");
      await loadEntries();
    } catch (e) {
      setMsg(e?.response?.data?.error || "Add failed");
    }
  }

  async function delEntry(id) {
    await api.delete(`/vault/${id}`);
    await loadEntries();
  }

  async function reveal(id) {
    try {
      const { data } = await api.get(`/vault/${id}/reveal`);
      alert(`Hasło: ${data.password}`);
    } catch (e) {
      setMsg(e?.response?.data?.error || "Reveal failed");
    }
  }

  function logout() {
    setTok("");
    setEntries([]);
    setTwoFactorCode(""); 
  }

  if (!token) {
    return (
      <div className="wrap">
        <h1>PW Vault (MERN + Docker)</h1>
        <div className="card">
          <div className="row">
            <button className={mode==="login" ? "active":""} onClick={() => setMode("login")}>Logowanie</button>
            <button className={mode==="register" ? "active":""} onClick={() => setMode("register")}>Rejestracja</button>
          </div>

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Hasło</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === "login" && (
            <>
              <label>Kod 2FA (wpisz 123456)</label>
              <input 
                value={twoFactorCode} 
                onChange={(e) => setTwoFactorCode(e.target.value)} 
                placeholder="123456"
              />
            </>
          )}

          <button className="primary" onClick={handleAuth}>
            {mode === "register" ? "Utwórz konto" : "Zaloguj"}
          </button>
          {msg && <p className="msg">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <h1>PW Vault</h1>
        <button onClick={logout}>Wyloguj</button>
      </div>
      <div className="grid">
        <div className="card">
          <h2>Dodaj wpis</h2>
          <label>Tytuł *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <label>Login</label>
          <input value={u} onChange={(e) => setU(e.target.value)} />
          <label>URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} />
          <label>Notatki</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          <label>Hasło *</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button className="primary" onClick={addEntry} disabled={!title || !pw}>Zapisz</button>
          {msg && <p className="msg">{msg}</p>}
        </div>
        <div className="card">
          <h2>Twoje wpisy</h2>
          {entries.length === 0 ? <p className="muted">Brak wpisów</p> : (
            <ul className="list">
              {entries.map((e) => (
                <li key={e._id} className="item">
                  <div>
                    <b>{e.title}</b>
                    <div className="muted small">{e.username || "—"} {e.url ? ` • ${e.url}` : ""}</div>
                  </div>
                  <div className="row">
                    <button onClick={() => reveal(e._id)}>Pokaż</button>
                    <button className="danger" onClick={() => delEntry(e._id)}>Usuń</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}