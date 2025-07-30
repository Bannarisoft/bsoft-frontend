import { Box } from "@mui/material";
import React from "react";
import ImageComponent from "../../atoms/Image";
import TextComponent from "../../atoms/Text";
import NoData from "../../../../public/assets/images/no-data.png";

function NoDataFound() {
  return (
    <Box height={"100%"} className="d-grid-center">
      <Box className="d-flex-center" flexDirection={"column"}>
        <Box width={50} height={50}>
          <ImageComponent src={NoData} alt="" />
        </Box>
        <TextComponent variant="h6">No Data Found !</TextComponent>
      </Box>
    </Box>
  );
}

export default NoDataFound;
