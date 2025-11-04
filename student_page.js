import React from "react";
import "./style.css";

export default function StudentDashboard() {
  return (
    <div>
      <header>
        <h1>Welcome</h1>
        <form action="#">
          <button type="button">Logout</button>
        </form>
      </header>

      <section>
        <h2>Your Classes</h2>
        <div className="card">
          <button type="button">Drop Out</button>
        </div>
      </section>

      <section>
        <h2>Available Classes</h2>
        <div className="card">
          Enrolled
          <br />
          Teacher:
          <form method="post" action="#">
            <button type="button">Enroll</button>
          </form>
        </div>
      </section>
    </div>
  );
}
