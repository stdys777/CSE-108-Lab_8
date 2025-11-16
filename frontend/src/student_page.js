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
  const [loading, setLoading] = useState(true);

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
          loadCourses();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function loadCourses() {
    fetch("/api/my-courses", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMyCourses(data));
  }

  function logout() {
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      window.location.href = "/";
    });
  }

  if (loading) return <p>Loading...</p>;
  if (!me) return null;

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
                    </tr>
                  ))}
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