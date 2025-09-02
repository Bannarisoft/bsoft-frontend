"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  IconButton,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  FiSearch,
  FiChevronRight,
  FiPlus,
  FiFilter,
  FiMapPin,
} from "react-icons/fi";
import { TbFingerprintOff } from "react-icons/tb";
import { MdOutlinePushPin } from "react-icons/md";
import { RiUnpinLine } from "react-icons/ri";

type Tone = "info" | "warn" | "ok" | "neutral";
export type MenuLink = {
  label: string;
  badge?: string;
  tone?: Tone;
  onClick?: () => void;
  icon?: React.ReactNode;
};
export type MenuSection = {
  title: string;
  icon?: React.ReactNode;
  links: MenuLink[];
  id?: string;
};

export type SmartMenuProps = {
  sections: MenuSection[];
  shortcuts?: { label: string; count?: number; onClick?: () => void }[];
  onCreate?: () => void;
  onFilter?: () => void;
  initialQuery?: string;
  className?: string;
  style?: React.CSSProperties;
};

const SectionCard = styled(Paper)(({ theme }) => ({
  position: "relative",
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.06)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.85))," +
    "radial-gradient(1200px 400px at 10% -10%, rgba(34,211,238,0.08), transparent)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(35, 132, 226, 0.06)",
  transition:
    "box-shadow .18s ease, transform .12s ease, border-color .18s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 6px 28px rgba(0,0,0,0.10)",
    borderColor: "rgba(0,0,0,0.10)",
  },
}));

const LinkRow = styled(Button)(({ theme }) => ({
  justifyContent: "space-between",
  color: theme.palette.text.primary,
  padding: "10px 12px",
  borderRadius: 12,
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    background: "rgba(2,132,199,0.06)",
  },
}));

function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const map = {
    info: { bg: "rgba(14,165,233,.14)", color: "#0284c7" },
    warn: { bg: "rgba(245,158,11,.16)", color: "#b45309" },
    ok: { bg: "rgba(16,185,129,.16)", color: "#047857" },
    neutral: { bg: "rgba(15,23,42,.08)", color: "#334155" },
  } as const;
  const c = map[tone];
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 22,
        borderRadius: 6,
        bgcolor: c.bg,
        color: c.color,
        ".MuiChip-label": { px: 0.75, fontSize: 12, fontWeight: 600 },
      }}
    />
  );
}

export default function PurchaseMenuPage({
  sections,
  shortcuts = [],
  onCreate,
  onFilter,
  initialQuery = "",
  className,
  style,
}: SmartMenuProps) {
  const [q, setQ] = useState(initialQuery);
  const [pinned, setPinned] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!q.trim()) return sections;
    const t = q.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        links: s.links.filter((l) => l.label.toLowerCase().includes(t)),
      }))
      .filter((s) => s.links.length);
  }, [q, sections]);

  const togglePin = (title: string) =>
    setPinned((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    );

  // Sort: pinned sections first
  const sorted = useMemo(() => {
    if (!pinned.length) return filtered;
    return [...filtered].sort((a, b) => {
      const ia = pinned.includes(a.title) ? -1 : 0;
      const ib = pinned.includes(b.title) ? -1 : 0;
      return ia - ib;
    });
  }, [filtered, pinned]);

  return (
    <Box className={className} style={style}>
      {/* Top controls */}
      <Stack direction="row" gap={1.25} alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Search anything…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch style={{ opacity: 0.7 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
              "&:hover fieldset": { borderColor: "rgba(2,132,199,0.35)" },
              width: 400
            },
          }}
        />
      </Stack>

      {/* Shortcuts */}
      {/* {shortcuts.length > 0 && (
        <Stack direction="row" gap={1} sx={{ overflowX: "auto" }} mb={2}>
          {shortcuts.map((s) => (
            <Button
              key={s.label}
              variant="outlined"
              size="small"
              onClick={s.onClick}
              sx={{
                textTransform: "none",
                borderRadius: 8,
                borderColor: "rgba(2,132,199,0.28)",
              }}
            >
              {s.label}
              {typeof s.count === "number" && (
                <Chip
                  size="small"
                  label={s.count}
                  sx={{
                    ml: 1,
                    height: 20,
                    borderRadius: 6,
                    bgcolor: "rgba(2,132,199,.10)",
                    color: "#0369a1",
                    ".MuiChip-label": {
                      px: 0.5,
                      fontSize: 11,
                      fontWeight: 600,
                    },
                  }}
                />
              )}
            </Button>
          ))}
        </Stack>
      )} */}

      {/* Sections */}
      <Grid container spacing={2}>
        {sorted.map((section) => (
          <Grid key={section.title} item xs={12} md={6} lg={4}>
            <SectionCard>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  {section.icon}
                  <Typography variant="subtitle1" fontWeight={700}>
                    {section.title}
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  onClick={() => togglePin(section.title)}
                  startIcon={
                    pinned.includes(section.title) ? (
                      <MdOutlinePushPin />
                    ) : (
                      <RiUnpinLine />
                    )
                  }
                  sx={{ textTransform: "none" }}
                >
                  {pinned.includes(section.title) ? "Pinned" : "Pin"}
                </Button>
              </Stack>

              <Divider sx={{ my: 1.25 }} />

              <Stack>
                {section.links.map((link) => (
                  <LinkRow
                    key={link.label}
                    onClick={link.onClick}
                    endIcon={<FiChevronRight style={{ opacity: 0.6 }} />}
                  >
                    <Stack direction="row" alignItems="center" gap={1.25}>
                      {link.icon}
                      <span>{link.label}</span>
                      {link.badge && (
                        <Badge
                          label={link.badge}
                          tone={link.tone ?? "neutral"}
                        />
                      )}
                    </Stack>
                  </LinkRow>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/* ---------- Example icons you can reuse ----------
   Buying:     <FiShoppingCart />
   Items:      <FiPackage />
   Pricing:    <FiTag />
   Suppliers:  <FiUsers />
-------------------------------------------------- */
