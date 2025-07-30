"use client";

import React from "react";
import AssetAcceptancePage from "../../../../../components/organisms/FAM/AssetAcceptance/AssetAcceptancePage";

interface PageParams {
  params: { [key: string]: string };
}

function page({ params }: PageParams) {
  return <AssetAcceptancePage assetTransferId={params?.assetTransferId} />;
}

export default page;
