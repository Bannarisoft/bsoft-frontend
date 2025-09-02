"use client";

import * as React from "react";
import {
    Autocomplete,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    Slide,
    TextField,
    FormGroup,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { IoClose } from "react-icons/io5";
import { MuiButton, MuiSwitch, MuiText } from "bsoft-base-elements";
import {
    AisleOption,
    CreateRackProps,
    FieldDefn,
    FloorOption,
    RackErrorField,
    RackForm,
    RackLevelOption,
    UomOption,
    WarehouseOption,
} from "../../../../types/warehouseTypes";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CreateRackMaster: React.FC<CreateRackProps> = ({
    open,
    close,
    editFlag,
    form,
    errorFields,
    onChange,
    onSubmit,
    warehouses,
    floors,
    aisles,
    rackLevels,
    uoms,
    submitDisabled,
}) => {
    const [showErrors, setShowErrors] = React.useState(false);
    React.useEffect(() => {
        if (!open) setShowErrors(false);
    }, [open]);

    const Fields: Array<FieldDefn> = [
        { label: "Warehouse", name: "warehouseId", type: "autocomplete-warehouse", isRequired: true, size: { xs: 12, sm: 6, md: 3, lg: 3 } },
        { label: "Floor", name: "floorId", type: "autocomplete-floor", isRequired: true, size: { xs: 12, sm: 6, md: 3, lg: 3 } },
        { label: "Aisle", name: "aisleId", type: "autocomplete-aisle", isRequired: true, size: { xs: 12, sm: 6, md: 3, lg: 3 } },
        { label: "Rack Level", name: "rackLevelId", type: "autocomplete-racklevel", isRequired: true, size: { xs: 12, sm: 6, md: 3, lg: 3 } },
        { label: "Max Capacity", name: "maxCapacity", type: "number", isRequired: true, size: { xs: 12, sm: 6, md: 3, lg: 3 }, min: 1 },
        { label: "Capacity UOM", name: "capacityUOMId", type: "autocomplete-uom", isRequired: true, size: { xs: 12, sm: 6, md: 3, lg: 3 } },
        { label: "Rack Width", name: "rackWidth", type: "text", isRequired: false, size: { xs: 12, sm: 6, md: 3, lg: 3 }, maxLength: 5 },
        { label: "Rack Height", name: "rackHeight", type: "text", isRequired: false, size: { xs: 12, sm: 6, md: 3, lg: 3 }, maxLength: 6 },
        { label: "UOM (Dimension)", name: "dimensionUOMId", type: "autocomplete-uom", isRequired: false, size: { xs: 12, sm: 6, md: 3, lg: 3 } },
        { label: "Rack Name", name: "rackName", type: "text", isRequired: true, size: { xs: 12, sm: 6, md: 3, lg: 3 }, maxLength: 50 },

    ];

    const hasErr = (name: keyof RackForm) =>
        showErrors && (errorFields as RackErrorField[]).includes(name as RackErrorField);
    const help = (name: keyof RackForm, label: string) => (hasErr(name) ? `${label} is required.` : "");

    const optionLabel = (o?: any) =>
        (o?.uomName || o?.code || o?.name || o?.description || "").toString();

    const activeWarehouses = React.useMemo(() => warehouses.filter(w => w.isActive !== false), [warehouses]);
    const currentWarehouse = activeWarehouses.find(w => w.id === Number(form.warehouseId)) ?? null;

    const filteredFloors: FloorOption[] = React.useMemo(() => {
        const wid = Number(form.warehouseId || 0);
        return floors.filter(f => !wid || !f.warehouseId || f.warehouseId === wid);
    }, [floors, form.warehouseId]);
    const currentFloor = filteredFloors.find(f => f.id === Number(form.floorId)) ?? null;

    const filteredAisles: AisleOption[] = React.useMemo(() => {
        const wid = Number(form.warehouseId || 0);
        const fid = Number(form.floorId || 0);
        return aisles.filter(a => (!wid || !a.warehouseId || a.warehouseId === wid) && (!fid || !a.floorId || a.floorId === fid));
    }, [aisles, form.warehouseId, form.floorId]);
    const currentAisle = filteredAisles.find(a => a.id === Number(form.aisleId)) ?? null;

    const filteredLevels: RackLevelOption[] = React.useMemo(() => {
        const wid = Number(form.warehouseId || 0);
        const fid = Number(form.floorId || 0);
        const aid = Number(form.aisleId || 0);
        return rackLevels.filter(l =>
            (!wid || !l.warehouseId || l.warehouseId === wid) &&
            (!fid || !l.floorId || l.floorId === fid) &&
            (!aid || !l.aisleId || l.aisleId === aid)
        );
    }, [rackLevels, form.warehouseId, form.floorId, form.aisleId]);
    const currentLevel = filteredLevels.find(l => l.id === Number(form.rackLevelId)) ?? null;

    const currentCapacityUom = uoms.find(u => u.id === Number(form.capacityUOMId)) ?? null;
    const currentDimUom = uoms.find(u => u.id === Number(form.dimensionUOMId)) ?? null;

    return (
        <Dialog
            open={open}
            onClose={() => {
                setShowErrors(false);
            }}
            TransitionComponent={Transition}
            keepMounted
            aria-describedby="create-edit-rack-dialog"
            sx={{ "& .MuiPaper-root": { minWidth: "55vw", borderRadius: "10px" } }}
        >
            <Box className="popup-header-wrapper" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.2, bgcolor: "primary.main" }}>
                <h2 className="dialog-header" style={{ color: "#fff", margin: 0 }}>
                    {editFlag ? "Edit Rack" : "Create Rack"}
                </h2>
                <IoClose fontSize={22} onClick={() => { setShowErrors(false); close(); }} cursor="pointer" color="#fff" />
            </Box>

            <DialogContent sx={{ p: "10px 24px 8px" }}>
                <Grid container spacing={2}>
                    {Fields.map((field) => {
                        const commonProps = { error: hasErr(field.name), helperText: help(field.name, field.label) };
                        return (
                            <Grid key={String(field.name)} item {...field.size}>
                                <MuiText variant="h6" my={1} className="admin-label-title">
                                    {field.label} {field.isRequired && <span className="mandatory-sign">*</span>}
                                </MuiText>

                                {field.type === "autocomplete-warehouse" && (
                                    <Autocomplete<WarehouseOption>
                                        options={activeWarehouses}
                                        value={currentWarehouse}
                                        disabled={editFlag}
                                        onChange={(_e, v) => {
                                            if (editFlag) return;
                                            onChange("warehouseId", v?.id ?? "");
                                            onChange("floorId", "");
                                            onChange("aisleId", "");
                                            onChange("rackLevelId", "");
                                        }}
                                        getOptionLabel={(o) => (o?.code || o?.name || o?.description || "").toString()}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                disabled={editFlag}
                                                {...commonProps}
                                            />
                                        )}
                                        noOptionsText="No warehouses"
                                    />
                                )}


                                {field.type === "readonly" && (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={String(form.rackCode ?? "")}
                                        inputProps={{ readOnly: true }}
                                    />
                                )}

                                {field.type === "autocomplete-floor" && (
                                    <Autocomplete<FloorOption>
                                        options={filteredFloors}
                                        value={currentFloor}
                                        onChange={(_e, v) => {
                                            onChange("floorId", v?.id ?? "");
                                            onChange("aisleId", "");
                                            onChange("rackLevelId", "");
                                        }}
                                        getOptionLabel={(o) => (o?.code || o?.name || o?.description || "").toString()}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                placeholder={form.warehouseId ? "Select floor" : "Select warehouse first"}
                                                disabled={!form.warehouseId}
                                                {...commonProps}
                                            />
                                        )}
                                        noOptionsText={form.warehouseId ? "No floors" : "Select warehouse"}
                                    />
                                )}

                                {field.type === "autocomplete-aisle" && (
                                    <Autocomplete<AisleOption>
                                        options={filteredAisles}
                                        value={currentAisle}
                                        onChange={(_e, v) => {
                                            onChange("aisleId", v?.id ?? "");
                                            onChange("rackLevelId", "");
                                        }}
                                        getOptionLabel={(o) => (o?.code || o?.name || o?.description || "").toString()}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                placeholder={form.floorId ? "Select aisle" : "Select floor first"}
                                                disabled={!form.floorId}
                                                {...commonProps}
                                            />
                                        )}
                                        noOptionsText={form.floorId ? "No aisles" : "Select floor"}
                                    />
                                )}

                                {field.type === "autocomplete-racklevel" && (
                                    <Autocomplete<RackLevelOption>
                                        options={filteredLevels}
                                        value={currentLevel}
                                        onChange={(_e, v) => onChange("rackLevelId", v?.id ?? "")}
                                        getOptionLabel={(o) => (o?.code || o?.name || o?.description || "").toString()}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                placeholder={form.aisleId ? "Select rack level" : "Select aisle first"}
                                                disabled={!form.aisleId}
                                                {...commonProps}
                                            />
                                        )}
                                        noOptionsText={form.aisleId ? "No rack levels" : "Select aisle"}
                                    />
                                )}

                                {field.type === "autocomplete-uom" && (
                                    <Autocomplete<UomOption>
                                        options={uoms}
                                        value={field.name === "capacityUOMId" ? currentCapacityUom : currentDimUom}
                                        onChange={(_e, v) => onChange(field.name, v?.id ?? "")}
                                        getOptionLabel={optionLabel}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => <TextField {...params} size="small" {...commonProps} />}
                                        noOptionsText="No UOMs"
                                    />
                                )}

                                {(field.type === "text" || field.type === "number") && (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type={field.type === "number" ? "number" : "text"}
                                        value={String(form[field.name] ?? "")}
                                        onChange={(e) => {
                                            const v = e.target.value;

                                            if (field.name === "maxCapacity") {
                                                if (v === "") onChange("maxCapacity", "");
                                                else {
                                                    const n = Number(v);
                                                    if (!Number.isNaN(n)) {
                                                        if (v.length > 7) {
                                                            return;
                                                        }
                                                        onChange("maxCapacity", n);
                                                    }
                                                }
                                                return;
                                            }
                                            if (field.name === "rackWidth" || field.name === "rackHeight") {
                                                const digits = v.replace(/\D/g, "");
                                                const capped = field.maxLength ? digits.slice(0, field.maxLength) : digits;
                                                onChange(field.name, capped === "" ? "" : Number(capped));
                                                return;
                                            }
                                            if (field.maxLength) onChange(field.name, v.slice(0, field.maxLength));
                                            else onChange(field.name, v);
                                        }}
                                        inputProps={{
                                            maxLength: (Fields.find(f => f.name === field.name)?.maxLength) || undefined,
                                            min: field.name === "maxCapacity" ? 1 : undefined,
                                            step: field.name === "maxCapacity" ? 1 : undefined,
                                        }}
                                        {...commonProps}
                                    />
                                )}
                            </Grid>
                        );
                    })}
                </Grid>
            </DialogContent>

            <DialogActions
                sx={{ borderTop: "1px solid #f1f1f1", py: 2, justifyContent: "space-between", pr: { xs: "16px", md: "22px" } }}
            >
                <Box display="flex" gap={2} sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}>
                    <FormGroup sx={{ pl: 2 }}>
                        <MuiSwitch
                            checked={!!form.isActive}
                            onChange={(e) => onChange("isActive", !!e.target.checked)}
                            label="Status"
                        />
                    </FormGroup>
                </Box>
                <Box display="flex" alignItems="center" gap={2} sx={{ button: { minWidth: { xs: "50px", md: "70px" } }, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                    <MuiButton variant="outlined" onClick={() => { setShowErrors(false); close(); }}>
                        Cancel
                    </MuiButton>
                    <MuiButton
                        variant="contained"
                        onClick={() => { setShowErrors(true); onSubmit(); }}
                        disabled={!!submitDisabled}
                    >
                        Submit
                    </MuiButton>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRackMaster;
