import React from "react";
import ItemMasterPage from "../../../../../../components/organisms/Purchase/ItemMaster/ItemMasterPage";

interface PageParams {
  params: { [key: string]: string };
}

const Page: React.FC<PageParams> = ({ params }) => {
  return <div><ItemMasterPage itemId={params.slug} /></div>;
};

export default Page;
