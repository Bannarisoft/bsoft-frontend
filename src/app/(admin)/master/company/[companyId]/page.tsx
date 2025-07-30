import React from "react";
import CreateCompanyPage from "../../../../../components/organisms/Master/CreateCompanyPage";

interface PageParams {
  params: { [key: string]: string };
}

const Page: React.FC<PageParams> = ({ params }) => {
  return (
    <div>
      <CreateCompanyPage companyId={params.companyId} />
    </div>
  );
};

export default Page;
