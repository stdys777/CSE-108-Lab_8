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
import { useParams } from 'react-router-dom';
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


import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: { main: '#5b9bd5' },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#8F99FB',
    color: 'white',
  },
}));

export default function TeacherClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);


  useEffect(() => {
    fetch('/api/courses', { credentials: 'include' })
      .then(responseCourse => {
        return responseCourse.json();
      })

      .then(responseCourse => {
        const matchedCourse = responseCourse.find(c => c.id.toString() === id.toString());
        if (matchedCourse) {
          setCourse(matchedCourse);
        }
        return fetch(`/api/course/${id}/students`, {
          credentials: 'include'
        });
      })

      .then(responseStudent => {
        if (!responseStudent.ok) {
          setStudents([]);
          return;
        }
        return responseStudent.json().then(setStudents);
      })
  }, [id]);
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

  const handleGradeChange = (studentId, newGrade) => {
    setStudents(prev => {
      return prev.map(student => {
        if (student.id === studentId) {
          return { ...student, grade: newGrade };
        }
        return student;
      });
    });
  };

  const saveGrade = (studentId, grade) => {
    fetch(`/api/update-grade/${id}/${studentId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ grade }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Grade updated!');
        }
      })

  };
  let courseTitle;

  if (course && course.course_code && course.course_name) {
    courseTitle = course.course_code + ' — ' + course.course_name;
  } else {
    courseTitle = 'Course ' + id;
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container className="background">

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
          <Box className="title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconButton aria-label="go back" onClick={() => navigate('/allClass')} size="small">
              <ArrowBackIcon/>
            </IconButton>
            <p>
              {courseTitle}
            </p>
          </Box>

          <TableContainer component={Paper}>
            <Table className="class">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Student Name</StyledTableCell>
                  <StyledTableCell align="center">Grade</StyledTableCell>
                  <StyledTableCell align="center">Save</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map(({ id, full_name, grade }) => (
                  <TableRow key={id}>
                    <TableCell component="th" scope="row">{full_name}</TableCell>
                    <TableCell align="center">
                      <input
                        type="number"
                        value={grade || ''}
                        onChange={(e) =>
                          handleGradeChange(id, e.target.value)
                        }
                        style={{
                          width: '70px',
                          padding: '5px',
                          borderRadius: '4px',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <button
                        onClick={() => saveGrade(id, grade)}
                        style={{
                          backgroundColor: '#5b9bd5',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </TableCell>
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
