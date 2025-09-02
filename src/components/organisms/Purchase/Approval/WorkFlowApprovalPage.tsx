"use client";
import React, { useState } from "react";
import { Autocomplete, Grid2 } from "@mui/material";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import Config from "../../../../utils/config.api.json";
import { MuiButton, MuiInputField } from "bsoft-base-elements";
import IndentApprovalList from "./IndentApprovalList";
import PurchaseApprovalList from "./PurchaseIndentList";

interface WorkflowType {
  id: number;
  moduleTypeName: string;
}

const PurchaseApproval = () => {
  const [error, setError] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<WorkflowType | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0); // to force remount

  const { data: WorkflowTypeData } = useDataFetchHook(
    Config.Workflow.WorkflowType.GetByWorkflowType.endpoint,
    Config.Workflow.WorkflowType.GetByWorkflowType.method,
    "bg"
  );

  const handleAutoCompleteChange = (value: WorkflowType | null) => {
    setError([]);
    if (value && selectedValue && value.id === selectedValue.id) {
      setRefreshKey((prev) => prev + 1);
    } else {
      setSelectedValue(value);
      setRefreshKey(0);
    }
  };

  return (
    <>
      <Grid2
        container
        spacing={2}
        mb={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Grid2 size={3}>
          <Autocomplete<WorkflowType>
            options={WorkflowTypeData || []}
            getOptionLabel={(option) => option.moduleTypeName}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            value={selectedValue}
            onChange={(_, value) => handleAutoCompleteChange(value)}
            renderInput={(params) => (
              <MuiInputField {...params} variant="outlined" size="small" />
            )}
          />
        </Grid2>
        <Grid2>
          <MuiButton variant="contained">Approv</MuiButton>
        </Grid2>
      </Grid2>

      {/* Conditionally render with key to force remount on same selection */}
      {selectedValue?.moduleTypeName === "Asset" && (
        <IndentApprovalList key={`indent-${refreshKey}`} />
      )}
      {selectedValue?.moduleTypeName === "Purchase Indent" && (
        <PurchaseApprovalList key={`purchase-${refreshKey}`} />
      )}
      {/* {selectedValue && (
        <PurchaseApprovalList key={`approval-${refreshKey}`} moduleType={selectedValue.moduleTypeName} />
      )} */}
    </>
  );
};

export default PurchaseApproval;
