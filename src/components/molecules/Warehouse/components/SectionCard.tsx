// components/common/SectionCard.tsx
import * as React from "react";
import { Card, CardHeader, CardContent, Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SectionCardProps } from "../../../../types/warehouseTypes";

const baseSx: SxProps<Theme> = {
  borderRadius: 2,
  overflow: "hidden",
  mb: 2,
};

const SectionCard: React.FC<SectionCardProps> = ({
  icon,
  title,
  action,
  children,
  sx,
  titleColor
}) => {
  // Ensure sx never includes undefined and supports object/function/array
  const mergedSx: SxProps<Theme> = React.useMemo(() => {
    if (!sx) return baseSx;
    return Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  }, [sx]);

  return (
    <Card variant="outlined" sx={mergedSx}>
      <CardHeader
        avatar={
          icon ? (
            <Box
              className="d-grid-center"
              sx={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #e5e7eb" }}
            >
              {icon}
            </Box>
          ) : null
        }
        title={title}
        action={action}
        sx={{
          "& .MuiCardHeader-title": {
            fontFamily: "var(--poppins-font)",
            fontSize: 16,
            fontWeight: 600,
            color: titleColor,
          },
          bgcolor: "rgba(0,0,0,0.02)",
          py: 2,
          px: 2.5,
        }}
      />
      <CardContent sx={{ pt: 2 }}>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;

