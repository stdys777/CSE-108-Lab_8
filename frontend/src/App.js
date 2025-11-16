import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeacherAllClass from './teacherAllClass';
import TeacherClass from './teacherClass';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Teacher sees all their classes */}
        <Route path="/teacher" element={<TeacherAllClass />} />
        
        {/* Teacher sees students in a specific class */}
        <Route path="/teacher/class/:id" element={<TeacherClass />} />
        
        {/* Placeholder for student page */}
        <Route path="/student" element={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#667eea'
          }}>
            Student Dashboard - Coming Soon
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
  );
}

export default App;