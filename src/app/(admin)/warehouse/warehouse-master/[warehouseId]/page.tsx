import React from "react";
import CreateNewWarehouse from "../../../../../components/organisms/Warehouse//Master/CreateNewWarehouse";

interface PageParams {
    params: { warehouseId: string };
}

const Page: React.FC<PageParams> = ({ params }) => {
    return <CreateNewWarehouse warehouseId={params.warehouseId} />;
};

export default Page;
