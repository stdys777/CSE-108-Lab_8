// what I am using
// react
// react-dom
// react-router-dom
// @mui/material
// @mui/system
// @mui/icons-material
// @mui/styles

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeacherAllClass from "./teacherAllClass";
import TeacherClass from "./teacherClass";
import Login from "./login";

import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/allClass" element={<TeacherAllClass />} />
        <Route path="/class/:id" element={<TeacherClass />} />
      </Routes>
    </BrowserRouter>

    </ThemeProvider>
  );
}
