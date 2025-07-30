import { Box, Skeleton } from "@mui/material";
import React from "react";

function SkeletonLoader() {
  const skeletonRows = Array.from({ length: 10 }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      {[0, 1, 2, 3, 4, 5, 6].map((colIndex) => (
        <td key={colIndex}>
          <Skeleton variant="text" width={"95%"} height={50} />
        </td>
      ))}
    </tr>
  ));

  return (
    <Box>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <th key={i}>
                <Skeleton variant="text" width={"95%"} height={60} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{skeletonRows}</tbody>
      </table>
    </Box>
  );
}

export default SkeletonLoader;
