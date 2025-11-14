import React, { useState } from "react";
import "./stylesheet.css";

import { Box, Container } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { TextField, Button } from "@mui/material";

const theme = createTheme({
  palette: { main: "#5b9bd5" },
});

export default function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    fetch("/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setError("Invalid username or password");
        } else {
          if (data.user.role === "student") window.location.href = "/student";
          if (data.user.role === "teacher") window.location.href = "/teacher";
          if (data.user.role === "admin") window.location.href = "/admin";
        }
      });
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Container className="background">
        <h1>UC Merced</h1>

        <Box className="content">
          <Box className="title">
            <p>Student Login</p>
          </Box>

          <Box className="class">
            <form onSubmit={handleLogin}>
              <p>Username</p>
              <TextField
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <p>Password</p>
              <TextField
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <br />
              <Button type="submit" variant="contained">
                Login
              </Button>

              {error && <p>{error}</p>}
            </form>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
