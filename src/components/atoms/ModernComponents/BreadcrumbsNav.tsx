"use client";

import React, { JSX } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import { MdNavigateNext } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";
import { MuiText } from "bsoft-base-elements";

function prettify(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

interface BreadcrumbsNavProps {
  pathArr: string[];
  homeHref?: string;
}

export default function BreadcrumbsNav({
  pathArr,
  homeHref = "",
}: BreadcrumbsNavProps): JSX.Element {
  const breadcrumbs: React.ReactNode[] = [];

  pathArr.forEach((segment: string, idx: number) => {
    if (segment === "bsoft") {
      breadcrumbs.push(
        <Link key="home" href={homeHref} passHref>
          <MuiText sx={{ verticalAlign: "middle", display: "inline-flex" }}>
            <AiFillHome />
          </MuiText>
        </Link>
      );
    } else {
      const href = "/" + pathArr.slice(0, idx + 1).join("/");
      const isLast = idx === pathArr.length - 1;
      const label = prettify(segment);

      if (isLast) {
        breadcrumbs.push(
          <MuiText key={href} className="breadcrumb-parent-title">
            {label}
          </MuiText>
        );
      } else {
        breadcrumbs.push(
          <Link key={href} href={href} passHref>
            <MuiText className="breadcrumb-parent-title">{label}</MuiText>
          </Link>
        );
      }
    }
  });

  return (
    <Breadcrumbs
      separator={<MdNavigateNext fontSize="small" />}
      aria-label="breadcrumb"
      sx={{
        fontFamily: "poppins !important",
      }}
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
}
