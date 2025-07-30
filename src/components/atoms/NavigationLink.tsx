import Link from "next/link";
import React from "react";
import { ButtonTypes } from "../../types";

function NavigationLink(props: ButtonTypes) {
  const { title, redirectLink } = props;
  return (
    <Link href={`/${redirectLink}`} className="hyperlinks-login poppins-font">
      {title}
    </Link>
  );
}

export default NavigationLink;
