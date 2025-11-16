// what I am using
// react
// react-dom
// react-router-dom
// @mui/material
// @mui/system
// @mui/icons-material
// @mui/styles

import './stylesheet.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const theme = createTheme({
  palette: { main: '#5b9bd5' },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#8F99FB',
    color: 'white',
  },
}));

export default function TeacherAllClass() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    fetch('/api/my-courses', { credentials: 'include' })
      .then(response => {
        return response.json();
      })
      .then(setCourses)
  }, []);

  const handleSignOut = () => {
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(response => {
        if (response.ok) {
          // back to login 
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Logout error:', error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container className="background" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1>UC Merced</h1>
        <a
          onClick={handleSignOut}
          style={{
            color: '#5b9bd5',
            textDecoration: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          Sign Out
        </a>
        <Box className="content">
          <Box className="title">
            <p>Your Classes</p>
          </Box>

          <TableContainer component={Paper}>
            <Table className="class">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Course Code</StyledTableCell>
                  <StyledTableCell>Course Name</StyledTableCell>
                  <StyledTableCell align="right">Time</StyledTableCell>
                  <StyledTableCell align="right">Students Enrolled</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell component="th" scope="row">
                      <Link to={`/class/${course.id}`}>{course.course_code}</Link>
                    </TableCell>
                    <TableCell>{course.course_name}</TableCell>
                    <TableCell align="right">{course.time_schedule}</TableCell>
                    <TableCell align="right">{course.enrolled}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
