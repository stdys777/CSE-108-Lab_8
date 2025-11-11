import React, { useEffect, useState } from "react";

export default function StudentPage() {
  const [me, setMe] = useState(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/current-user", { credentials: "include" })
      .then(r => {
        if (r.status === 401) return null;
        return r.json();
      })
      .then(data => {
        setMe(data || null);
        setBooting(false);
      })
      .catch(() => {
        setError("Error");
        setBooting(false);
      });
  }, []);

  if (booting) return <p>Loading</p>;
  if (!me) return <Login onLogin={setMe} error={error} />;

  return (
    <div>
      <h2>Welcome {me.full_name}</h2>
      <button
        onClick={() => {
          fetch("/api/logout", { method: "POST", credentials: "include" })
            .then(() => setMe(null))
            .catch(() => alert("Logout failed"));
        }}
      >Logout</button>

      <StudentDashboard />
    </div>
  );
}

function Login({ onLogin, error }) {
  const [user, setUser] = useState("");
  const [password, setPass] = useState("");
  const [msg, setMsg] = useState(error);

  function handLog() {
    setMsg("");
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
      credentials: "include"
    })
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok || !j.success) throw new Error(j.message || "Invalid credentials");
        onLogin(j.user);
      })
      .catch(e => setMsg(e.message));
  }

  return (
    <div>
      <h2>Student Login</h2>
      <label>Username</label>
      <input value={user} onChange={e => setUser(e.target.value)} />
      <br />
      <label>Password</label>
      <input type="password" value={password} onChange={e => setPass(e.target.value)} />
      <br />
      {msg && <p>{msg}</p>}
      <button onClick={handLog}>Login</button>
    </div>
  );
}

function StudentDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function loadData() {
    fetch("/api/my-courses", { credentials: "include" })
      .then(r => r.json())
      .then(setMyCourses)
      .catch(() => setError("Failed to load your courses"));

    fetch("/api/courses", { credentials: "include" })
      .then(r => r.json())
      .then(setAllCourses)
      .catch(() => setError("Failed to load all courses"));
  }

  useEffect(() => { loadData(); }, []);

  function enroll(courseId) {
    setBusy(true);
    fetch(`/api/enroll/${courseId}`, { method: "POST", credentials: "include" })
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok || !j.success) throw new Error(j.message);
        loadData();
      })
      .catch(e => alert(e.message))
      .finally(() => setBusy(false));
  }

  const myIds = new Set(myCourses.map(c => c.id));

  return (
    <div>
      <h3>Your Courses</h3>
      {myCourses.length === 0 ? (
        <p>You are not enrolled in any classes yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Teacher</th>
              <th>Schedule</th>
              <th>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {myCourses.map(c => (
              <tr key={c.id}>
                <td>{c.course_code}</td>
                <td>{c.course_name}</td>
                <td>{c.teacher_name}</td>
                <td>{c.time_schedule}</td>
                <td>{c.enrolled}/{c.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Available Courses</h3>
      {allCourses.map(c => {
        const full = c.is_full || c.enrolled >= c.capacity;
        const already = myIds.has(c.id);
        return (
          <div key={c.id}>
            <b>{c.course_code}</b> - {c.course_name} ({c.teacher_name})
            {already ? (
              <span> Enrolled</span>
            ) : (
              <button disabled={busy || full} onClick={() => enroll(c.id)}>
                {full ? "Full" : "Enroll"}
              </button>
            )}
          </div>
        );
      })}
      {error && <p>{error}</p>}
    </div>
  );
}
