import './stylesheet.css';
import { Link } from 'react-router-dom';
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


function createData(name, teacher, time, studentsEnrolled) {
  return { name, teacher, time, studentsEnrolled };
}

const rows = [createData('CSE 108', 'Dr. Name', '10:00 AM', 24)];

export default function TeacherAllClass() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container className="background">
        <h1>UC Merced</h1>
        <Box className="content">
          <Box className="title">
            <p>Your Classes</p>
          </Box>

          <TableContainer component={Paper}>
            <Table className="class">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Course Name</StyledTableCell>
                  <StyledTableCell>Teacher</StyledTableCell>
                  <StyledTableCell align="right">Time</StyledTableCell>
                  <StyledTableCell align="right">
                    Students Enrolled
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      <Link to={`/class/${row.name}`}>{row.name}</Link>
                    </TableCell>
                    <TableCell>{row.teacher}</TableCell>
                    <TableCell align="right">{row.time}</TableCell>
                    <TableCell align="right">{row.studentsEnrolled}</TableCell>
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


