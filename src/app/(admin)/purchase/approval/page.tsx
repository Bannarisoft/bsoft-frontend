import React, { Suspense } from "react";
import PurchaseApproval from "../../../../components/organisms/Purchase/Approval/WorkFlowApprovalPage";

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseApproval />
    </Suspense>
  );
}

export default page;
