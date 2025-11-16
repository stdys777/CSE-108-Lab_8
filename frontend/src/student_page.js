import React, { useEffect, useState } from "react";
import "./stylesheet.css";

import { Box, Container } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: { main: "#5b9bd5" },
});

export default function StudentPage() {
  const [me, setMe] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("/api/current-user", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/";
          return null;
        }
        return res.json();
      })
      .then((user) => {
        if (user) {
          setMe(user);
          loadMyCourses();
          loadAllCourses();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function loadMyCourses() {
    fetch("/api/my-courses", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMyCourses(data));
  }

  function loadAllCourses() {
    fetch("/api/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAllCourses(data));
  }

  function logout() {
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      window.location.href = "/";
    });
  }

  function handleEnroll(courseId) {
    setEnrollingId(courseId);
    setMessage(null);

    fetch(`/api/enroll/${courseId}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) =>
        res.json().then((data) => ({
          ok: res.ok,
          data,
        }))
      )
      .then(({ ok, data }) => {
        if (!ok) {
          setMessage(data.message || "Enrollment failed.");
        } else {
          setMessage(data.message || "Enrolled successfully.");
          loadMyCourses();
          loadAllCourses();
        }
      })
      .catch(() => setMessage("An error occurred while enrolling."))
      .finally(() => setEnrollingId(null));
  }

  if (loading) return <p>Loading...</p>;
  if (!me) return null;

  const myCourseIds = myCourses.map((c) => c.id);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Container className="background">
        <h1>UC Merced</h1>

        <Box className="content">
          <Box className="title">
            <p>Welcome, {me.full_name}</p>
          </Box>

          <Box className="class">
            {message && (
              <p style={{ color: "yellow", marginBottom: "10px" }}>{message}</p>
            )}

            {/* Enrolled courses + grades */}
            <h2>Your Enrolled Courses</h2>

            {myCourses.length === 0 ? (
              <p>You are not enrolled in any courses.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Name</th>
                    <th>Teacher</th>
                    <th>Schedule</th>
                    <th>Enrolled</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {myCourses.map((c) => (
                    <tr key={c.id}>
                      <td>{c.course_code}</td>
                      <td>{c.course_name}</td>
                      <td>{c.teacher_name}</td>
                      <td>{c.time_schedule}</td>
                      <td>
                        {c.enrolled}/{c.capacity}
                      </td>
                      <td>{c.grade != null ? c.grade : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <hr style={{ margin: "20px 0" }} />

            {/* All available courses */}
            <h2>All Courses Offered</h2>

            {allCourses.length === 0 ? (
              <p>No courses are currently offered.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Name</th>
                    <th>Teacher</th>
                    <th>Schedule</th>
                    <th>Enrolled</th>
                    <th>Capacity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allCourses.map((c) => {
                    const alreadyEnrolled = myCourseIds.includes(c.id);
                    const isFull = c.is_full;
                    const canEnroll = !alreadyEnrolled && !isFull;

                    let buttonLabel = "Enroll";
                    if (alreadyEnrolled) buttonLabel = "Enrolled";
                    else if (isFull) buttonLabel = "Full";

                    return (
                      <tr key={c.id}>
                        <td>{c.course_code}</td>
                        <td>{c.course_name}</td>
                        <td>{c.teacher_name}</td>
                        <td>{c.time_schedule}</td>
                        <td>{c.enrolled}</td>
                        <td>{c.capacity}</td>
                        <td>
                          <button
                            onClick={() => handleEnroll(c.id)}
                            disabled={!canEnroll || enrollingId === c.id}
                          >
                            {enrollingId === c.id ? "Enrolling..." : buttonLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <br />
            <button onClick={logout}>Logout</button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
