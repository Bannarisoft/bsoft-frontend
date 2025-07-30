import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
} from "@mui/material";
import { StyledPaper } from "./MachineHoursChart";

const TopConsumptionTable = ({ cardData }: any) => {
  return (
    <StyledPaper sx={{ bgcolor: "#ffffff9e" }}>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <Typography
          variant="h6"
          color="#333"
          fontSize={16}
          fontWeight="600"
          fontFamily={"poppins"}
        >
          Top Consumptions
        </Typography>
      </Box>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {Array.isArray(cardData) && cardData && cardData.length > 0 && (
          <Box>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "rgba(25, 118, 210, 0.1)",
                // background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
                overflow: "hidden",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  //   background:
                  //     "linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)",
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(135deg, #1976d2, #64b5f6)",
                      "& .MuiTableCell-root": {
                        borderBottom: "none",
                        py: 2.5,
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        fontFamily: "poppins !important",
                        textAlign: "center",
                        width: "80px",
                      }}
                    >
                      Rank
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        fontFamily: "poppins !important",
                      }}
                    >
                      Item Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        fontFamily: "poppins !important",
                        textAlign: "center",
                      }}
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        fontFamily: "poppins !important",
                        textAlign: "right",
                      }}
                    >
                      Rate
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        fontFamily: "poppins !important",
                        textAlign: "right",
                      }}
                    >
                      Total Value
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cardData.map((item, idx) => (
                    <TableRow
                      key={item.itemName}
                      sx={{
                        background: idx % 2 === 0 ? "#ffffff" : "#f8faff",
                        transition: "all 0.3s ease",
                        // "&:hover": {
                        //   background:
                        //     "linear-gradient(90deg, #e3f2fd 0%, #f3e5f5 100%)",
                        //   transform: "translateY(-1px)",
                        //   boxShadow: "0 4px 12px rgba(25, 118, 210, 0.1)",
                        // },
                        "& .MuiTableCell-root": {
                          borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                          py: 2,
                        },
                      }}
                    >
                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          label={`#${idx + 1}`}
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            fontFamily: "poppins",
                            height: 32,
                            background:
                              idx === 0
                                ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                                : idx === 1
                                ? "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)"
                                : idx === 2
                                ? "linear-gradient(135deg, #cd7f32 0%, #daa520 100%)"
                                : "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                            color: idx < 3 ? "#333" : "#fff",
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontWeight={500}
                          color="text.primary"
                          sx={{
                            fontSize: "0.95rem",
                            lineHeight: 1.2,
                            fontFamily: "poppins !important",
                          }}
                        >
                          {item.itemName}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          label={item.consumptionQty}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            background:
                              "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)",
                            color: "#2e7d32",
                            border: "1px solid rgba(46, 125, 50, 0.2)",
                            fontSize: "0.8rem",
                            fontFamily: "poppins !important",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              fontFamily: "poppins !important",
                            }}
                          >
                            ₹
                          </Typography>
                          <Typography
                            sx={{
                              color: "#2e7d32",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              fontFamily: "poppins !important",
                            }}
                          >
                            {Number(item.rate).toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ textAlign: "right" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              fontFamily: "poppins !important",
                            }}
                          >
                            ₹
                          </Typography>
                          <Typography
                            sx={{
                              color: "#822ba7",
                              fontWeight: 600,
                              fontSize: "1rem",
                            }}
                          >
                            {Number(item.consumptionValue).toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </StyledPaper>
  );
};

export default TopConsumptionTable;
