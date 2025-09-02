import {
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { alpha } from "@mui/material/styles";
import { tabStyles } from "../PartyMaster/PartyTabs";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "#0d0b0bff",
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: theme.spacing(2),
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.875rem",
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    transition: "background-color 0.2s ease",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "&:hover": {
    backgroundColor: alpha("#3a8484", 0.08),
    transform: "translateY(-1px)",
    boxShadow: `0 4px 12px ${alpha("#3a8484", 0.1)}`,
    transition: "all 0.2s ease",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${alpha("#3a8484", 0.1)}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2, 3),
  minWidth: "200px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 40px ${alpha("#3a8484", 0.15)}`,
    borderColor: alpha("#3a8484", 0.2),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  boxShadow: `0 8px 32px ${alpha("#3a8484", 0.12)}`,
  border: `1px solid ${alpha("#3a8484", 0.1)}`,
  "& .MuiTable-root": {
    borderCollapse: "separate",
    borderSpacing: 0,
  },
}));

interface TableRow {
  name: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

interface HeaderInfo {
  id: number;
  name: string;
  value: string;
  icon?: string;
}

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number
): TableRow {
  return { name, calories, fat, carbs, protein };
}

const tableData: TableRow[] = [
  createData("Bearing", 159, 6.0, 24, 4.0),
  createData("Rings", 237, 9.0, 37, 4.3),
  createData("Insulation Tape", 262, 16.0, 24, 6.0),
  createData("Pressure Bearing RH", 305, 3.7, 67, 4.3),
  createData("Redirecting Roller Dia 38", 356, 16.0, 49, 3.9),
];

const indentApprovalHeaders: HeaderInfo[] = [
  { id: 1, name: "Indent Date", value: "14-05-2025" },
  { id: 2, name: "Indent Type", value: "Type 1" },
  { id: 3, name: "Unit", value: "Knitting" },
  { id: 4, name: "Department", value: "Mechanical" },
  { id: 5, name: "Raised By", value: "Michael" },
  { id: 6, name: "Purpose", value: "Equipment Maintenance" },
];

const IndentApproval: React.FC = () => {
  return (
    <Box
      sx={{
        ".MuiButtonBase-root": {
          p: 0,
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(auto-fit, minmax(250px, 1fr))",
          },
          gap: 2,
          mb: 2,
        }}
      >
        {indentApprovalHeaders.map((item) => (
          <InfoCard key={item.id} elevation={0}>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <MuiText
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  display: "block",
                  mb: 1,
                }}
              >
                {item.name}
              </MuiText>
              <MuiText
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: 1.2,
                }}
              >
                {item.value || "—"}
              </MuiText>
            </CardContent>
          </InfoCard>
        ))}
      </Box>

      <Box sx={tabStyles}>
        <StyledTableContainer>
          <Table sx={{ minWidth: 700 }} aria-label="indent approval table">
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  <FormControlLabel
                    control={<Checkbox size="small" sx={{ color: "white" }} />}
                    label={""}
                    sx={{ m: 0, mr: 3 }}
                  />
                </StyledTableCell>
                {[
                  "Item Name",
                  "UOM",
                  "Required Date",
                  "Requested Quantity",
                  "Approved Quantity",
                  "Remarks",
                ].map((li) => (
                  <StyledTableCell key={li}>{li}</StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <StyledTableRow key={`${row.name}-${index}`}>
                  <StyledTableCell>
                    <FormControlLabel
                      control={<Checkbox size="small" />}
                      label={""}
                      sx={{ m: 0, p: 0 }}
                    />
                  </StyledTableCell>
                  <StyledTableCell
                    component="th"
                    scope="row"
                    sx={{ fontWeight: 500, color: "#1e293b" }}
                  >
                    {row.name}
                  </StyledTableCell>
                  <StyledTableCell align="left">{row.fat}</StyledTableCell>
                  <StyledTableCell align="left">{row.carbs}</StyledTableCell>
                  <StyledTableCell align="left">{row.protein}</StyledTableCell>
                  <StyledTableCell>
                    <CustomTextField sx={{ width: 100, bgcolor: "#fff" }} />
                  </StyledTableCell>
                  <StyledTableCell>
                    <CustomTextField />
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Box>
    </Box>
  );
};

export default IndentApproval;
