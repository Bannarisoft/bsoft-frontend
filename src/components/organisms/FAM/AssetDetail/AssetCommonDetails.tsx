import {
  Box,
  Chip,
  Grid2,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableHead,
  TableRow,
} from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import Image from "next/image";
import React from "react";
import Logo from "../../../../../public/assets/images/bsoft-logo.webp";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#BBDBDB",
    color: theme.palette.common.black,
    borderRight: "1px solid #D8D8D8",
    padding: "8px",
  },
  [`&.${tableCellClasses.body}`]: {
    backgroundColor: "#fff",
    fontSize: 14,
    borderRight: "1px solid #D8D8D8",
    padding: "8px",
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

function AssetCommonDetails({ assetDetails }: any) {
  return (
    <Box>
      <Grid2
        container
        spacing={3}
        my={2}
        pb={3}
        borderBottom={"1px solid #D8D8D8"}
      >
        <Grid2 size={2} sx={{ display: "grid", placeItems: "center" }}>
          <Box
            mx={0}
            overflow={"hidden"}
            height={185}
            width={185}
            borderRadius={"10px"}
            boxShadow={"3px 3px 10px 3px rgba(0,0,0,0.075)"}
          >
            <Image
              src={assetDetails?.assetImage ? assetDetails?.assetImage : Logo}
              alt=""
              width={1200}
              height={800}
              className="image-properties"
              style={{
                objectFit: "contain",
                filter: assetDetails?.assetImage ? "" : "grayscale(1)",
                opacity: assetDetails?.assetImage ? "" : "0.3",
              }}
            />
          </Box>
        </Grid2>
        <Grid2
          size={10}
          display={"flex"}
          justifyContent={"space-between"}
          flexDirection={"column"}
        >
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <MuiText variant="caption" fontSize={16}>
                Asset Name
              </MuiText>
              <MuiText variant="h6" fontSize={20}>
                {assetDetails?.assetName}
              </MuiText>
              <MuiText variant="caption" fontSize={16}>
                Asset Code: <b>{assetDetails?.assetCode}</b>
              </MuiText>
            </Grid2>
          </Grid2>
          <Box
            overflow={"hidden"}
            border="1px solid #D8D8D8"
            borderRadius={"12px"}
            borderRight={"1px solid transparent"}
          >
            <Table aria-label="customized table">
              <TableHead>
                <TableRow>
                  {[
                    "Quantity",
                    "UOM",
                    "Asset Group",
                    "Asset Sub Group",
                    "Category",
                    "Sub Category",
                    "Parent Asset",
                  ].map((item) => (
                    <StyledTableCell align="center" key={item}>
                      {item}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <StyledTableRow>
                  {[
                    assetDetails?.quantity,
                    assetDetails?.uomName,
                    assetDetails?.groupName,
                    assetDetails?.subGroupName,
                    assetDetails?.categoryName,
                    assetDetails?.subCategoryName,
                    assetDetails?.assetParent?.assetName,
                  ].map((list, index) => (
                    <StyledTableCell
                      component="th"
                      align="center"
                      key={index}
                      scope="row"
                    >
                      {list}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              </TableBody>
            </Table>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default AssetCommonDetails;
