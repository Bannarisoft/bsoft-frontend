import { useState, useCallback } from "react";
import { AdditionalCost } from  "../../../../types/types";
import { usePurchaseState } from "./usePurchaseState";

export const usePurchaseForm = () => {
  const {
    state: purchaseState,
    handlePurchaseAutoComplete,
    errors,
    setErrors,
    handleChange,
    purchaseDispatch,
    itemLoading,
  } = usePurchaseState();
  const [] = useState<string[]>([]);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([
    { id: 1, costType: null, amount: "", journalNo: "" },
  ]);

  const handleCostChange = useCallback(
    (id: number, field: keyof AdditionalCost, value: any) => {
      setAdditionalCosts((prev) => {
        const updatedCosts = prev.map((cost) =>
          cost.id === id ? { ...cost, [field]: value } : cost
        );
        return updatedCosts;
      });
    },
    []
  );

  const getFilteredCostTypes = useCallback(
    (currentId: number) => {
      const selectedTypes = additionalCosts
        .filter((cost) => cost.id !== currentId && cost.costType !== null)
        .map((cost) => cost.costType.id);

      return (purchaseState.additionalCostData || []).filter(
        (option) => !selectedTypes.includes(option.id)
      );
    },
    [additionalCosts, purchaseState.additionalCostData]
  );

  const handleAddCost = useCallback(() => {
    const totalOptions = purchaseState.additionalCostData?.length || 0;
    const currentSelections = additionalCosts.length;

    if (currentSelections < totalOptions) {
      setAdditionalCosts((prev) => [
        ...prev,
        { id: prev.length + 1, costType: null, amount: "", journalNo: "" },
      ]);
    }
  }, [purchaseState.additionalCostData?.length, additionalCosts.length]);

  const handleDeleteCost = useCallback((id: number) => {
    setAdditionalCosts((prev) => {
      const updatedCosts = prev.filter((cost) => cost.id !== id);
      return updatedCosts.map((cost, index) => ({
        ...cost,
        id: index + 1,
      }));
    });
  }, []);

  const validatePurchaseForm = useCallback(() => {
    const newErrors: string[] = [];

    if (!purchaseState.manual) {
      if (!purchaseState.selectedSource) newErrors.push("selectedSource");
      if (!purchaseState.selectedGrn) newErrors.push("selectedGrn");
      if (!purchaseState.selectedItem) newErrors.push("selectedItem");
      setErrors(newErrors);
    }
    return newErrors.length === 0;
  }, [purchaseState, additionalCosts]);

  return {
    purchaseState,
    handlePurchaseAutoComplete,
    additionalCosts,
    handleCostChange,
    handleAddCost,
    handleDeleteCost,
    getFilteredCostTypes,
    errors,
    validatePurchaseForm,
    handleChange,
    purchaseDispatch,
    itemLoading,
    setAdditionalCosts,
  };
};
