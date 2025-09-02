import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import BreadcrumbsNav from "../../../atoms/ModernComponents/BreadcrumbsNav";
import GeneralInfoIndent from "./GeneralInfoIndent";
import { MuiButton, MuiText } from "bsoft-base-elements";
import IndentItemDetails from "./IndentItemDetails";
import dayjs from "dayjs";
import { HiSquaresPlus } from "react-icons/hi2";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import PurchaseConfig from "../../../../utils/purchase.api.json";
import Config from "../../../../utils/config.api.json";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";

// Styled components for consistent styling
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${theme.palette.grey[200]}`,
  overflowX: "auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  backgroundColor: theme.palette.background.paper,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.08
  )} 0%, ${alpha(theme.palette.primary.main, 0.12)} 100%)`,
  "& .MuiTableCell-head": {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: theme.palette.text.secondary,
    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    padding: "14px 12px",
    whiteSpace: "nowrap",
  },
}));

let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return idCounter.toString();
};

const initialItems = [
  {
    id: generateId(),
    category: "Electronics",
    item: "Laptop",
    quantityRequired: "10",
    uom: "Pieces",
    requiredDate: dayjs("2024-07-31"),
    currentStock: "5",
    pendingQty: "3",
    lastPurchaseRate: "1000",
    totalEstimatedCost: "10000",
    remarks: "Urgent requirement",
  },
  {
    id: generateId(),
    category: "Furniture",
    item: "Chair",
    quantityRequired: "20",
    uom: "Pieces",
    requiredDate: dayjs().add(7, "days"),
    currentStock: "10",
    pendingQty: "4",
    lastPurchaseRate: "50",
    totalEstimatedCost: "1000",
    remarks: "New office setup",
  },
];

const emptyItem = {
  id: generateId(),
  category: "",
  item: "",
  quantityRequired: "",
  uom: "",
  requiredDate: null,
  currentStock: "",
  pendingQty: "",
  lastPurchaseRate: "",
  totalEstimatedCost: "",
  remarks: "",
};

function IndentPage() {
  const userValue = useRecoilValue(UserData);

  const [pathArr, setPathArr] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({
    indentDate: null,
    indentType: "",
    unit: "",
    department: "",
    raisedBy: "",
    purpose: "",
  });

  const [items, setItems] = useState(initialItems);

  const handleItemChange = (id: string, name: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [name]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev: any) => [...prev, { ...emptyItem, id: generateId() }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const segments: string[] = window.location.pathname
        .split("/")
        .filter(Boolean);
      setPathArr(segments);
    }
  }, []);

  useEffect(() => {
    if (userValue.unitName !== "" && userValue.name !== "") {
      setFormData({
        ...formData,
        raisedBy: userValue.name,
        unit: userValue.unitName,
      });
    }
  }, [userValue.name, userValue.unitName]);

  const handleSave = () => {
    // You can validate and submit formData and items here
    console.log("General Info:", formData);
    console.log("Items:", items);

    // TODO: add API calls or further processing here
  };

  const { data: IndentType } = useDataFetchHook(
    PurchaseConfig.PurchaseMisc.endpoint.replace("{type}", "IndentType"),
    PurchaseConfig.PurchaseMisc.method,
    "purchase"
  );

  const { data: Department } = useDataFetchHook(
    Config.Department.getDepartment.endpoint,
    Config.Department.getDepartment.method
  );

  return (
    <Box component={"main"}>
      <BreadcrumbsNav pathArr={pathArr} />
      <Box component={"section"} className="section-wrapper">
        <GeneralInfoIndent
          formData={formData}
          handleInputChange={handleInputChange}
          RegistrationTypes={IndentType}
          DepartmentData={Department}
        />
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          py={2}
        >
          <MuiText
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#3a8484",
              fontSize: "1rem",
            }}
          >
            Item Details
          </MuiText>
          <MuiButton
            startIcon={<HiSquaresPlus />}
            sx={{
              borderRadius: "4px !important",
              p: "4px 16px !important",
              mt: 2,
            }}
            variant="contained"
            onClick={handleAddItem}
          >
            Add Item
          </MuiButton>
        </Box>
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <StyledTableContainer>
            <Table size="small">
              <StyledTableHead>
                <TableRow>
                  <TableCell sx={{ width: 50, textAlign: "center" }}>
                    #
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>Category</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Item</TableCell>
                  <TableCell align="center" sx={{ minWidth: 80 }}>
                    Qty
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 100 }}>
                    Rate
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 80 }}>
                    UOM
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>Date</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Cost</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Stock Info</TableCell>
                  <TableCell sx={{ width: 60, textAlign: "center" }}>
                    Action
                  </TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {items.map((item, index) => (
                  <IndentItemDetails
                    key={item.id}
                    formData={item}
                    index={index}
                    handleInputChange={(name, value) =>
                      handleItemChange(item.id, name, value)
                    }
                    onRemove={handleRemoveItem}
                  />
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Paper>
        <Box mt={2}>
          <MuiButton variant="outlined" onClick={handleSave}>
            Submit
          </MuiButton>
        </Box>
      </Box>
    </Box>
  );
}

export default IndentPage;
