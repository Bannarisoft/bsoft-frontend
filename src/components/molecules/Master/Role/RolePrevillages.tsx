import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Checkbox } from "@mui/material";
import ButtonComponent from "../../../atoms/Button";
import MyCustomSwitch from "../../../atoms/Switch";
import { RolePrevillagesProps } from "../../../../types";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#BBDBDB",
    color: theme.palette.common.black,
    borderRight: "1px solid #D8D8D8",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderRight: "1px solid #D8D8D8",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    borderBottom: 0,
  },
}));

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

const ScrollableTableBody = styled("tbody")({
  display: "block",
  maxHeight: 300,
  overflowY: "auto",
  width: "100%",
});

const ScrollableTableRow = styled(TableRow)({
  display: "table",
  width: "100%",
  tableLayout: "fixed",
});

function RolePrevillages({
  selectedChips,
  switchState,
  handleSwitch,
}: RolePrevillagesProps) {

  const isRowSelected = (chipId: number | string) => {
    const keys = [
      "canAdd",
      "canUpdate",
      "canDelete",
      "canExport",
      "canApprove",
    ];
    return keys.every((key) => switchState[chipId as any]?.[key]);
  };

  
  const handleRowCheckboxChange = (event: any, chipId: number | string) => {
    const checked = event.target.checked;
    const keys = [
      "canAdd",
      "canUpdate",
      "canDelete",
      "canExport",
      "canApprove",
    ];

    keys.forEach((key) => {
      
      const event = {
        target: Object.assign(document.createElement('input'), {
          checked
        })
      } as React.ChangeEvent<HTMLInputElement>;
      handleSwitch(event, Number(chipId), key);
    });
  };

  return (
    <TableContainer component={Paper} sx={{ my: 1 }}>
      <Table
        sx={{ minWidth: 700, tableLayout: "fixed" }}
        aria-label="customized table"
        stickyHeader
      >
        <TableHead>
          <ScrollableTableRow>
            <StyledTableHeadCell>List of Menu</StyledTableHeadCell>
            <StyledTableHeadCell align="center">Add</StyledTableHeadCell>
            <StyledTableHeadCell align="center">Update</StyledTableHeadCell>
            <StyledTableHeadCell align="center">Delete</StyledTableHeadCell>
            <StyledTableHeadCell align="center">Export</StyledTableHeadCell>
            <StyledTableHeadCell align="center">Approval</StyledTableHeadCell>
          </ScrollableTableRow>
        </TableHead>
        <ScrollableTableBody
          sx={{ display: "block", maxHeight: 300, overflowY: "auto" }}
        >
          {Array.isArray(selectedChips) &&
            selectedChips.length > 0 &&
            selectedChips.map((chip) => (
              <StyledTableRow
                key={chip.id}
                sx={{ display: "table", width: "100%", tableLayout: "fixed" }}
              >
                <StyledTableCell
                  padding="checkbox"
                  sx={{ py: 0 }}
                  align="center"
                >
                  <Checkbox
                    checked={isRowSelected(chip.id)}
                    onChange={(e) => handleRowCheckboxChange(e, chip.id)}
                    inputProps={{
                      "aria-label": `select all permissions for ${chip.menuName}`,
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {chip.menuName}
                </StyledTableCell>
                {[
                  { key: "canAdd", label: "Add" },
                  { key: "canUpdate", label: "Update" },
                  { key: "canDelete", label: "Delete" },
                  { key: "canExport", label: "Export" },
                  { key: "canApprove", label: "Approval" },
                ].map(({ key }) => (
                  <StyledTableCell sx={{ py: 0 }} key={key} align="center">
                    <MyCustomSwitch
                      checked={switchState[chip.id]?.[key] || false}
                      onChange={(e) => handleSwitch(e, chip.id, key)}
                    />
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
        </ScrollableTableBody>
      </Table>
    </TableContainer>
  );
}

export default RolePrevillages;
