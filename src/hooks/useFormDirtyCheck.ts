import { useMemo } from "react";

/**
 * Custom hook for dirty-check and submit-disable logic.
 * 
 * @param formState 
 * @param originalState 
 * @param isValid 
 * @param isEditMode 
 * @returns 
 * @returns 
 */
export function useFormDirtyCheck<T extends object>(
  formState: T,
  originalState: T | null,
  isValid: boolean,
  isEditMode: boolean
) {

  // Determine if the form has actually changed
  const isDirty = useMemo(() => {
    if (!isEditMode) return true;
    if (!originalState) return false;
    return JSON.stringify(formState) !== JSON.stringify(originalState);
  }, [formState, originalState, isEditMode]);

  const saveDisabled = isEditMode ? !(isValid && isDirty) : !isValid;

  return { isDirty, saveDisabled };
}
