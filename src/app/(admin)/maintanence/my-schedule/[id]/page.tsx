import React from "react";
import CreateSchedulePage from "../../../../../components/organisms/Maintanence/Schedule/CreateSchedulePage";

interface PageParams {
  params: { [key: string]: string };
}

const page: React.FC<PageParams> = ({ params }) => {
  return (
    <div>
      <CreateSchedulePage sheduleId={params.id} />
    </div>
  );
};

export default page;
