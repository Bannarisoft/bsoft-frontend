import { Autocomplete, Box, Chip, Grid2, TextField } from "@mui/material";
import React, { useState } from "react";
import TextComponent from "../../../atoms/Text";
import SelectComponent from "../../../atoms/Select";
import { FaCircleCheck } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import ButtonComponent from "../../../atoms/Button";
import { CreateRolemenuProps, RolemenuProps } from "../../../../types";
import { MuiText } from "bsoft-base-elements";

function RoleMenu({
  menuinput,
  chipData,
  chipState,
  handleChipClick,
  handleChangeParentMenu,
  // toggleSelectDeselectAll,
  selectedParentMenu,
  selectedChips,
}: CreateRolemenuProps) {
  return (
    <Box pt={1}>
      <Grid2 container spacing={2}>
        <Grid2
          size={4}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flex={2}
        >
          <MuiText variant="caption" className="role-label">
            Parent Menu
          </MuiText>
          <MuiText variant="caption" className="role-label">
            :
          </MuiText>
        </Grid2>
        <Grid2 size={8}>
          <Autocomplete
            multiple
            id="tags-standard"
            options={menuinput || []}
            getOptionLabel={(option) => option.menuName}
            size="small"
            onChange={(e: any, value: any) => handleChangeParentMenu(e, value)}
            value={selectedParentMenu}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Parent Menu"
              />
            )}
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2} my={2}>
        <Grid2
          size={4}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"baseline"}
          flex={2}
        >
          <MuiText variant="caption" className="role-label">
            Selected Menu Items
          </MuiText>
          <MuiText variant="caption" className="role-label">
            :
          </MuiText>
        </Grid2>
        <Grid2 size={8}>
          <Box border={"1px solid #E8E8E8"} p={1} borderRadius={"4px"}>
            <Box height={400} sx={{ overflow: "auto" }}>
              {Array.isArray(chipData) &&
                chipData.length > 0 &&
                chipData.map((chip) => {
                  const isSelected =
                    Array.isArray(selectedChips) &&
                    selectedChips.includes(
                      chipData.find((i) => i.id === chip.id)
                    );
                  return (
                    <Chip
                      key={chip.id}
                      icon={
                        isSelected ? (
                          <FaCircleCheck fontSize={14} color="#fff" />
                        ) : (
                          <GoDotFill fontSize={18} color="#4BC5AB" />
                        )
                      }
                      sx={{
                        borderRadius: "4px",
                        m: 0.5,
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#3a8484" : "white",
                        color: isSelected ? "white" : "#3a8484",
                        border: isSelected ? "none" : "1px solid #3a8484",
                        "&:hover": {
                          backgroundColor: isSelected ? "#3a8484" : "#f5f5f5",
                        },
                      }}
                      label={chip.menuName}
                      onClick={() => handleChipClick(chip.id)}
                    />
                  );
                })}
            </Box>
            {/* <Box borderTop={"1px solid #e8e8e8"} mt={2} pt={1}>
              <ButtonComponent
                variant="contained"
                sx={{ background: "var(--button-gradient)" }}
                // onClick={toggleSelectDeselectAll}
              >
                Select / Deselect All
              </ButtonComponent>
            </Box> */}
          </Box>
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default RoleMenu;
