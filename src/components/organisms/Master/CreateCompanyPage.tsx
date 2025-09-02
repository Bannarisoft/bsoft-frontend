"use client";

import {
  Autocomplete,
  Box,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid2,
  IconButton,
  InputAdornment,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { HiOutlineUpload } from "react-icons/hi";
import { FaCirclePlus, FaTrashCan } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { CiMenuKebab } from "react-icons/ci";
import Config from "../../../../src/utils/config.api.json";
import {
  Apirequest,
  emailRegex,
  gstRegex,
  isSubmitting,
  startLoading,
  stopLoading,
  websiteRegex,
} from "../../../utils/lib";
import { LiaAddressCardSolid } from "react-icons/lia";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import { useDropzone, FileWithPath } from "react-dropzone";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

function CreateCompanyPage({ companyId }: { companyId?: string }) {
  const [file, setFile] = useState<FormData | null>(null);
  const [address, setAddress] = React.useState<string>("");
  const [addresses, setAddresses] = React.useState<string[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [entityData, setEntityData] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);
  const [cityData, setCityData] = React.useState([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [flag, setFlag] = useState<boolean>(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const router = useRouter();
  const [companyInput, setCompanyInput] = React.useState({
    companyName: "",
    legalName: "",
    gstNumber: "",
    tin: "",
    tan: "",
    pan: "",
    yearOfEstablishment: "",
    website: "",
    logo: "",
    isActive: 1,
    pincode: 0,
    phone: "",
    alternatePhone: "",
    city: 0,
    state: 0,
    country: 0,
    entity: "",
  });

  const [companyContact, setCompanyContact] = useState({
    contactName: "",
    designation: "",
    email: "",
    contactPhone: "",
    remarks: "",
  });

  const handleAutocomplete = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    setErrors([]);
    if (field === "country") {
      if (!value) {
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
        setStateData([]);
        setCityData([]);
      } else {
        setSelectedCountry(value);
        GetState(value.id);
      }
    } else if (field === "state") {
      if (!value) {
        setSelectedState(null);
        setSelectedCity(null);
        setCityData([]);
      } else {
        setSelectedState(value);
        GetCity(value.id);
      }
    } else if (field === "city") {
      setSelectedCity(value);
    } else if (field === "entity") {
      setSelectedEntity(value);
    }
  };

  const handleCompanyContact = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCompanyContact({ ...companyContact, [name]: value });
    setErrors([]);
  };

  const handleSubmit = async () => {
    const temp: string[] = [];
    if (isSubmitting()) return;
    const validationRules = {
      companyName: (value: string) => value.length > 3,
      legalName: (value: string) => value.length > 3,
      entityId: (value: string) => value.length > 3,
      gstNumber: (value: string) => gstRegex.test(value),
      website: (value: string) => websiteRegex.test(value),
      pincode: (value: string) => value.length === 6,
      phone: (value: string) => value.length === 10,
      alternatePhone: (value: string) => value.length === 10,
      yearOfEstablishment: (value: string) => value.length === 4,
      contactName: (value: string) => value.length > 3,
      contactPhone: (value: string) => value.length === 10,
      designation: (value: string) => value.length > 3,
      email: (value: string) => emailRegex.test(value),
    };

    const combinedObject = { ...companyInput, ...companyContact };
    delete (combinedObject as any)["isActive"];
    delete (combinedObject as any)["remarks"];
    delete (combinedObject as any)["tin"];
    delete (combinedObject as any)["tan"];
    delete (combinedObject as any)["pan"];
    delete (combinedObject as any)["alternatePhone"];
    delete (combinedObject as any)["contactPhone"];
    delete (combinedObject as any)["logo"];
    delete (combinedObject as any)["city"];
    delete (combinedObject as any)["state"];
    delete (combinedObject as any)["country"];
    delete (combinedObject as any)["entity"];

    Object.entries(combinedObject).forEach(([key, value]) => {
      // @ts-ignore
      if (!validationRules[key]?.(value?.toString())) {
        temp.push(key);
      }
    });

    if (!selectedCountry) temp.push("country");
    if (!selectedState) temp.push("state");
    if (!selectedEntity) temp.push("entity");
    if (addresses.length < 1) temp.push("address");
    setErrors(temp);
    if (temp.length === 0) {
      try {
        if (companyId) {
          await UpdateCompany();
        } else {
          await AddCompany();
        }
      } catch (err) {
        console.error("Error in handleSubmit:", err);
      } finally {
        stopLoading();
      }
    } else {
      toast.error("Please fill all required fields");
      stopLoading();
    }
  };

  const CompanyPayload: any = {
    company: {
      companyName: companyInput.companyName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      legalName: companyInput.legalName?.trim(),
      gstNumber: companyInput.gstNumber?.trim(),
      tin: companyInput.tin?.trim(),
      tan: companyInput.tan?.trim(),
      cstNo: companyInput.pan?.trim(),
      yearOfEstablishment: companyInput.yearOfEstablishment,
      website: companyInput.website?.trim(),
      entityId: selectedEntity?.id ?? "",
      logo: file,
      isActive: companyInput.isActive,
      companyAddress: {
        addressLine1: addresses.at(0) ?? "",
        addressLine2: addresses.at(0) ?? "",
        pinCode: companyInput.pincode,
        countryId: selectedCountry?.id,
        stateId: selectedState?.id,
        cityId: selectedCity?.id,
        phone: companyInput.phone?.trim(),
        alternatePhone: companyInput.alternatePhone?.trim(),
      },
      companyContact: {
        name: companyContact.contactName?.trim(),
        designation: companyContact.designation?.trim(),
        email: companyContact.email?.trim(),
        phone: companyContact.contactPhone?.trim(),
        remarks: companyContact.remarks?.trim(),
      },
    },
  };

  const AddCompany = async () => {
    try {
      startLoading();
      const { endpoint, method } = Config.Company.AddCompany;
      const response = await Apirequest(endpoint, method, CompanyPayload).then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setTimeout(() => {
          router.push("/master/company");
        }, 300);
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Something Went Wrong, Please try again after sometime");
    } finally {
      stopLoading();
    }
  };

  const UpdateCompany = async () => {
    if (companyId) {
      CompanyPayload["company"]["id"] = companyId;
    }
    try {
      startLoading();
      const { endpoint, method } = Config.Company.UpdateCompany;
      const response = await Apirequest(endpoint, method, CompanyPayload).then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setTimeout(() => {
          router.push("/master/company");
        }, 300);
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Something Went Wrong, Please try again after sometime");
    } finally {
      stopLoading();
    }
  };

  const GetCountryList = async () => {
    try {
      const { endpoint, method } = Config.Countries.getCountry;
      const result = await Apirequest(endpoint, method);
      setCountryData(result?.data?.data);
    } catch (err) {
      console.log(err);
      setCountryData([]);
    }
  };

  const GetEntityList = async () => {
    try {
      const { endpoint, method } = Config.Entities.getEntity;
      const result = await Apirequest(endpoint, method);
      setEntityData(result?.data?.data);
    } catch (err) {
      console.log(err);
      setEntityData([]);
    }
  };

  const GetState = async (id: number) => {
    try {
      const { endpoint, method } = Config.State.getById;
      const result = await Apirequest(
        endpoint.replace(`{countryId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      setStateData(result.data);
    } catch (err) {
      console.log(err);
      setStateData([]);
    }
  };

  const GetCity = async (id: number) => {
    try {
      const { endpoint, method } = Config.City.getById;
      const result = await Apirequest(
        endpoint.replace(`{stateId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      setCityData(result.data);
    } catch (err) {
      console.log(err);
      setCityData([]);
    }
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
    setErrors([]);
  };

  const handleAddressAdd = () => {
    if (address.trim() !== "") {
      if (isEditing) {
        const updatedAddresses = [...addresses];
        updatedAddresses[editingIndex!] = address;
        setAddresses(updatedAddresses);
        setIsEditing(false);
        setEditingIndex(null);
      } else {
        setAddresses((prevAddresses) => [...prevAddresses, address]);
      }
      setAddress("");
    }
  };

  const handleEditAddress = (address: string, index: number) => {
    setAddress(address);
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDeleteAddress = (index: number) => {
    setAddresses((prevAddresses) =>
      prevAddresses.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    GetCountryList();
    GetEntityList();
  }, []);

  const GetCompanyData = async () => {
    try {
      const { endpoint, method } = Config.Company.GetCompany;
      const result = await Apirequest(
        endpoint.replace(`{id}`, companyId ? companyId.toString() : ""),
        method
      ).then((res) => res.data.data);
      if (result?.companyAddress?.stateId)
        GetState(result?.companyAddress?.countryId);
      if (result?.companyAddress?.cityId)
        GetCity(result?.companyAddress?.stateId);
      setCompanyInput({
        ...companyInput,
        companyName: result?.companyName,
        legalName: result?.legalName,
        phone: result?.companyAddress?.phone,
        alternatePhone: result?.companyAddress?.alternatePhone,
        gstNumber: result?.gstNumber,
        pan: result?.cstNo,
        tin: result?.tin,
        tan: result?.tan,
        yearOfEstablishment: result?.yearOfEstablishment,
        website: result?.website,
        pincode: result?.companyAddress?.pinCode,
        logo: result?.logoBase64,
        city: result?.companyAddress?.cityId,
        state: result?.companyAddress?.stateId,
        country: result?.companyAddress?.countryId,
        entity: result?.entityId,
        isActive: result?.isActive,
      });
      setCompanyContact({
        ...companyContact,
        contactName: result?.companyContact?.name,
        designation: result?.companyContact?.designation,
        email: result?.companyContact?.email,
        contactPhone: result?.companyContact?.phone,
        remarks: result?.companyContact?.remarks,
      });
      setFile(result?.logo);
      const addressMerge = [
        result?.companyAddress?.addressLine1,
        result?.companyAddress?.addressLine2,
      ];
      setAddresses(addressMerge);
      setFlag(true);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (flag) {
      const getCountry = countryData
        ?.filter((item) => item.id === companyInput.country)
        ?.at(0);
      const getState = stateData
        ?.filter((item) => item.id === companyInput.state)
        ?.at(0);
      const getCity = cityData
        ?.filter((item: any) => item.id === companyInput.city)
        ?.at(0);
      const getEntity = entityData
        ?.filter((item) => item.id === companyInput?.entity)
        ?.at(0);
      setSelectedEntity(getEntity);
      setSelectedCountry(getCountry);
      setSelectedState(getState);
      setSelectedCity(getCity);
    }
  }, [flag]);

  useEffect(() => {
    if (companyId) {
      GetCompanyData();
    }
  }, [companyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setCompanyInput({ ...companyInput, [name]: value });
    setErrors([]);
  };

  const onDrop = (acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length > 0) {
      const image = acceptedFiles[0] as File;
      convertFileToBinary(image);
    }
  };

  const convertFileToBinary = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const binaryData = reader.result as ArrayBuffer;
      const formData = new FormData();
      formData.append("file", new Blob([binaryData]), file.name);
      ImageUpload(formData);
    };
    reader.readAsArrayBuffer(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const ImageUpload = async (formData: FormData) => {
    try {
      if (formData) {
        const { endpoint, method } = Config.Image.upload;
        const result = await Apirequest(endpoint, method, formData).then(
          (res) => res.data
        );
        setCompanyInput({ ...companyInput, logo: result?.data?.logoBase64 });
        setFile(result?.data?.logo);
      }
    } catch (err) {
      console.error("Image upload failed: ", err);
    }
  };

  const DeleteImage = async () => {
    try {
      if (file) {
        const body = {
          logo: file,
        };
        const { endpoint, method } = Config.Image.delete;
        const result = await Apirequest(endpoint, method, body).then(
          (res) => res.data
        );
        setCompanyInput({ ...companyInput, logo: "" });
        setFile(result?.data?.logo);
      }
    } catch (err) {
      console.error("Image upload failed: ", err);
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setCompanyInput({ ...companyInput, isActive: 1 })
      : setCompanyInput({ ...companyInput, isActive: 0 });
  };
  const handleClose = () => {
    Swal.fire({
      title: "Are you sure you want to cancel the session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Okay",
      cancelButtonText: "No",
      customClass: {
        title: "custom-title",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/master/company");
      }
    });
  };

  return (
    <Box>
      <Box>
        <IconBreadcrumbs
          parent={"Master"}
          child={"Company"}
          subParent={companyId ? "Edit Company" : "Create Company"}
          path="/master/company"
        />
      </Box>
      <Divider sx={{ my: 2 }} />

      <Grid2
        container
        spacing={2}
        my={1}
        maxHeight={700}
        overflow={"auto"}
        p={2}
        bgcolor={"#fff"}
      >
        <Grid2
          size={{ xs: 12, sm: 12, md: 8, lg: 8 }}
          className="company-right-border"
          position={"relative"}
          pr={3}
        >
          <MuiText variant="h5" mb={"15px"} className="admin-page-title">
            General Information
          </MuiText>
          <Grid2 container spacing={2}>
            <Grid2 size={12} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Company Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="companyName"
                autoComplete="off"
                error={errors.includes("companyName")}
                helperText={
                  errors.includes("companyName") &&
                  "please enter valid company name"
                }
                value={
                  companyInput.companyName &&
                  companyInput.companyName.slice(0, 50)
                }
                onChange={handleInputChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Legal Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                autoComplete="off"
                size="small"
                name="legalName"
                error={errors.includes("legalName")}
                helperText={
                  errors.includes("legalName") &&
                  "please enter valid legal name"
                }
                value={
                  companyInput.legalName && companyInput.legalName.slice(0, 50)
                }
                onChange={handleInputChange}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Entity Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={entityData || []}
                id="country-autocomplete"
                fullWidth
                size="small"
                value={selectedEntity}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "entity"
                  )
                }
                getOptionLabel={(option: any) => option?.entityName}
                renderOption={(
                  props,
                  option: { id: string; entityName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.entityName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="country"
                    error={errors.includes("entity")}
                    helperText={
                      errors.includes("entity") && "Please select a entity"
                    }
                  />
                )}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Phone <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="tel"
                variant="outlined"
                autoComplete="off"
                size="small"
                name="phone"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/\D/g, "").slice(0, 10);
                }}
                inputProps={{ maxLength: 10 }}
                error={errors.includes("phone")}
                helperText={
                  errors.includes("phone") && "please enter valid phone number"
                }
                value={companyInput.phone}
                onChange={handleInputChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">+91</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Alternate Mobile Number
              </MuiText>
              <MuiInputField
                fullWidth
                type="tel"
                variant="outlined"
                size="small"
                autoComplete="off"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/\D/g, "").slice(0, 10);
                }}
                inputProps={{ maxLength: 10 }}
                name="alternatePhone"
                value={companyInput.alternatePhone}
                onChange={handleInputChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                GST <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="gstNumber"
                autoComplete="off"
                error={errors.includes("gstNumber")}
                helperText={
                  errors.includes("gstNumber") &&
                  "please enter valid GST number"
                }
                value={
                  companyInput.gstNumber &&
                  companyInput.gstNumber.slice(0, 50).toLocaleUpperCase()
                }
                onChange={handleInputChange}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                PAN
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                autoComplete="off"
                size="small"
                name="pan"
                value={
                  companyInput.pan &&
                  companyInput.pan.slice(0, 15).toLocaleUpperCase()
                }
                onChange={handleInputChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                TIN
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                autoComplete="off"
                variant="outlined"
                size="small"
                name="tin"
                value={
                  companyInput.tin &&
                  companyInput.tin.slice(0, 20).toLocaleUpperCase()
                }
                onChange={handleInputChange}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                TAN
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                autoComplete="off"
                size="small"
                name="tan"
                value={
                  companyInput.tan &&
                  companyInput.tan.slice(0, 20).toLocaleUpperCase()
                }
                onChange={handleInputChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Year of Estabilishment <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                name="yearOfEstablishment"
                error={errors.includes("yearOfEstablishment")}
                helperText={
                  errors.includes("yearOfEstablishment") &&
                  "please enter valid Established Year"
                }
                value={
                  companyInput.yearOfEstablishment &&
                  companyInput.yearOfEstablishment.toString().slice(0, 4)
                }
                onChange={handleInputChange}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Website <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="website"
                autoComplete="off"
                error={errors.includes("website")}
                helperText={
                  errors.includes("website") && "please enter valid website url"
                }
                value={
                  companyInput.website && companyInput.website.slice(0, 250)
                }
                onChange={handleInputChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Country Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={countryData || []}
                id="country-autocomplete"
                fullWidth
                size="small"
                value={selectedCountry}
                getOptionLabel={(option: any) => option?.countryName}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "country"
                  )
                }
                renderOption={(
                  props,
                  option: { countryCode: string; countryName: string }
                ) => (
                  <li {...props} key={option?.countryCode}>
                    {option?.countryName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="country"
                    error={errors.includes("country")}
                    helperText={
                      errors.includes("country") && "Please select a country"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                State Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={stateData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedState}
                defaultValue={selectedState}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "state"
                  )
                }
                getOptionLabel={(option: any) => option?.stateName}
                renderOption={(
                  props,
                  option: { stateCode: string; stateName: string }
                ) => (
                  <li {...props} key={option?.stateCode}>
                    {option?.stateName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    error={errors.includes("state")}
                    helperText={
                      errors.includes("state") && "Please select a state"
                    }
                  />
                )}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                City Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={cityData || []}
                id="city-autocomplete"
                fullWidth
                size="small"
                value={selectedCity}
                defaultValue={selectedCity}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "city"
                  )
                }
                getOptionLabel={(option: any) => option?.cityName}
                renderOption={(
                  props,
                  option: { cityCode: string; cityName: string }
                ) => (
                  <li {...props} key={option?.cityCode}>
                    {option?.cityName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    error={errors.includes("city")}
                    helperText={
                      errors.includes("city") && "Please select a city"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} mb={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Pincode <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                size="small"
                name="pincode"
                autoComplete="off"
                error={errors.includes("pincode")}
                helperText={
                  errors.includes("pincode") && "please enter valid pincode"
                }
                value={
                  companyInput.pincode &&
                    companyInput.pincode.toString() !== "0"
                    ? companyInput.pincode.toString().slice(0, 6)
                    : ""
                }
                onChange={handleInputChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
              <Box
                className="d-flex-center"
                gap={4}
                border={"2px solid #f1f1f1"}
                borderRadius={"6px"}
                py={2}
                mt={2}
                sx={{
                  cursor: file ? "not-allowed" : "pointer",
                  background:
                    "linear-gradient(180deg, #EFEFEF 0%, rgba(255, 255, 255, 0.78) 100%)",
                }}
                {...getRootProps()}
              >
                <input {...getInputProps()} disabled={!!file} />
                <Box
                  bgcolor={file ? "transparent" : "#f1f1f1"}
                  borderRadius={"50%"}
                  width={50}
                  height={50}
                  className="d-grid-center"
                  border={"1px solid #a5a5a5"}
                >
                  {file ? (
                    <img
                      src={`data:image/png;base64, ${companyInput.logo}`}
                      alt="Uploaded"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}
                    />
                  ) : (
                    <HiOutlineUpload color="#A5A5A5" fontSize={24} />
                  )}
                </Box>
                <MuiText
                  variant="h6"
                  className="breadcrumb-parent-title"
                  fontSize={15}
                >
                  {file ? "Delete to change logo" : "Upload Logo"}
                </MuiText>
                {file && (
                  <FaTrashCan
                    style={{ zIndex: 10 }}
                    cursor={"pointer"}
                    color="red"
                    onClick={(e: React.MouseEvent<SVGElement>) => {
                      e.stopPropagation();
                      DeleteImage();
                    }}
                  />
                )}
              </Box>
            </Grid2>
            <Grid2
              size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
              display={"flex"}
              alignItems={"center"}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="status"
                      color="secondary"
                      checked={companyInput.isActive === 1}
                      onChange={handleSwitch}
                    />
                  }
                  label="Status"
                  sx={{
                    pl: 2,
                    "& span": {
                      fontFamily: "var(--poppins-font)",
                    },
                  }}
                />
              </FormGroup>
            </Grid2>
          </Grid2>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 12, md: 4, lg: 4 }} pl={1}>
          <MuiText variant="h5" mb={"15px"} className="admin-page-title">
            Company Contact
          </MuiText>
          <Grid2 size={12} mb={"12px"}>
            <MuiText
              variant="h6"
              my={1}
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Contact Name <span className="mandatory-sign">*</span>
            </MuiText>
            <MuiInputField
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              name="contactName"
              autoComplete="off"
              error={errors.includes("contactName")}
              helperText={
                errors.includes("contactName") &&
                "please enter valid contact name"
              }
              value={
                companyContact.contactName &&
                companyContact.contactName.slice(0, 50)
              }
              onChange={handleCompanyContact}
            />
          </Grid2>
          <Grid2 size={12} mb={"12px"} mt={2.5}>
            <MuiText
              variant="h6"
              my={1}
              mb={"2px"}
              className="admin-label-title"
            >
              Designation <span className="mandatory-sign">*</span>
            </MuiText>
            <MuiInputField
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              name="designation"
              autoComplete="off"
              value={
                companyContact.designation &&
                companyContact.designation.slice(0, 50)
              }
              error={errors.includes("designation")}
              helperText={
                errors.includes("designation") &&
                "please enter valid designation"
              }
              onChange={handleCompanyContact}
            />
          </Grid2>
          <Grid2 size={12} mb={"12px"} mt={2.5}>
            <MuiText
              variant="h6"
              my={1}
              mb={"2px"}
              className="admin-label-title"
            >
              Email <span className="mandatory-sign">*</span>
            </MuiText>
            <MuiInputField
              fullWidth
              type="email"
              variant="outlined"
              size="small"
              autoComplete="off"
              name="email"
              value={companyContact.email && companyContact.email.slice(0, 50)}
              error={errors.includes("email")}
              helperText={
                errors.includes("email") && "please enter valid email"
              }
              onChange={handleCompanyContact}
            />
          </Grid2>
          <Grid2 size={12} mb={"12px"} mt={2.5}>
            <MuiText
              variant="h6"
              my={1}
              mb={"2px"}
              className="admin-label-title"
            >
              Phone
            </MuiText>
            <MuiInputField
              fullWidth
              type="tel"
              variant="outlined"
              size="small"
              autoComplete="off"
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/\D/g, "").slice(0, 10);
              }}
              inputProps={{ maxLength: 10 }}
              name="contactPhone"
              value={
                companyContact.contactPhone &&
                companyContact.contactPhone.slice(0, 15)
              }
              onChange={handleCompanyContact}
            />
            <MuiText variant="h6" mt={"20px"} className="admin-label-title">
              Remarks
            </MuiText>
            <MuiInputField
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              name="remarks"
              rows={3}
              multiline
              value={companyContact.remarks}
              onChange={handleCompanyContact}
            />
            <Divider sx={{ mt: 3.5, mb: 1, borderWidth: "1px" }} />
            <Grid2 size={12} mb={2}>
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                mb={2}
              >
                <MuiText
                  variant="h5"
                  mb={"0px !important"}
                  className="admin-page-title"
                >
                  Company Address <span className="mandatory-sign">*</span>
                </MuiText>
                <IconButton
                  disabled={!isEditing && addresses.length == 2}
                  onClick={handleAddressAdd}
                >
                  <FaCirclePlus
                    fontSize={24}
                    color="#127C9E"
                    cursor={"pointer"}
                  />
                </IconButton>
              </Box>
              <MuiInputField
                size="small"
                fullWidth
                value={address}
                onChange={handleAddressChange}
                error={errors.includes("address")}
                helperText={
                  errors.includes("address") &&
                  "please enter minimum one address line"
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LiaAddressCardSolid fontSize={20} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {addresses.map((address, index) => (
                <Card
                  sx={{
                    background:
                      "linear-gradient(180deg, #EFEFEF 0%, rgba(255, 255, 255, 0.78) 100%)",
                    "& .MuiCardHeader-action": {
                      m: 0,
                    },
                    mt: 2,
                    "& .MuiCardHeader-root": {
                      justifyContent: "space-between",
                    },
                  }}
                  key={index}
                >
                  <CardHeader
                    sx={{
                      "& span": {
                        fontFamily: "var(--poppins-font)",
                        fontSize: 16,
                      },
                    }}
                    action={
                      <Box className="d-flex-center" gap={2}>
                        <MdEdit
                          fontSize={20}
                          cursor="pointer"
                          onClick={() => handleEditAddress(address, index)}
                        />
                        <RiDeleteBin6Fill
                          fontSize={20}
                          cursor="pointer"
                          onClick={() => handleDeleteAddress(index)}
                        />
                      </Box>
                    }
                    className="company-address-card"
                    title={address}
                  />
                </Card>
              ))}
            </Grid2>
            <Grid2 size={12} my={2}>
              {companyContact.contactName && (
                <>
                  <Box mb={2}>
                    <MuiText variant="h5" className="admin-page-title">
                      Contacts
                    </MuiText>
                  </Box>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(180deg, #EFEFEF 0%, rgba(255, 255, 255, 0.78) 100%)",
                      "& .MuiCardHeader-action": {
                        m: 0,
                      },
                    }}
                  >
                    <CardHeader
                      sx={{
                        "& .MuiCardHeader-title": {
                          fontFamily: "var(--poppins-font)",
                          fontSize: 16,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: 200,
                        },
                        "& .MuiCardHeader-subheader": {
                          fontFamily: "var(--poppins-font)",
                          fontSize: 14,
                          pt: 1,
                        },
                        "& .MuiChip-label": {
                          fontFamily: "var(--poppins-font)",
                          fontSize: 14,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: 100,
                        },
                      }}
                      action={
                        <Box className="d-flex-center" gap={3}>
                          <Chip
                            label={companyContact.designation}
                            variant="outlined"
                          />
                          <CiMenuKebab fontSize={20} cursor="pointer" />
                        </Box>
                      }
                      title={companyContact.contactName}
                      subheader={`+91 ${companyContact.contactPhone}`}
                    />
                  </Card>
                </>
              )}
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"end"}
        gap={2}
        borderTop={"2px solid #f1f1f1"}
        py={"20px"}
        mt={2}
      >
        <Box display={"flex"} gap={2}>
          <MuiButton
            className="dialog-cancel-btn"
            variant="outlined"
            onClick={handleClose}
          >
            Cancel
          </MuiButton>

          <MuiButton
            className="filled-icon-btn"
            disabled={isSubmitting()}
            onClick={handleSubmit}
          >
            Submit
          </MuiButton>
        </Box>
      </Box>
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
      {/* <LoginResponsePopUp
        open={open}
        close={handleClose}
        status={status ?? 0}
        message={message}
      /> */}
    </Box>
  );
}

export default CreateCompanyPage;
