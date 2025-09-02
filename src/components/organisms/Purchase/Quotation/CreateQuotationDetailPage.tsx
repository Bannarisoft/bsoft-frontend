"use client";

import React, { useEffect, useState } from "react";
import BreadcrumbsNav from "../../../atoms/ModernComponents/BreadcrumbsNav";
import { Box } from "@mui/material";
import QuotationTabs from "./QuotationTabView";

function CreateQuotationDetailPage() {
  const [pathArr, setPathArr] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const segments: string[] = window.location.pathname
        .split("/")
        .filter(Boolean);
      setPathArr(segments);
    }
  }, []);

  return (
    <Box component={"main"}>
      <BreadcrumbsNav pathArr={pathArr} />
      <Box component={"div"} className="main-content-wrapper">
        <QuotationTabs />
      </Box>
    </Box>
  );
}

export default CreateQuotationDetailPage;
