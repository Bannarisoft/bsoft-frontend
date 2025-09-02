import { Autocomplete, Box, DialogTitle, Grid2 } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import Config from "../../../../src/utils/config.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

function CompanySettingsPage() {
  const userValue = useRecoilValue(UserData);

  const [inputs, setInputs] = useState({
    companyId: "",
    passwordHistoryCount: "",
    sessionTimeout: "",
    failedLoginAttempts: "",
    autoReleaseTime: "",
    passwordExpiryDays: "",
    passwordExpiryAlert: "",
    twoFactorAuth: 0,
    maxConcurrentLogins: "",
    forgotPasswordCodeExpiry: "",
    captchaOnLogin: 0,
    currency: "",
    language: "",
    timeZone: "",
    financialYear: "",
    id: 0,
  });
  const [errors, setErrors] = useState([]);
  const [currencyData, setCurrencyData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [timezoneData, setTimezoneData] = useState([]);
  const [financeYearData, setFinanceYearData] = useState([]);
  const [editFlag, setEditFlag] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedFinancial, setSelectedFinancial] = useState<{
    id: string;
    startYear: string;
  } | null>(null);

  const handleAutoComplete = (newValue: any, name: string) => {
    switch (name) {
      case "currency":
        setSelectedCurrency(newValue);
        break;
      case "language":
        setSelectedLanguage(newValue);
        break;
      case "timezone":
        setSelectedTimeZone(newValue);
        break;
      case "financial":
        setSelectedFinancial(newValue);
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
    setErrors([]);
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, checked } = e.target;
    setInputs({ ...inputs, [name]: checked ? 1 : 0 });
    setErrors([]);
  };

  const AddCompanySettings = async () => {
    try {
      startLoading();
      const body = {
        companyId: userValue.companyId,
        passwordHistoryCount: inputs.passwordHistoryCount,
        sessionTimeout: inputs.sessionTimeout,
        failedLoginAttempts: inputs.failedLoginAttempts,
        autoReleaseTime: inputs.autoReleaseTime,
        passwordExpiryDays: inputs.passwordExpiryDays,
        passwordExpiryAlert: inputs.passwordExpiryAlert,
        twoFactorAuth: inputs.twoFactorAuth,
        maxConcurrentLogins: inputs.maxConcurrentLogins,
        forgotPasswordCodeExpiry: inputs.forgotPasswordCodeExpiry,
        captchaOnLogin: inputs.captchaOnLogin,
        currency: selectedCurrency?.id,
        language: selectedLanguage?.id,
        timeZone: selectedTimeZone?.id,
        financialYear: selectedFinancial?.id,
      };
      const { endpoint, method } = Config.CompanySettings;
      const result = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );
      if (result?.statusCode === 201) {
        Swal.fire({
          title: "Company Settings created successfully",
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        });
      }
      GetCompanySettings();
    } catch (err) {
      GetCompanySettings();
    } finally {
      stopLoading();
    }
  };

  const UpdateCompanySettings = async () => {
    try {
      startLoading();
      const body = {
        companyId: userValue.companyId,
        passwordHistoryCount: inputs.passwordHistoryCount,
        sessionTimeout: inputs.sessionTimeout,
        failedLoginAttempts: inputs.failedLoginAttempts,
        autoReleaseTime: inputs.autoReleaseTime,
        passwordExpiryDays: inputs.passwordExpiryDays,
        passwordExpiryAlert: inputs.passwordExpiryAlert,
        twoFactorAuth: inputs.twoFactorAuth,
        maxConcurrentLogins: inputs.maxConcurrentLogins,
        forgotPasswordCodeExpiry: inputs.forgotPasswordCodeExpiry,
        captchaOnLogin: inputs.captchaOnLogin,
        currency: selectedCurrency?.id,
        language: selectedLanguage?.id,
        timeZone: selectedTimeZone?.id,
        financialYear: selectedFinancial?.id,
        id: inputs.id,
      };
      const { endpoint, method } = Config.CompanySettings.updateCompany;
      const result = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );
      if (result?.statusCode === 200) {
        Swal.fire({
          title: "Company Settings updated successfully",
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        });
      }
      GetCompanySettings();
    } catch (err) {
      GetCompanySettings();
    } finally {
      stopLoading();
    }
  };

  const GetCurrencyList = async () => {
    try {
      const { endpoint, method } = Config.Currency.getByName;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setCurrencyData(result.data);
    } catch (err) {}
  };

  const GetLanguageList = async () => {
    try {
      const { endpoint, method } = Config.Language.getByName;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setLanguageData(result.data);
    } catch (err) {}
  };

  const GetTimeZoneList = async () => {
    try {
      const { endpoint, method } = Config.TimeZone.getByName;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setTimezoneData(result.data);
    } catch (err) {}
  };

  const GetFinaceYearList = async () => {
    try {
      const { endpoint, method } = Config.FinanceYear.getByName;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setFinanceYearData(result.data);
    } catch (err) {}
  };

  const GetCompanySettings = async () => {
    try {
      const { endpoint, method } = Config.CompanySettings.getCompany;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      if (result?.data) {
        setEditFlag(true);
        setInputs({
          ...inputs,
          passwordHistoryCount: result?.data?.passwordHistoryCount,
          sessionTimeout: result?.data?.sessionTimeout,
          failedLoginAttempts: result?.data?.failedLoginAttempts,
          autoReleaseTime: result?.data?.autoReleaseTime,
          passwordExpiryDays: result?.data?.passwordExpiryDays,
          passwordExpiryAlert: result?.data?.passwordExpiryAlert,
          maxConcurrentLogins: result?.data?.maxConcurrentLogins,
          forgotPasswordCodeExpiry: result?.data?.forgotPasswordCodeExpiry,
          currency: result?.data?.currency,
          language: result?.data?.language,
          timeZone: result?.data?.timeZone,
          financialYear: result?.data?.financialYear,
          id: result?.data?.id,
        });
      } else {
        setEditFlag(false);
        setInputs({
          companyId: "",
          passwordHistoryCount: "",
          sessionTimeout: "",
          failedLoginAttempts: "",
          autoReleaseTime: "",
          passwordExpiryDays: "",
          passwordExpiryAlert: "",
          twoFactorAuth: 0,
          maxConcurrentLogins: "",
          forgotPasswordCodeExpiry: "",
          captchaOnLogin: 0,
          currency: "",
          language: "",
          timeZone: "",
          financialYear: "",
          id: 0,
        });
      }
    } catch (err) {}
  };

  useEffect(() => {
    const getCurrency =
      currencyData?.filter((i: any) => i.id == inputs.currency).at(0) || null;
    const getFinancial =
      financeYearData?.filter((i: any) => i.id == inputs.financialYear).at(0) ||
      null;
    const getTimeZone =
      timezoneData?.filter((i: any) => i.id == inputs.timeZone).at(0) || null;
    const getLanguage =
      languageData?.filter((i: any) => i.id == inputs.language).at(0) || null;
    setSelectedCurrency(getCurrency);
    setSelectedFinancial(getFinancial);
    setSelectedTimeZone(getTimeZone);
    setSelectedLanguage(getLanguage);
  }, [inputs]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting()) return;
    startLoading();

    try {
      if (editFlag) {
        await UpdateCompanySettings();
      } else {
        await AddCompanySettings();
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save company settings");
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    GetCurrencyList();
    GetLanguageList();
    GetTimeZoneList();
    GetFinaceYearList();
    GetCompanySettings();
  }, []);

  return (
    <div>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={"16px"}
      >
        <Box>
          <IconBreadcrumbs parent="Settings" child="Company Settings" path="" />
        </Box>
      </Box>
      <Box
        bgcolor={"#fff"}
        p={2}
        my={2}
        pt={0}
        sx={{
          "& label": {
            color: "#000",
            fontSize: 22,
            fontWeight: 400,
            fontFamily: "var(--poppins-font) !important",
            bgcolor: "#fff",
          },
        }}
      >
        <DialogTitle className="highlighted-header">
          {"Company Settings"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <Grid2 container spacing={3} mt={2}>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                name="passwordHistoryCount"
                value={inputs.passwordHistoryCount.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  if (parseInt((e.target as HTMLInputElement).value) < 0) {
                    (e.target as HTMLInputElement).value = "0";
                  }
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                label="Password History Count"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              {/* <TextComponent
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Session Time Out
              </TextComponent> */}
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                name="sessionTimeout"
                value={inputs.sessionTimeout.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0 || value > 30) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      30
                    ).toString();
                  }
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                label="Idle Session Time Out (mins)"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              {/* <TextComponent
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Failed Login Attempts
              </TextComponent> */}
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                name="failedLoginAttempts"
                value={inputs.failedLoginAttempts.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0 || value > 5) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      5
                    ).toString();
                  }
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                label="Failed Login Attempts"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              {/* <TextComponent
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Auto Release Time <i>(ms)</i>
              </TextComponent> */}
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                name="autoReleaseTime"
                value={inputs.autoReleaseTime.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0 || value > 60) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      60
                    ).toString();
                  }
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                label={`Auto Release Time (s)`}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              {/* <TextComponent
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Password Expiry Days
              </TextComponent> */}
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                name="passwordExpiryDays"
                value={inputs.passwordExpiryDays.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0 || value > 90) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      90
                    ).toString();
                  }
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                label="Password Expiry Days"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              {/* <TextComponent
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Password Expiry Alert
              </TextComponent> */}
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                name="passwordExpiryAlert"
                value={inputs.passwordExpiryAlert.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0 || value > 90) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      90
                    ).toString();
                  }
                }}
                label="Password Expiry Alert"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                name="maxConcurrentLogins"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={inputs.maxConcurrentLogins.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0 || value > 10) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      10
                    ).toString();
                  }
                }}
                label="Max Concurrent Logins"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="medium"
                name="forgotPasswordCodeExpiry"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={inputs.forgotPasswordCodeExpiry.toString().slice(0, 2)}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0 || value > 30) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      30
                    ).toString();
                  }
                }}
                label="Forgot Password Code Expiry (Mins)"
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Currency
              </MuiText>
              <Autocomplete
                disablePortal
                options={currencyData || []}
                fullWidth
                value={selectedCurrency}
                onChange={(event, newValue) => {
                  handleAutoComplete(newValue, "currency");
                }}
                getOptionLabel={(option: any) => option.code || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option.id === value.id
                }
                renderInput={(params) => (
                  <MuiInputField {...params} size="medium" />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Language
              </MuiText>
              <Autocomplete
                disablePortal
                options={languageData || []}
                fullWidth
                value={selectedLanguage}
                onChange={(event, newValue) => {
                  handleAutoComplete(newValue, "language");
                }}
                getOptionLabel={(option: any) => option.name || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option.id === value.id
                }
                renderInput={(params) => (
                  <MuiInputField {...params} size="medium" />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Time Zone
              </MuiText>
              <Autocomplete
                disablePortal
                options={timezoneData || []}
                fullWidth
                value={selectedTimeZone}
                onChange={(event, newValue) => {
                  handleAutoComplete(newValue, "timezone");
                }}
                getOptionLabel={(option: any) => option.name || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option.id === value.id
                }
                renderInput={(params) => (
                  <MuiInputField {...params} size="medium" />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <MuiText
                variant="h6"
                my={1}
                mb={"2px"}
                className="admin-label-title"
              >
                Financial Year
              </MuiText>
              <Autocomplete
                disablePortal
                options={financeYearData || []}
                fullWidth
                value={selectedFinancial}
                onChange={(event, newValue) => {
                  handleAutoComplete(newValue, "financial");
                }}
                getOptionLabel={(option: any) => option.startYear || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option.id === value.id
                }
                renderInput={(params) => (
                  <MuiInputField {...params} size="medium" />
                )}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }} my={"12px"}>
              <Box>
                <MuiSwitch
                  label="Two Factor Authentication"
                  // onChange={handleSwitch}
                  // checked={inputs.twoFactorAuth === 1}
                />
              </Box>
              <Box>
                <MuiSwitch
                  label="Captcha on Login"
                  // onChange={handleSwitch}
                  // checked={inputs.captchaOnLogin === 1}
                />
              </Box>
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
            pb={0.8}
          >
            <Box display={"flex"} gap={2}>
              <MuiButton className="filled-icon-btn" type="submit">
                Save
              </MuiButton>
            </Box>
          </Box>
        </form>
      </Box>
    </div>
  );
}

export default CompanySettingsPage;
