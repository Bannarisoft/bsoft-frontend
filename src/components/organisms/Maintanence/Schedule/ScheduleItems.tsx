import {
  Box,
  Grid,
  IconButton,
  styled,
  Collapse,
  Tooltip,
} from "@mui/material";
import { StyledAutocomplete, StyledButton } from "../../../../utils/lib";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LuCircleFadingPlus, LuTrash2 } from "react-icons/lu";
import { TbClipboardList } from "react-icons/tb";
import { ScheduleItemProps } from"../../../../types/maintanenceTypes";

const ItemCard = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0px 3px 12px rgba(0,0,0,0.08)",
  padding: "16px",
  position: "relative",
  marginBottom: "8px",
  transition: "all 0.3s ease",
  border: "1px solid #eaeef2",
  "&:hover": {
    boxShadow: "0px 6px 16px rgba(0,0,0,0.12)",
    borderColor: "#d0e0f5",
  },
}));

const FieldLabel = styled(MuiText)({
  fontSize: 13,
  fontWeight: 600,
  color: "#616e7c",
  marginBottom: "4px",
});

const ItemHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
});

function ScheduleItems({
  rows,
  storeTypeData,
  handleAddRow,
  handleDeleteRow,
  handleInputChange,
}: ScheduleItemProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (id: string | number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClearField = (rowId: string | number, field: string) => {
    const numericId = typeof rowId === "string" ? parseInt(rowId) : rowId;
    switch (field) {
      case "type":
        handleInputChange(numericId, "type", null);
        handleInputChange(numericId, "item", null);
        handleInputChange(numericId, "requiredQty", "");
        break;

      case "item":
        handleInputChange(numericId, "item", null);
        handleInputChange(numericId, "requiredQty", "");
        break;

      default:
        break;
    }
  };

  const headers = ["Item Group", "Item", "Required Qty", "UOM"];
  return (
    <Box>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          mt: 2,
          mb: "0px !important",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            p: 1,
            borderRadius: "12px",
          }}
        >
          {headers.map((header, index) => (
            <Grid item key={index} md={index === 1 ? 4 : 2}>
              <MuiText fontWeight={600} fontSize={15} color="#2c5282">
                {header}
              </MuiText>
            </Grid>
          ))}
          <Grid item md={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              <StyledButton
                startIcon={<LuCircleFadingPlus />}
                variant="contained"
                onClick={handleAddRow}
                sx={{
                  backgroundColor: "#107869",
                  borderRadius: "8px",
                  boxShadow: "0px 3px 8px rgba(0,0,0,0.15)",
                  "&:hover": { backgroundColor: "#0e6b5e" },
                  px: { xs: 3, md: 2 },
                  py: { xs: 1, md: "6px" },
                  fontSize: { xs: "15px", md: "14px" },
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "320px", sm: "none" },
                }}
              >
                Add New Item
              </StyledButton>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 0 }}>
        {rows.map((row) => (
          <ItemCard key={row.id}>
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                "& .Mui-disabled": {
                  color: "#222 !important",
                },
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item md={2}>
                  <StyledAutocomplete
                    options={storeTypeData || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) => option.groupName || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?.id === value?.id
                    }
                    value={row.type}
                    onChange={(e, newValue) => {
                      if (!newValue) {
                        handleClearField(row.id, "type");
                      } else {
                        handleInputChange(row.id, "type", newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <MuiInputField {...params} placeholder="Type" />
                    )}
                  />
                </Grid>

                <Grid item md={4}>
                  <StyledAutocomplete
                    options={row.itemOptions || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) => option.itemName || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?.id === value?.id
                    }
                    loading={row.isLoading}
                    value={row.item}
                    onChange={(e, newValue) => {
                      if (!newValue) {
                        handleClearField(row.id, "item");
                      } else {
                        handleInputChange(row.id, "item", newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <MuiInputField {...params} placeholder="Item" />
                    )}
                  />
                </Grid>

                <Grid item md={1.5}>
                  <MuiInputField
                    size="small"
                    fullWidth
                    type="number"
                    placeholder="Available"
                    value={row.requiredQty}
                    onChange={(e) =>
                      handleInputChange(row.id, "requiredQty", e.target.value)
                    }
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const value = parseInt(
                        (e.target as HTMLInputElement).value
                      );
                      if (isNaN(value)) return;
                      if (isNaN(value) || value < 0 || value > 99) {
                        (e.target as HTMLInputElement).value = Math.min(
                          Math.max(value, 0),
                          99999
                        ).toString();
                      }
                    }}
                  />
                </Grid>
                <Grid item md={1.5}>
                  <MuiText
                    fontWeight={600}
                    fontSize={16}
                    color="#2d3748"
                    textAlign={"center"}
                  >
                    {row.uom ? row.uom : row?.item?.uom}
                  </MuiText>
                </Grid>

                <Grid
                  item
                  md={1}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Tooltip title="Remove Item">
                    <IconButton
                      onClick={() => handleDeleteRow(row.id)}
                      sx={{
                        color: "#e53935",
                        "&:hover": {
                          backgroundColor: "rgba(229, 57, 53, 0.1)",
                        },
                      }}
                      aria-label="delete row"
                    >
                      <LuTrash2 />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <ItemHeader>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TbClipboardList
                    size={20}
                    style={{ marginRight: "8px", color: "#4a5568" }}
                  />
                  <MuiText fontWeight={600} fontSize={16} color="#2d3748">
                    {row.item?.itemName || "New Item"}
                  </MuiText>
                </Box>
                <Box>
                  <IconButton
                    onClick={() => toggleExpand(row.id)}
                    size="small"
                    sx={{ color: "#4a5568" }}
                  >
                    {expandedItems[row.id] ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteRow(row.id)}
                    size="small"
                    sx={{
                      color: "#e53935",
                      ml: 1,
                      "&:hover": {
                        backgroundColor: "rgba(229, 57, 53, 0.1)",
                      },
                    }}
                  >
                    <LuTrash2 />
                  </IconButton>
                </Box>
              </ItemHeader>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FieldLabel>Item Group Name</FieldLabel>
                  <StyledAutocomplete
                    options={storeTypeData || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) => option.groupName || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?.id === value?.id
                    }
                    value={row.type}
                    onChange={(e, newValue) => {
                      if (!newValue) {
                        handleClearField(row.id, "type");
                      } else {
                        handleInputChange(row.id, "type", newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <MuiInputField {...params} placeholder="Type" />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FieldLabel>Item Name</FieldLabel>
                  <StyledAutocomplete
                    options={row.itemOptions || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) => option.itemName || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?.id === value?.id
                    }
                    value={row.item}
                    onChange={(e, newValue) => {
                      if (!newValue) {
                        handleClearField(row.id, "item");
                      } else {
                        handleInputChange(row.id, "item", newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <MuiInputField {...params} placeholder="Item" />
                    )}
                  />
                </Grid>
              </Grid>

              <Collapse in={expandedItems[row.id] || false}>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FieldLabel>Required Qty</FieldLabel>
                      <MuiInputField
                        size="small"
                        fullWidth
                        type="number"
                        placeholder="Available"
                        value={row.requiredQty}
                        onChange={(e) =>
                          handleInputChange(
                            row.id,
                            "requiredQty",
                            e.target.value
                          )
                        }
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const value = parseInt(
                            (e.target as HTMLInputElement).value
                          );
                          if (isNaN(value)) return;
                          if (isNaN(value) || value < 0 || value > 99) {
                            (e.target as HTMLInputElement).value = Math.min(
                              Math.max(value, 0),
                              99999
                            ).toString();
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>

              {!expandedItems[row.id] && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 1,
                    color: "#3182ce",
                    fontSize: "13px",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={() => toggleExpand(row.id)}
                >
                  Show more details
                </Box>
              )}
            </Box>
          </ItemCard>
        ))}
      </Box>
    </Box>
  );
}

export default ScheduleItems;
