import WorkOrderDetailPage from "../../../../../components/organisms/Maintanence/WorkOrder/WorkOrderDetailPage";
import React from "react";

interface PageParams {
  params: { [key: string]: string };
}

const page: React.FC<PageParams> = ({ params }) => {
  return (
    <div>
      <WorkOrderDetailPage workOrderId={params.id} />
    </div>
  );
};

export default page;
