import React, { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Tooltip,
  Collapse,
  styled,
  Alert,
} from "@mui/material";
import { StyledAutocomplete, StyledButton } from "../../../../utils/lib";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LuCircleFadingPlus, LuTrash2 } from "react-icons/lu";
import { TbClipboardList } from "react-icons/tb";
import { ScheduleItemProps } from "../../../../maintanenceTypes";

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

function MrsItems({
  rows,
  storeTypeData,
  handleAddRow,
  handleDeleteRow,
  handleInputChange,
  categoryData,
  subCostCenterData,
  machineData,
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

  const headers = [
    "Item Group",
    "Item",
    "Required Qty",
    "Category",
    "Sub Cost Center",
    "Machine",
  ];

  return (
    <Box>
      {/* Header Section */}
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
          position={"relative"}
        >
          {headers.map((header, index) => (
            <Grid item key={index} md={index === 2 ? 1.5 : 2}>
              <MuiText
                // variant="h6"
                fontWeight={600}
                fontSize={15}
                color="#2c5282"
              >
                {header}
              </MuiText>
            </Grid>
          ))}
          <Grid item md={4} sx={{ position: "absolute", top: -5, right: 0 }}>
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

      {/* Rows Section */}
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
                {/* Item Group */}
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

                {/* Item */}
                <Grid item md={2}>
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

                {/* Required Qty */}
                <Grid item md={1.5}>
                  <MuiInputField
                    size="small"
                    fullWidth
                    placeholder="Required Qty"
                    value={row.requiredQty}
                    onChange={(e) =>
                      handleInputChange(row.id, "requiredQty", e.target.value)
                    }
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const value = parseInt(
                        (e.target as HTMLInputElement).value
                      );
                      if (isNaN(value)) return;
                      (e.target as HTMLInputElement).value = Math.min(
                        Math.max(value, 0),
                        Number(row.availableQty) - Number(row.pending)
                      ).toString();
                    }}
                  />
                </Grid>

                {/* Category */}
                <Grid item md={2}>
                  <StyledAutocomplete
                    options={categoryData || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) => option.catdesc || ""}
                    value={row.category || null}
                    onChange={(e, newValue) =>
                      handleInputChange(row.id, "category", newValue)
                    }
                    renderInput={(params) => (
                      <MuiInputField {...params} placeholder="Category" />
                    )}
                  />
                </Grid>

                {/* Sub Cost Center */}
                <Grid item md={2}>
                  <StyledAutocomplete
                    options={subCostCenterData || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) =>
                      option ? `${option.scccode} - ${option.sccname}` : ""
                    }
                    value={row.subCostCenter || null}
                    onChange={(e, newValue) =>
                      handleInputChange(row.id, "subCostCenter", newValue)
                    }
                    renderInput={(params) => (
                      <MuiInputField
                        {...params}
                        placeholder="Sub Cost Center"
                      />
                    )}
                  />
                </Grid>

                {/* Machine */}
                <Grid item md={2}>
                  <StyledAutocomplete
                    options={machineData || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) => option.machineName || ""}
                    value={row.machine || null}
                    onChange={(e, newValue) =>
                      handleInputChange(row.id, "machine", newValue)
                    }
                    renderInput={(params) => (
                      <MuiInputField {...params} placeholder="Machine" />
                    )}
                  />
                </Grid>

                {/* Delete Button */}
                <Grid
                  item
                  md={0.5}
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
              {row.availableQty && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    border: "1px solid #e0e0e0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <MuiText
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: "#616161",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TbClipboardList size={18} color="#107869" />
                      Available Qty:
                      <span style={{ color: "#107869", fontWeight: 700 }}>
                        {row.availableQty}
                      </span>
                    </MuiText>
                    <MuiText
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: "#616161",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TbClipboardList size={18} color="#107869" />
                      Price:
                      <span style={{ color: "#107869", fontWeight: 700 }}>
                        ₹ {row.rate?.toFixed(2)}
                      </span>
                    </MuiText>
                    <MuiText
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: "#616161",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TbClipboardList size={18} color="#107869" />
                      In Request :
                      <span style={{ color: "#107869", fontWeight: 700 }}>
                        {row.pending}
                      </span>
                    </MuiText>
                    <MuiText
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: "#616161",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TbClipboardList size={18} color="#107869" />
                      MRS Allowed Qty :
                      <span style={{ color: "#107869", fontWeight: 700 }}>
                        {Number(row.availableQty) - Number(row.pending)}
                      </span>
                    </MuiText>
                  </Box>
                </Box>
              )}
            </Box>
          </ItemCard>
        ))}
      </Box>

      {/* Add Button for Mobile */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "center",
          mt: 2,
          mb: 2,
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
            px: 3,
            py: 1,
            fontSize: "15px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          Add New Item
        </StyledButton>
      </Box>
    </Box>
  );
}

export default MrsItems;
