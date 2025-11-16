import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TeacherAllClass from './teacherAllClass';
import TeacherClass from './teacherClass';
import StudentPage from './student_page';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Teacher sees all their classes */}
          <Route path="/teacher" element={<TeacherAllClass />} />
          <Route path="/allClass" element={<TeacherAllClass />} />
          
          {/* Teacher sees students in a specific class */}
          <Route path="/teacher/class/:id" element={<TeacherClass />} />
          <Route path="/class/:id" element={<TeacherClass />} />
          
          {/* Student dashboard */}
          <Route path="/student" element={<StudentPage />} />
          
          {/* Home/root redirects to Flask login */}
          <Route path="/" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center', 
              height: '100vh',
              fontFamily: 'Arial',
              fontSize: '24px',
              color: '#667eea'
            }}>
              <p>Please login at:</p>
              <a href="http://localhost:5000/login" style={{ color: '#667eea', textDecoration: 'underline' }}>
                localhost:5000/login
              </a>
            </div>
          } />
          
          {/* Catch-all for any other route */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              fontFamily: 'Arial',
              fontSize: '24px',
              color: '#999'
            }}>
              Page Not Found - Please login at <a href="http://localhost:5000/login">localhost:5000/login</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;