import './stylesheet.css';
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


const theme = createTheme({
  palette: { main: '#5b9bd5' },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#8F99FB',
    color: 'white',
  },
}));

function createData(name, grade) {
  return {name, grade};
}

const rows = [createData('Bob', 44)];

export default function TeacherClass() {
  const { id } = useParams();
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container className="background">
        <h1>UC Merced</h1>
        <Box className="content">
          <Box className="title">
            <p>{id}</p>
          </Box>

          <TableContainer component={Paper}>
            <Table className="class">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Name</StyledTableCell>
                  <StyledTableCell align="right"> Grade </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.grade}</TableCell>
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


