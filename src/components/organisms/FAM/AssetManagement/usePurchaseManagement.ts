import { useState, useCallback } from "react";
import { AdditionalCost } from  "../../../../types/types";

interface UsePurchaseManagementProps {
  purchaseState: any;
  handleAdditionalCost?: (costs: AdditionalCost[]) => void;
}

export const usePurchaseManagement = ({
  purchaseState,
  handleAdditionalCost,
}: UsePurchaseManagementProps) => {
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([
    { id: 1, costType: null, amount: "", journalNo: "" },
  ]);

  const handleCostChange = useCallback(
    (id: number, field: keyof AdditionalCost, value: any) => {
      setAdditionalCosts((prev) => {
        const updatedCosts = prev.map((cost) =>
          cost.id === id ? { ...cost, [field]: value } : cost
        );
        handleAdditionalCost?.(updatedCosts);
        return updatedCosts;
      });
    },
    [handleAdditionalCost]
  );

  const handleAddCost = useCallback(() => {
    const totalOptions = purchaseState.additionalCostData?.length || 0;
    const currentSelections = additionalCosts.length;

    if (currentSelections < totalOptions) {
      setAdditionalCosts((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          costType: null,
          amount: "",
          journalNo: "",
        },
      ]);
    }
  }, [purchaseState.additionalCostData?.length, additionalCosts.length]);

  const handleDeleteCost = useCallback(
    (id: number) => {
      setAdditionalCosts((prev) => {
        const updatedCosts = prev.filter((cost) => cost.id !== id);
        const renumberedCosts = updatedCosts.map((cost, index) => ({
          ...cost,
          id: index + 1,
        }));
        handleAdditionalCost?.(renumberedCosts);
        return renumberedCosts;
      });
    },
    [handleAdditionalCost]
  );

  return {
    additionalCosts,
    handleCostChange,
    handleAddCost,
    handleDeleteCost,
  };
};
