import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { MdNavigateNext } from "react-icons/md";
import Link from "next/link";
import { BreadCrumbProps } from "../../../types";
import { AiFillHome } from "react-icons/ai";
import TextComponent from "../../atoms/Text";

function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
  event.preventDefault();
  console.info("You clicked a breadcrumb.");
}

export default function IconBreadcrumbs({
  parent,
  subParent,
  child,
  path,
}: BreadCrumbProps) {
  return (
    <div role="presentation" onClick={handleClick}>
      <Breadcrumbs
        separator={<MdNavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          fontFamily: "poppins !important"
        }}
      >
        <Link key="1" href="/maintanence/dashboard">
          <AiFillHome />
        </Link>
        ,
        <Link
          key="2"
          href={`${path ?? ""}`}
          className="breadcrumb-parent-title"
        >
          {parent}
        </Link>
        ,
        {child && (
          <Link
            key="3"
            href={`${path ?? ""}`}
            className="breadcrumb-parent-title"
          >
            {child ?? ""}
          </Link>
        )}
        {subParent && (
          <TextComponent key="4" className="breadcrumb-child-title">
            {subParent}
          </TextComponent>
        )}
      </Breadcrumbs>
    </div>
  );
}
