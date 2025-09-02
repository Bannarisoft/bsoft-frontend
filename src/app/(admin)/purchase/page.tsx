"use client";

import React from "react";
import PurchaseMenuPage, {
  MenuSection,
} from "../../../components/organisms/Purchase/PurchaseMenuPage";
import { FiPackage, FiTag } from "react-icons/fi";
import { GrTransaction } from "react-icons/gr";

function page() {
  const sections: MenuSection[] = [
    {
      title: "Master",
      icon: <FiPackage />,
      links: [
        { label: "UOM Master" },
        { label: "UOM Conversion", badge: "3 To Receive", tone: "warn" },
        { label: "Item Master" },
        { label: "Item Category" },
        { label: "Item Group" },
        { label: "Party Master" },
        { label: "Party Group" },
        { label: "HSN Master" },
        { label: "Warehouse Master" },
        { label: "Purchase Misc" },
        { label: "Putaway Rule Master" },
      ],
    },
    {
      title: "Transactions",
      icon: <GrTransaction />,
      links: [
        {
          label: "Indent",
          badge: "12 Available",
          tone: "info",
          //   icon: <FiPackage />,
        },
        {
          label: "Approval",
          //  icon: <FiTag />
        },
        { label: "Quotation" },
      ],
    },
  ];

  return (
    <div>
      <PurchaseMenuPage
        sections={sections}
        shortcuts={[
          { label: "Items", count: 12 },
          { label: "POs", count: 3 },
        ]}
        onCreate={() => console.log("Create")}
        onFilter={() => console.log("Filter")}
      />
    </div>
  );
}

export default page;
