"use client";
import * as React from "react";
import {
    Autocomplete,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    MenuItem,
    Slide,
    TextField,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { IoClose } from "react-icons/io5";
import { MuiButton, MuiText } from "bsoft-base-elements";
import {
    BinForm,
    BinStatus,
    CreateBinProps,
    WarehouseOption,
    RackOption,
    UomOption,
    Fields,
} from "../../../../types/warehouseTypes";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CreateBinMaster: React.FC<CreateBinProps> = ({
    open,
    close,
    editFlag,
    form,
    errorFields,
    onChange,
    onSubmit,
    warehouses,
    racks,
    uoms,
    statusOptions,
    submitDisabled,
}) => {
    const FIELD_DEFS: Array<Fields> = [
        { label: "Warehouse", name: "warehouseId", type: "autocomplete-warehouse", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 4 } },
        { label: "Rack", name: "rackId", type: "autocomplete-rack", size: { xs: 12, sm: 6, md: 4, lg: 4 } },
        { label: "Bin Name", name: "binName", type: "text", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 4 }, maxLength: 50 },
        { label: "Bin Capacity", name: "binCapacity", type: "number", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 4 }, min: 0, max: 1000 },
        { label: "Capacity UOM", name: "capacityUOMId", type: "autocomplete-uom", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 4 } },
        { label: "Status", name: "status", type: "select-status", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 4 } },
    ];

    const [showErrors, setShowErrors] = React.useState(false);

    const hasErr = (name: keyof BinForm) =>
        showErrors && (errorFields as string[]).includes(name as string);

    const help = (name: keyof BinForm, label: string) =>
        hasErr(name) ? `${label} is required.` : "";

    const activeWarehouses = warehouses.filter((w) => w.isActive !== false);

    const rOptionsBase = form.warehouseId
        ? racks.filter((r) => (r.warehouseId ? r.warehouseId === Number(form.warehouseId) : true))
        : racks;

    const currentRack =
        rOptionsBase.find((r) => r.id === Number(form.rackId)) ??
        (racks.find((r) => r.id === Number(form.rackId)) ?? null);

    const currentWarehouse =
        activeWarehouses.find((w) => w.id === Number(form.warehouseId)) ?? null;

    const currentUom =
        uoms.find((u) => u.id === Number(form.capacityUOMId)) ?? null;

    React.useEffect(() => {
        if (!open) setShowErrors(false);
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={() => {
                setShowErrors(false);
            }}
            TransitionComponent={Transition}
            keepMounted
            aria-describedby="create-edit-bin-dialog"
            sx={{ "& .MuiPaper-root": { minWidth: "50vw", borderRadius: "10px" } }}
        >
            <Box
                className="popup-header-wrapper"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.2,
                    bgcolor: "primary.main",
                }}
            >
                <h2 className="dialog-header" style={{ color: "#fff", margin: 0 }}>
                    {editFlag ? "Edit Bin" : "Create Bin"}
                </h2>
                <IoClose
                    fontSize={22}
                    onClick={() => {
                        setShowErrors(false);
                        close();
                    }}
                    cursor="pointer"
                    color="#fff"
                />
            </Box>

            <DialogContent sx={{ p: "10px 24px 8px" }}>
                <Grid container spacing={2}>
                    {FIELD_DEFS.map((field) => {
                        return (
                            <Grid key={String(field.name)} item {...field.size}>
                                <MuiText variant="h6" my={1} className="admin-label-title">
                                    {field.label} {field.isRequired && <span className="mandatory-sign">*</span>}
                                </MuiText>

                                {field.type === "autocomplete-warehouse" && (
                                    <Autocomplete<WarehouseOption>
                                        options={activeWarehouses}
                                        value={currentWarehouse}
                                        onChange={(_e, v) => {
                                            onChange("warehouseId", v?.id ?? "");
                                        }}
                                        getOptionLabel={(o) =>
                                            o?.warehouseCode ? `${o.warehouseCode} - ${o.warehouseName}` : o?.warehouseName ?? ""
                                        }
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                error={hasErr("warehouseId")}
                                                helperText={help("warehouseId", field.label)}
                                            />
                                        )}
                                    />
                                )}

                                {field.type === "autocomplete-rack" && (
                                    <Autocomplete<RackOption>
                                        options={
                                            currentRack && !rOptionsBase.some((r) => r.id === currentRack.id)
                                                ? [currentRack, ...rOptionsBase]
                                                : rOptionsBase
                                        }
                                        value={currentRack}
                                        onChange={(_e, v) => onChange("rackId", v?.id ?? "")}
                                        getOptionLabel={(o) =>
                                            o?.rackCode ? `${o.rackCode}${o.rackName ? ` - ${o.rackName}` : ""}` : o?.rackName ?? ""
                                        }
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => <TextField {...params} size="small" error={hasErr("warehouseId")}
                                            helperText={help("warehouseId", field.label)} />}
                                    />
                                )}

                                {field.type === "autocomplete-uom" && (
                                    <Autocomplete<UomOption>
                                        options={uoms}
                                        value={currentUom}
                                        onChange={(_e, v) => onChange("capacityUOMId", v?.id ?? "")}
                                        getOptionLabel={(o) => o?.uomName ?? ""}
                                        isOptionEqualToValue={(a, b) => a.id === b.id}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                error={hasErr("capacityUOMId")}
                                                helperText={help("capacityUOMId", field.label)}
                                            />
                                        )}
                                    />
                                )}

                                {field.type === "select-status" && (
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.status}
                                        onChange={(e) => onChange("status", e.target.value as BinStatus)}
                                        error={hasErr("status")}
                                        helperText={help("status", field.label)}
                                    >
                                        {statusOptions.map((s) => (
                                            <MenuItem key={s} value={s}>
                                                {s}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}

                                {(field.type === "text" || field.type === "number") && (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type={field.type === "number" ? "number" : "text"}
                                        value={String(form[field.name] ?? "")}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (field.type === "number") {
                                                onChange(field.name, val === "" ? "" : Number(val));
                                            } else {
                                                if (field.maxLength) onChange(field.name, val.slice(0, field.maxLength));
                                                else onChange(field.name, val);
                                            }
                                        }}
                                        inputProps={{
                                            maxLength: field.maxLength,
                                            min: field.min,
                                            max: field.max,
                                            readOnly: field.readOnly || undefined,
                                        }}
                                        error={hasErr(field.name)}
                                        helperText={help(field.name, field.label)}
                                    />
                                )}
                            </Grid>
                        );
                    })}
                </Grid>
            </DialogContent>

            <DialogActions
                sx={{ borderTop: "1px solid #f1f1f1", py: 2, justifyContent: "flex-end", px: { xs: 2, md: 3 } }}
            >
                <MuiButton
                    variant="outlined"
                    onClick={() => {
                        setShowErrors(false);
                        close();
                    }}
                >
                    Cancel
                </MuiButton>
                <MuiButton
                    variant="contained"
                    onClick={() => {
                        setShowErrors(true);
                        onSubmit();
                    }}
                    disabled={!!submitDisabled}
                >
                    Submit
                </MuiButton>
            </DialogActions>
        </Dialog>
    );
};

export default CreateBinMaster;
