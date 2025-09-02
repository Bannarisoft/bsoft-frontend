"use client";
import * as React from "react";
import {
    Box,
    Chip,
    Grid,
    Paper,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    alpha,
    styled,
} from "@mui/material";
import { MuiText } from "bsoft-base-elements";
export const Pane = styled(Box)(() => ({
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 360px",
    gap: 18,
    height: "calc(100vh - 290px)",
}));
export const Scroll = styled(Box)(({ theme }) => ({
    overflowY: "auto",
    padding: 1,
    paddingRight: 0,
    scrollbarGutter: "stable",
    "&::-webkit-scrollbar": { width: 0 },
    "&::-webkit-scrollbar-thumb": { backgroundColor: alpha(theme.palette.text.primary, 0.18) },
}));

export const Side = styled(Box)(() => ({
    padding: 16,
    position: "relative",
    overflowY: "auto",
}));

export const Card = styled(Paper)(({ theme }) => ({
    padding: 16,
    borderRadius: 4,
    border: `0.5px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.background.paper,
}));


export const IconBadge = styled("span")(({ theme }) => ({
    display: "inline-grid",
    placeItems: "center",
    width: 28,
    height: 28,
    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    borderRadius: 3,
    fontSize: 16,
    color: theme.palette.text.primary,
}));

export const SectionTitle = ({
    title,
    hint,
    icon,
}: {
    title: string;
    hint?: string;
    icon?: React.ReactNode;
}) => (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
            {icon ? (
                <IconBadge sx={{ color: 'primary.main' }}>
                    {icon}
                </IconBadge>
            ) : null}
            <MuiText variant="body2" sx={{ fontWeight: 800, letterSpacing: 0.2, color: 'primary.main' }}>
                {title}
            </MuiText>
        </Box>
        {hint ? <Chip size="small" label={hint} /> : null}
    </Box>
);

export const ItemsTableHead = styled(TableHead)(({ theme }) => ({
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
        theme.palette.primary.main,
        0.1
    )} 100%)`,
    "& .MuiTableCell-head": {
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
}));




export const HEADER_BG = "#3a8484";
export const HEADER_TX = "#ffffff";

export const ModernTableContainer = styled(TableContainer)(({ theme }) => ({
    border: `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
    borderRadius: 3,
    overflow: "hidden",
    maxHeight: 420,
    "&::-webkit-scrollbar": { width: 3, height: 10 },
    "&::-webkit-scrollbar-thumb": {
        background: alpha(theme.palette.text.primary, 0.25),
        borderRadius: 8,
    },
}));

export const ModernTableHead = styled(TableHead)(() => ({
    position: "sticky",
    top: 0,
    zIndex: 2,
    "& .MuiTableCell-head": {
        backgroundColor: HEADER_BG,
        color: HEADER_TX,
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontSize: 12.5,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottom: `1px solid ${alpha("#000", 0.1)}`,
    },
}));

export const ModernTable = styled(Table)(({ theme }) => ({
    "& .MuiTableCell-root": {
        paddingTop: 10,
        paddingBottom: 10,
        borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
        verticalAlign: "middle",
    },
    "& .MuiTableRow-root": {
        transition: "background-color .15s ease",
        "&:nth-of-type(even)": {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
        },
        "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
        },
    },
}));




interface TableHeaderCellProps {
    children: React.ReactNode;
    width: string;
    [key: string]: any;
}

export const TableHeaderCell = ({ children, width, ...props }: TableHeaderCellProps) => {
    return (
        <TableCell
            sx={{
                width,
                bgcolor: "#127c9e",
                color: "white",
                fontWeight: 700,
                textAlign: "center"
            }}
            {...props}
        >
            {children}
        </TableCell>
    );
};

interface StickyFooterProps {
    children: React.ReactNode;
}

export const StickyFooter = ({ children }: StickyFooterProps) => {
    return (
        <Box
            sx={{
                position: "sticky",
                bottom: 0,
                zIndex: 2,
                bgcolor: "background.paper",
                borderTop: "1px solid",
                borderColor: "divider",
                pt: 2,
            }}
        >
            {children}
        </Box>
    );
};



// cell with no border
export const cellNoBorderTF = {
    variant: 'outlined' as const,
    size: 'small' as const,
    fullWidth: true,
    sx: {
        '& .MuiOutlinedInput-notchedOutline': { border: '0 !important' },
        '&:hover .MuiOutlinedInput-notchedOutline': { border: '0 !important' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '0 !important' },
        backgroundColor: 'transparent',
    },
};




