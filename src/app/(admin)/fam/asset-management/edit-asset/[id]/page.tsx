import React from "react";
import AddAssetPage from "../../../../../../components/organisms/FAM/AssetManagement/AddAssetPage";

interface PageParams {
  params: { [key: string]: string };
}

const page: React.FC<PageParams> = ({ params }) => {
  return (
    <div>
      <AddAssetPage assetId={params.id} />
    </div>
  );
};

export default page;
