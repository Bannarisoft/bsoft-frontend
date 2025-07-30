"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  DialogContent,
  Grid,
  Button,
  useTheme,
  Grid2,
  Skeleton,
} from "@mui/material";
import { Apirequest, stringAvatar, tokenDecode } from "../../../utils/lib";
import { MuiText } from "bsoft-base-elements";
import Config from "../../../../src/utils/config.api.json";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Profile } from "../../../types";

const ProfileCard: React.FC<{
  profile: Profile;
  onSelect: (profile: Profile) => void;
}> = ({ profile, onSelect }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 2,
        width: 200,
        height: 250,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        margin: "auto",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-4px)",
          borderRadius: "18px",
          border: "2px solid #222",
        },
      }}
      onClick={() => onSelect(profile)}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          "& .MuiAvatar-root": {
            width: 80,
            height: 80,
          },
        }}
      >
        <Avatar
          {...stringAvatar(
            profile.unitName ? profile.unitName : profile.unitName.toUpperCase()
          )}
        />
        <MuiText
          variant="subtitle1"
          align="center"
          sx={{
            fontWeight: 500,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
            textTransform: "uppercase",
            my: 1,
          }}
        >
          {profile.unitName} - {profile.divisionShortName}
        </MuiText>
        <MuiText
          variant="caption"
          align="center"
          color="text.secondary"
          sx={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {profile.companyName}
        </MuiText>
      </Box>
    </Card>
  );
};

const ChooseUnit: React.FC = () => {
  const [unitData, setUnitData] = useState<Profile[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState("");
  const router = useRouter();
  const theme = useTheme();

  const token = Cookies.get("bsoft");
  const GetModule = Cookies.get("_ids") ?? null;

  const FetchUserData = () => {
    const decoded = tokenDecode(token || "") ?? {};
    const groupCode = decoded?.GroupCode;
    setGroup(groupCode);
  };

  const handleProfileSelect = (profile: Profile) => {
    SetUnit(profile);
  };

  const GetUnit = async () => {
    try {
      const { endpoint, method } = Config.SwitchProfile.getUnit;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setLoading(false);
      setUnitData(result.data);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const SetUnit = async (profile: Profile) => {
    try {
      const body = {
        unitId: profile?.unitId,
        companyId: profile?.companyId,
        divisionId: profile?.divisionId,
        oldUnitId: profile?.oldUnitId,
      };
      const { endpoint, method } = Config.SwitchProfile.postUnit;
      const result = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );
      if (result) {
        Cookies.set("bsoft", result?.data?.token, {
          expires: 1,
        });
        if (GetModule) {
          router.push("/maintanence/dashboard");
        } else {
          router.push("/choose-module");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSkip = () => {
    router.push("/choose-module");
  };

  useEffect(() => {
    GetUnit();
    setLoading(true);
    FetchUserData();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        backgroundImage: `url("https://img.freepik.com/free-vector/flat-illustration-wavy-white-background_52683-74295.jpg?t=st=1741937276~exp=1741940876~hmac=741d14f42b7cefd3d486b670fb1362b25521e197c30e20b19e8a168cd0714321&w=996")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <MuiText
          variant="h6"
          className="login-header"
          sx={{ textShadow: "1px 1px 1px #3a8484" }}
        >
          SELECT UNIT
        </MuiText>
        <DialogContent>
          {loading ? (
            <Box display={"flex"} gap={2}>
              {[0, 1, 2].map((li) => (
                <Skeleton
                  variant="rectangular"
                  key={li}
                  sx={{ width: 200, height: 250, borderRadius: "14px" }}
                />
              ))}
            </Box>
          ) : (
            <Grid2 container spacing={2} justifyContent="center" my={3}>
              {Array.isArray(unitData) &&
                unitData.map((profile) => (
                  <Grid item key={profile.unitId}>
                    <ProfileCard
                      profile={profile}
                      onSelect={handleProfileSelect}
                    />
                  </Grid>
                ))}
              {group === "SUPER_ADMIN" && (
                <Card
                  onClick={handleSkip}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  sx={{
                    p: 2,
                    width: 200,
                    height: 250,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    background: isHovering
                      ? "linear-gradient(135deg, #1976d2, #64b5f6)"
                      : "linear-gradient(135deg, #ffffff, #f5f5f5)",
                    boxShadow: isHovering
                      ? "0 10px 20px rgba(25, 118, 210, 0.5)"
                      : theme.shadows[2],
                    transform: isHovering
                      ? "translateY(-8px)"
                      : "translateY(0)",
                    borderRadius: "18px",
                    border: isHovering
                      ? "2px solid #64b5f6"
                      : "2px dashed #1976d2",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: isHovering ? "200%" : "0%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                      top: 0,
                      left: "-50%",
                      transform: "skewX(-20deg)",
                      transition: "all 0.6s ease",
                    },
                    "&:hover::after": {
                      width: "200%",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: isHovering ? "#fff" : "#1976d2",
                        color: isHovering ? "#1976d2" : "#fff",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        mb: 2,
                        transition: "all 0.3s ease",
                        transform: isHovering ? "rotate(360deg)" : "rotate(0)",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                        }}
                      >
                        →
                      </Box>
                    </Avatar>
                    <MuiText
                      variant="subtitle1"
                      align="center"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        my: 1,
                        color: isHovering ? "#fff" : "#1976d2",
                        letterSpacing: "1px",
                      }}
                    >
                      Skip Selection
                    </MuiText>
                    <MuiText
                      variant="caption"
                      align="center"
                      sx={{
                        color: isHovering
                          ? "rgba(255,255,255,0.9)"
                          : "text.secondary",
                        mt: 1,
                        fontWeight: 500,
                      }}
                    >
                      Continue to Dashboard
                    </MuiText>
                  </Box>
                </Card>
              )}
            </Grid2>
          )}
        </DialogContent>
      </Box>
    </Box>
  );
};

export default ChooseUnit;
