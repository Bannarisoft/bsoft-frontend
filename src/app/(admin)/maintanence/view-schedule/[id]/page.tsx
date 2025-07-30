import React from "react";
import ViewScheduleDetails from "../../../../../components/organisms/Maintanence/Schedule/ViewScheduleDetails";

interface PageParams {
  params: { [key: string]: string };
}

const page: React.FC<PageParams> = ({ params }) => {
  return (
    <div>
      <ViewScheduleDetails scheduleId={params.id} />
    </div>
  );
};

export default page;
