import {
  Box,
  Grid,
  IconButton,
  Stack,
  styled,
  Collapse,
  Tooltip,
} from "@mui/material";
import { StyledAutocomplete, StyledButton } from "../../../../utils/lib";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import React, { useMemo, useState } from "react";
import { FiUploadCloud, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LuCircleFadingPlus, LuTrash2 } from "react-icons/lu";
import { TbClipboardList } from "react-icons/tb";
import { SparesUsedProps } from "../../../../maintanenceTypes";
import { IoIosCloseCircleOutline } from "react-icons/io";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ItemCard = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0px 3px 12px rgba(0,0,0,0.08)",
  padding: "16px",
  marginBottom: "16px",
  position: "relative",
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

function SparesUsed({
  rows,
  storeTypeData,
  itemDetailsData,
  handleAddRow,
  handleDeleteRow,
  handleInputChange,
  handleFileChange,
  handleDeleteImage,
  selectedSpares,
}: SparesUsedProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const getFilteredOptions = (currentItem: any, allOptions: any[]) => {
    const selectedCodes = rows
      .filter((row) => row.item?.itemCode && row !== currentItem)
      .map((row) => row.item.itemCode);
    return allOptions
      ? allOptions.filter(
          (option) =>
            !selectedCodes.includes(option.itemCode) ||
            option.itemCode === currentItem?.itemCode
        )
      : [];
  };

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
        handleInputChange(numericId, "availableQty", "");
        handleInputChange(numericId, "usedQty", "");
        handleInputChange(numericId, "scrapQty", "");
        handleInputChange(numericId, "toSubStore", "");
        break;

      case "item":
        handleInputChange(numericId, "item", null);
        handleInputChange(numericId, "availableQty", "");
        handleInputChange(numericId, "usedQty", "");
        handleInputChange(numericId, "scrapQty", "");
        handleInputChange(numericId, "toSubStore", "");
        break;

      default:
        break;
    }
  };

  const headers = [
    "Item Type",
    "Item",
    "Available",
    "Used",
    "Scrap",
    "To Sub Store",
    "Image",
  ];

  return (
    <Box
      sx={{
        "& .MuiInputBase-input.Mui-disabled": {
          color: "#222 !important",
          "-webkit-text-fill-color": "#222 !important",
          opacity: "1 !important",
        },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          mb: 2,
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
            <Grid item key={index} md={index === 0 || index === 1 ? 3 : 1}>
              <MuiText
                // variant="h6"
                fontWeight={600}
                fontSize={15}
                color="#2c5282"
                sx={{
                  "@media (max-width: 1500px)": {
                    fontSize: 12,
                  },
                }}
              >
                {header}
              </MuiText>
            </Grid>
          ))}
          <Grid item md={1}></Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 2 }}>
        {rows.map((row: any) => (
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
                <Grid item md={3}>
                  {row.isEdit ? (
                    <MuiInputField
                      size="small"
                      fullWidth
                      value={row.type?.code || ""}
                      disabled={row.isEdit}
                      placeholder="Type"
                    />
                  ) : (
                    <StyledAutocomplete
                      options={storeTypeData || []}
                      fullWidth
                      size="small"
                      getOptionLabel={(option: any) => option.code || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        option?.id === value?.id
                      }
                      value={row.type}
                      renderOption={(props, option: any) => (
                        <li
                          {...props}
                          key={option?.id}
                          style={{ fontSize: 14, textTransform: "capitalize" }}
                        >
                          {option?.code}
                        </li>
                      )}
                      disabled={row.isEdit}
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
                  )}
                </Grid>

                <Grid item md={3}>
                  {row.isEdit ? (
                    <MuiInputField
                      size="small"
                      fullWidth
                      value={row.item?.itemName || ""}
                      disabled
                      placeholder="Item"
                    />
                  ) : (
                    <StyledAutocomplete
                      key={row.id}
                      options={getFilteredOptions(
                        row.item,
                        itemDetailsData || []
                      )}
                      fullWidth
                      size="small"
                      getOptionLabel={(option: any) => option.itemName || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        option?.id === value?.id
                      }
                      disabled={row.isEdit}
                      value={row.item}
                      onChange={(e, newValue) => {
                        if (!newValue) {
                          handleClearField(row.id, "item");
                        } else {
                          handleInputChange(row.id, "item", newValue);
                        }
                      }}
                      renderOption={(props: any, option: any) => (
                        <li
                          {...props}
                          key={option?.id}
                          style={{ fontSize: 14, textTransform: "capitalize" }}
                        >
                          {option?.itemName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField {...params} placeholder="Item" />
                      )}
                    />
                  )}
                </Grid>

                <Grid item md={1}>
                  <MuiInputField
                    size="small"
                    fullWidth
                    placeholder="Available"
                    value={row.availableQty}
                    disabled={row.isEdit}
                  />
                </Grid>

                <Grid item md={1}>
                  <MuiInputField
                    size="small"
                    fullWidth
                    placeholder="Used"
                    type="number"
                    value={row.usedQty}
                    onChange={(e) =>
                      handleInputChange(row.id, "usedQty", e.target.value)
                    }
                    disabled={row.isEdit}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                      const value = parseInt(
                        (e.target as HTMLInputElement).value
                      );
                      if (
                        isNaN(value) ||
                        value < 0 ||
                        value > Number(row.availableQty)
                      ) {
                        (e.target as HTMLInputElement).value = Math.min(
                          Math.max(value, 0),
                          Number(row.availableQty)
                        ).toString();
                      }
                    }}
                  />
                </Grid>

                <Grid item md={1}>
                  <MuiInputField
                    size="small"
                    fullWidth
                    placeholder="Scrap"
                    value={row.scrapQty}
                    disabled={
                      row.type?.code?.toLowerCase() === "consumables" ||
                      row.isEdit
                    }
                    onChange={(e) => {
                      let inputValue = e.target.value;
                      if (inputValue === "") {
                        handleInputChange(row.id, "scrapQty", "");
                        return;
                      }
                      let value = parseInt(inputValue, 10);
                      if (isNaN(value)) return;
                      if (value < 0) value = 0;
                      if (value > (row.usedQty ?? 0)) value = row.usedQty ?? 0;

                      handleInputChange(row.id, "scrapQty", value.toString());
                    }}
                  />
                </Grid>

                <Grid item md={1}>
                  <MuiInputField
                    size="small"
                    fullWidth
                    placeholder="Sub Store"
                    disabled={
                      row.type?.code?.toLowerCase() === "consumables" ||
                      row.isEdit
                    }
                    value={row.toSubStore}
                    onChange={(e) => {
                      let inputValue = e.target.value;
                      if (inputValue === "") {
                        handleInputChange(row.id, "toSubStore", "");
                        return;
                      }
                      let value = parseInt(inputValue, 10);
                      if (isNaN(value)) return;

                      const maxAllowed =
                        Number(row.usedQty) - Number(row.scrapQty);
                      if (value < 0) value = 0;
                      if (value > maxAllowed) value = maxAllowed;

                      handleInputChange(row.id, "toSubStore", value.toString());
                    }}
                    onInput={(e) => {
                      let inputValue = (e.target as HTMLInputElement).value;
                      if (inputValue === "") {
                        handleInputChange(row.id, "toSubStore", "");
                        return;
                      }
                      let value = parseInt(inputValue, 10);
                      if (isNaN(value)) return;

                      const maxAllowed =
                        Number(row.usedQty) - Number(row.scrapQty);
                      if (value < 0) value = 0;
                      if (value > maxAllowed) value = maxAllowed;

                      (e.target as HTMLInputElement).value = value.toString();
                      handleInputChange(row.id, "toSubStore", value.toString());
                    }}
                  />
                </Grid>

                <Grid item md={1}>
                  {row.image ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "8px",
                        backgroundColor: "#f9f9f9",
                        position: "relative",
                      }}
                    >
                      <img
                        src={
                          typeof row.imagePath === "string" &&
                          row.imagePath.startsWith("http")
                            ? encodeURI(row.imagePath)
                            : `data:image/png;base64, ${row.imagePath}`
                        }
                        alt="Uploaded"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "150px",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        onClick={() =>
                          handleDeleteImage(
                            row?.imagePath ? row?.imagePath : "",
                            row?.id
                          )
                        }
                        sx={{
                          position: "absolute",
                          top: "0px",
                          right: "0px",
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid #cbcbcb",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          },
                          color: "#e53935",
                          p: 0,
                        }}
                      >
                        <IoIosCloseCircleOutline
                          style={{
                            background: "red",
                            color: "#fff",
                            borderRadius: "50%",
                          }}
                        />
                      </IconButton>
                    </Box>
                  ) : (
                    <MuiButton
                      component="label"
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={<FiUploadCloud />}
                      sx={{
                        textTransform: "none",
                        borderRadius: "8px",
                        backgroundColor: "#3182ce",
                        "&:hover": { backgroundColor: "#2b6cb0" },
                        color: "#fff",
                      }}
                    >
                      <VisuallyHiddenInput
                        type="file"
                        onChange={(e) =>
                          e.target.files &&
                          handleFileChange(row.id, e.target.files[0])
                        }
                      />
                    </MuiButton>
                  )}
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
                      onClick={() =>
                        handleDeleteRow(row.id, row?.item?.itemCode)
                      }
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
                  <MuiText
                    // variant="h6"
                    fontWeight={600}
                    fontSize={16}
                    color="#2d3748"
                  >
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
                  <FieldLabel>Item Type</FieldLabel>
                  <StyledAutocomplete
                    options={storeTypeData || []}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) => option.code || ""}
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
                  <FieldLabel>Item</FieldLabel>
                  <StyledAutocomplete
                    options={itemDetailsData || []}
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
                      <FieldLabel>Available Qty</FieldLabel>
                      <MuiInputField
                        size="small"
                        fullWidth
                        placeholder="Available"
                        value={row.availableQty}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FieldLabel>Used Qty</FieldLabel>
                      <MuiInputField
                        size="small"
                        fullWidth
                        placeholder="Used"
                        type="number"
                        value={row.usedQty}
                        onChange={(e) =>
                          handleInputChange(row.id, "usedQty", e.target.value)
                        }
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const value = parseInt(
                            (e.target as HTMLInputElement).value
                          );
                          if (
                            isNaN(value) ||
                            value < 0 ||
                            value > Number(row.availableQty)
                          ) {
                            (e.target as HTMLInputElement).value = Math.min(
                              Math.max(value, 0),
                              Number(row.availableQty)
                            ).toString();
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FieldLabel>Scrap Qty</FieldLabel>
                      <MuiInputField
                        size="small"
                        fullWidth
                        placeholder="Scrap"
                        disabled={
                          row.type?.code?.toLowerCase() === "consumables"
                        }
                        value={row.scrapQty}
                        onChange={(e) => {
                          let inputValue = (e.target as HTMLInputElement).value;
                          if (inputValue === "") {
                            handleInputChange(row.id, "scrapQty", "");
                            return;
                          }
                          let value = parseInt(inputValue, 10);
                          if (isNaN(value)) return;
                          const maxAllowed =
                            Number(row.availableQty) - Number(row.usedQty);
                          if (value < 0) value = 0;
                          if (value > (row.usedQty ?? 0))
                            value = row.usedQty ?? 0;
                          handleInputChange(
                            row.id,
                            "scrapQty",
                            value.toString()
                          );
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FieldLabel>To Sub Store</FieldLabel>
                      <MuiInputField
                        size="small"
                        fullWidth
                        placeholder="Sub Store"
                        disabled={
                          row.type?.code?.toLowerCase() === "consumables"
                        }
                        value={row.toSubStore}
                        onChange={(e) =>
                          handleInputChange(
                            row.id,
                            "toSubStore",
                            e.target.value
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      {row.image ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "8px",
                            backgroundColor: "#f9f9f9",
                            position: "relative",
                          }}
                        >
                          <img
                            src={
                              typeof row.imagePath === "string" &&
                              row.imagePath.startsWith("http")
                                ? encodeURI(row.imagePath)
                                : `data:image/png;base64, ${row.imagePath}`
                            }
                            alt="Uploaded"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "150px",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            onClick={() =>
                              handleDeleteImage(
                                row?.imagePath ? row?.imagePath : "",
                                row?.id
                              )
                            }
                            sx={{
                              position: "absolute",
                              top: "0px",
                              right: "0px",
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                              border: "1px solid #cbcbcb",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                              },
                              color: "#e53935",
                              p: 0,
                            }}
                          >
                            <IoIosCloseCircleOutline
                              style={{
                                background: "red",
                                color: "#fff",
                                borderRadius: "50%",
                              }}
                            />
                          </IconButton>
                        </Box>
                      ) : (
                        <MuiButton
                          component="label"
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={<FiUploadCloud />}
                          sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            backgroundColor: "#3182ce",
                            "&:hover": { backgroundColor: "#2b6cb0" },
                            color: "#fff",
                          }}
                        >
                          Upload Image
                          <VisuallyHiddenInput
                            type="file"
                            onChange={(e) =>
                              e.target.files &&
                              handleFileChange(row.id, e.target.files[0])
                            }
                          />
                        </MuiButton>
                      )}
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            mt: 2,
            mb: 3,
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
      </Box>
    </Box>
  );
}

export default SparesUsed;
