"use client";

import { useEffect, useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
  Paper,
  Chip,
  Tooltip,
  IconButton,
  Fade,
  alpha,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import MainConfig from "../../../../utils/main.api.json";
import Config from "../../../../utils/config.api.json";
import { CgClose, CgToday } from "react-icons/cg";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { FaEvernote } from "react-icons/fa6";
import Link from "next/link";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { MuiButton } from "bsoft-base-elements";
import { BiSearch } from "react-icons/bi";
import { GrClear } from "react-icons/gr";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
  StyledAutocomplete,
} from "../../../../utils/lib";
import toast from "react-hot-toast";

const CalendarContainer = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  background: "linear-gradient(to right bottom, #ffffff, #fafafa)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-4px)",
  },
}));

const EventBadge = styled(Box)(({ theme }) => ({
  width: "28px",
  height: "28px",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.85rem",
  fontWeight: 700,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: "all 0.2s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "scale(1.15) translateY(-2px)",
    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

const CalendarHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ViewToggleButton = styled(Button)<{ active?: number }>(
  ({ theme, active }) => ({
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(0.75, 2),
    minWidth: 0,
    backgroundColor: active
      ? alpha(theme.palette.primary.main, 0.1)
      : "transparent",
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: active
        ? alpha(theme.palette.primary.main, 0.2)
        : alpha(theme.palette.action.hover, 0.1),
    },
  })
);

const EventDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius * 2,
    overflow: "hidden",
  },
}));

interface ScheduleItem {
  machineName: string;
  machineCode?: string;
  preventiveSchedulerName?: string;
  groupName: string;
  headerId: string;
  detailId: string;
  workOrderId?: string;
}

interface ScheduleListProps {
  scheduleList: ScheduleItem[];
  handleReschedule: (detailId: string) => void;
  theme: any;
}

const filterScheduleItems = (
  items: ScheduleItem[],
  searchTerm: string
): ScheduleItem[] => {
  if (!searchTerm.trim()) {
    return items;
  }

  const lowercaseSearch = searchTerm.toLowerCase().trim();

  return items.filter((item) => {
    const machineNameMatch = item.machineName
      ?.toLowerCase()
      .includes(lowercaseSearch);

    const machineCodeMatch = item.machineCode
      ?.toLowerCase()
      .includes(lowercaseSearch);

    return machineNameMatch || machineCodeMatch;
  });
};

export default function MySchedulePage({
  hideBreadCrumbs,
}: {
  hideBreadCrumbs: boolean;
}) {
  const theme = useTheme();
  const [events, setEvents] = useState<any>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState<Dayjs | null>(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [scheduleId, setScheduleId] = useState("");
  const [calendarApi, setCalendarApi] = useState<any>(null);
  const [scheduleList, setScheduleList] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredScheduleList = useMemo(
    () => filterScheduleItems(scheduleList, searchTerm),
    [scheduleList, searchTerm]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const { data: myScheduleData } = useDataFetchHook(
    MainConfig.WorkOrder.Schedule.MySchedule.endpoint.replace(
      "{id}",
      selectedDepartment ? selectedDepartment?.id : ""
    ),
    MainConfig.WorkOrder.Schedule.MySchedule.method,
    "main",
    refreshKey
  );

  const { data: departmentData } = useDataFetchHook(
    Config.Department.departmentGroupName.endpoint.replace(
      "{name}",
      "maintenance"
    ),
    Config.Department.departmentGroupName.method
  );

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const eventYears = useMemo(() => {
    if (!events || events.length === 0) return [];
    return [
      ...new Set(
        events.map((event: any) => new Date(event.start).getFullYear())
      ),
    ].sort((a: any, b: any) => b - a);
  }, [events]);

  useEffect(() => {
    if (myScheduleData) {
      if (Array.isArray(myScheduleData) && myScheduleData.length > 0) {
        const mappedEvents: any = myScheduleData.map((list, index) => ({
          id: String(index + 1),
          title: String(list?.totalScheduleCount || ""),
          start: String(list?.scheduleDate || ""),
          className: "active-event",
          end: new Date(
            new Date(list?.scheduleDate).getTime() +
              Math.floor(Math.random() * 3) * 3600000
          ).toISOString(),
          category: ["event"],
          departmentId: list?.departmentId,
        }));

        setEvents(mappedEvents);
      }
    }
  }, [myScheduleData]);

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay,
      category: clickInfo.event.extendedProps.category || "events",
    });
    const selectedDate = clickInfo.event.startStr
      ? clickInfo.event.startStr.split("T").at("0")
      : "";
    const deptId = clickInfo.event.extendedProps.departmentId ?? "";
    GetScheduleByDate(selectedDate, deptId);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prev: any) =>
        prev.filter((e: any) => e.id !== selectedEvent.id)
      );
      setSelectedEvent(null);
    }
  };

  const handleViewChange = (view: any) => {
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  };

  const handleToday = () => {
    if (calendarApi) {
      calendarApi.today();
    }
    setSelectedYear(currentYear);
  };

  const handlePrev = () => {
    if (calendarApi) {
      calendarApi.prev();
    }
  };

  const handleNext = () => {
    if (calendarApi) {
      calendarApi.next();
    }
  };

  const [calendarTitle, setCalendarTitle] = useState("");

  const handleDatesSet = (dateInfo: any) => {
    setCalendarTitle(dateInfo.view.title);
    const viewYear = new Date(dateInfo.start).getFullYear();
    // if (viewYear !== selectedYear) {
    //   setSelectedYear(viewYear);
    // }
  };

  const handleYearChange = (event: any) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    if (calendarApi) {
      calendarApi.gotoDate(new Date(year, 0, 1));
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const category = eventInfo.event.extendedProps.category || "event";
    const categoryColors: any = {
      meeting: theme.palette.primary.main,
      task: theme.palette.success.main,
      appointment: theme.palette.secondary.main,
    };
    const color = categoryColors[category] || theme.palette.primary.main;
    if (eventInfo.view.type === "dayGridMonth") {
      return (
        <Tooltip
          title={`${eventInfo.event.title} ${category}`}
          arrow
          placement="top"
        >
          <EventBadge sx={{ bgcolor: color }}>
            {eventInfo.event.title}
          </EventBadge>
        </Tooltip>
      );
    }
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
          height: "100%",
          borderLeft: `3px solid ${color}`,
          pl: 1,
          borderRadius: "2px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        <Chip
          label={category}
          size="small"
          sx={{
            bgcolor: alpha(color, 0.1),
            color: color,
            fontSize: "0.65rem",
            height: 20,
          }}
        />
        <Typography variant="body2" noWrap fontWeight={500}>
          {eventInfo.event.title}
        </Typography>
      </Box>
    );
  };

  const GetScheduleByDate = async (date: string, deptId: number | string) => {
    try {
      const body = {
        schedulerDate: date,
        departmentId: deptId,
      };
      const { endpoint, method } =
        MainConfig.WorkOrder.Schedule.ScheduleDetails;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        setScheduleList(response.data);
      } else {
        setScheduleList([]);
        toast.error(
          response.message
            ? response.message
            : "Something went wrong, please try again"
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const customToolbar = {
    start: "",
    center: "",
    end: "",
  };

  const calendarStyles = useMemo(
    () => ({
      ".fc": {
        fontFamily: "var(--poppins-font)",
        "--fc-border-color": "#cbcbcba1",
        "--fc-today-bg-color": alpha(theme.palette.primary.light, 0.1),
      },
      ".fc-header-toolbar": {
        display: "none",
      },
      ".fc-scrollgrid": {
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
        border: "none",
      },
      ".fc-day": {
        transition: "background-color 0.2s ease",
      },
      ".fc-col-header-cell": {
        backgroundColor: theme.palette.background.paper,
        padding: "12px 0",
        fontWeight: 600,
      },
      ".fc-day-today": {
        backgroundColor: `${alpha(
          theme.palette.primary.light,
          0.1
        )} !important`,
        borderRadius: "8px",
      },
      ".fc-day:hover": {
        backgroundColor: "#3a8484a1",
      },
      ".fc-daygrid-day-frame": {
        padding: "6px 4px",
      },
      ".fc-daygrid-day-top": {
        justifyContent: "center",
        fontWeight: 500,
        paddingTop: "2px",
        fontSize: "0.85rem",
      },
      ".fc-day-other .fc-daygrid-day-top": {
        opacity: 0.4,
      },
      ".fc-daygrid-day-events": {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "4px",
      },
      ".fc-daygrid-day:has(.active-event)": {
        backgroundColor: alpha(theme.palette.primary.light, 0.07),
        borderRadius: "8px",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "8px",
          boxShadow: `inset 0 0 0 2px ${alpha(
            theme.palette.primary.main,
            0.3
          )}`,
          pointerEvents: "none",
        },
      },
      ".fc-timegrid-slot": {
        height: "40px !important",
      },
      ".fc-timegrid-slot-lane": {
        backgroundColor: theme.palette.background.paper,
      },
      ".fc-timegrid-event": {
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      },
      ".fc-list-day-cushion": {
        backgroundColor: alpha(theme.palette.primary.light, 0.1),
      },
      ".fc-list-event:hover td": {
        backgroundColor: alpha(theme.palette.action.hover, 0.7),
      },
    }),
    [theme]
  );

  const handleReschedule = (id: string) => {
    setSelectedCalendar(true);
    setScheduleId(id);
  };

  const handleScheduleSave = async () => {
    if (isSubmitting()) return;

    if (!scheduleDate) {
      console.error("Please select a schedule date.");
      return;
    }

    startLoading();

    try {
      const body = {
        preventiveScheduleDetailId: Number(scheduleId),
        rescheduleDate: dayjs(scheduleDate).format("YYYY-MM-DD"),
      };

      const { endpoint, method } = MainConfig.WorkOrder.Schedule.Reschedule;

      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message);
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Schedule save error:", error);
    } finally {
      stopLoading();
      setScheduleId("");
      setScheduleDate(null);
      setSelectedCalendar(null);
      setSelectedEvent(null);
    }
  };

  useEffect(() => {
    if (departmentData && departmentData.length > 0) {
      const sortedTypes: any =
        Array.isArray(departmentData) &&
        departmentData.sort((a, b) =>
          String(b.code ?? "").localeCompare(String(a.code ?? ""))
        );
      setSelectedDepartment(sortedTypes[0] || null);
      setRefreshKey((prev) => prev + 1);
    }
  }, [departmentData]);

  return (
    <Box
      sx={{
        margin: "12px 0",
      }}
    >
      <Box
        display={"flex"}
        justifyContent={hideBreadCrumbs ? "end" : "space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
      >
        <Box display={hideBreadCrumbs ? "none" : "block"}>
          <IconBreadcrumbs parent="Schedule" child="My Schedule" path="" />
        </Box>

        <Box
          mb={2}
          display={"flex"}
          justifyContent={"end"}
          alignItems={"center"}
        >
          <StyledAutocomplete
            options={departmentData || []}
            sx={{ width: 300, background: "#fff", borderRadius: "12px" }}
            value={selectedDepartment}
            onChange={(event, value) => {
              setSelectedDepartment(value);
              setRefreshKey((prev) => prev + 1);
            }}
            getOptionLabel={(option: any) => option.deptName || ""}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Select Department"
              />
            )}
          />
        </Box>
      </Box>

      <CalendarContainer elevation={0}>
        <CalendarHeader>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5" fontWeight={600} color="primary">
              {calendarTitle}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<CgToday />}
              onClick={handleToday}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
              }}
            >
              Today
            </Button>

            <Box display="flex" ml={2}>
              <IconButton onClick={handlePrev} size="small">
                <BsArrowLeft />
              </IconButton>
              <IconButton onClick={handleNext} size="small">
                <BsArrowRight />
              </IconButton>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

            <Box display="flex" bgcolor={"#fff0"} borderRadius={3}>
              <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                <Select value={selectedYear} onChange={handleYearChange}>
                  {yearOptions.map((year: number) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <ViewToggleButton
                active={currentView === "dayGridMonth" ? 1 : 0}
                onClick={() => handleViewChange("dayGridMonth")}
              >
                Month
              </ViewToggleButton>
              <ViewToggleButton
                active={currentView === "timeGridWeek" ? 1 : 0}
                onClick={() => handleViewChange("timeGridWeek")}
              >
                Week
              </ViewToggleButton>
            </Box>
          </Box>
        </CalendarHeader>

        <Box sx={{ p: 2, ...calendarStyles }}>
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialView="dayGridMonth"
            selectable={true}
            events={events}
            eventClick={handleEventClick}
            headerToolbar={customToolbar}
            height="auto"
            datesSet={handleDatesSet}
            eventContent={renderEventContent}
            ref={(ref) => {
              if (ref) setCalendarApi(ref.getApi());
            }}
            dayMaxEvents={3}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
          />
        </Box>
      </CalendarContainer>

      {selectedEvent && (
        <EventDialog
          open={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          fullWidth
          maxWidth="sm"
          TransitionComponent={Fade}
          transitionDuration={400}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight={600}>
                Schedule Details
              </Typography>
              <IconButton onClick={() => setSelectedEvent(null)} size="small">
                <CgClose />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Card
              elevation={0}
              sx={{
                mb: 3,
                bgcolor: alpha(theme.palette.primary.light, 0.08),
                borderRadius: 3,
              }}
            >
              <CardContent>
                {/* Search Box */}
                <Box mb={3}>
                  <TextField
                    fullWidth
                    placeholder="Search by machine name or code..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BiSearch
                            style={{ color: theme.palette.text.secondary }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            onClick={handleClearSearch}
                            sx={{
                              minWidth: "auto",
                              p: 0.5,
                              color: theme.palette.text.secondary,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                              },
                            }}
                          >
                            <GrClear fontSize="small" />
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        "&:hover": {
                          bgcolor: theme.palette.background.paper,
                        },
                        "&.Mui-focused": {
                          bgcolor: theme.palette.background.paper,
                          boxShadow: `0 0 0 2px ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        },
                      },
                    }}
                  />

                  {/* Search Results Count */}
                  {searchTerm && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, fontStyle: "italic" }}
                    >
                      {filteredScheduleList.length} result
                      {filteredScheduleList.length !== 1 ? "s" : ""} found
                      {filteredScheduleList.length === 0 &&
                        " - try a different search term"}
                    </Typography>
                  )}
                </Box>

                {/* Schedule List */}
                <List disablePadding>
                  {filteredScheduleList.length === 0 && !searchTerm ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      py={4}
                      sx={{
                        bgcolor: alpha(theme.palette.grey[100], 0.5),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(
                          theme.palette.grey[400],
                          0.5
                        )}`,
                      }}
                    >
                      <Typography color="text.secondary" variant="body1">
                        No schedules available
                      </Typography>
                    </Box>
                  ) : filteredScheduleList.length === 0 && searchTerm ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      py={4}
                      sx={{
                        bgcolor: alpha(theme.palette.grey[100], 0.5),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(
                          theme.palette.grey[400],
                          0.5
                        )}`,
                      }}
                    >
                      <BiSearch
                        style={{
                          fontSize: 48,
                          color: theme.palette.text.disabled,
                        }}
                      />
                      <Typography color="text.secondary" variant="body1" mt={1}>
                        No schedules match your search
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Try searching with different keywords
                      </Typography>
                    </Box>
                  ) : (
                    filteredScheduleList.map((item: ScheduleItem, index) => (
                      <ListItem
                        key={`${item.headerId}-${index}`}
                        sx={{
                          bgcolor: theme.palette.background.default,
                          mb: 2,
                          borderRadius: 3,
                          px: 3,
                          py: 2.5,
                          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                          alignItems: "flex-start",
                          position: "relative",
                          overflow: "visible",
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1
                          )}`,
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                            backgroundColor: alpha(
                              theme.palette.primary.light,
                              0.02
                            ),
                            transform: "translateY(-2px)",
                            transition: "all 0.2s ease-in-out",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.secondary.main,
                              fontWeight: 700,
                              fontSize: 18,
                              width: 48,
                              height: 48,
                              boxShadow: "0 4px 12px rgba(58,132,132,0.15)",
                            }}
                          >
                            {item.machineName.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>

                        <Box flex={1} ml={1}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box flex={1}>
                              <Typography
                                fontWeight={700}
                                fontSize={18}
                                color="text.primary"
                                mb={0.5}
                              >
                                {item.machineName}
                              </Typography>

                              <Box
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                mb={1}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={500}
                                  sx={{ minWidth: "fit-content" }}
                                >
                                  Code:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: "poppins",
                                    bgcolor: alpha(
                                      theme.palette.grey[500],
                                      0.1
                                    ),
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  {item.machineCode || "N/A"}
                                </Typography>
                              </Box>

                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                                mb={1}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    bgcolor: "#e8f5e8",
                                    color: "#2e7d32",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                    fontFamily: "poppins",
                                  }}
                                >
                                  <FaEvernote size={14} />
                                  {item.preventiveSchedulerName ||
                                    "Not Assigned"}
                                </Box>
                              </Box>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  fontWeight: 500,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    bgcolor: theme.palette.info.main,
                                    borderRadius: "50%",
                                  }}
                                />
                                Group: {item.groupName}
                              </Typography>
                            </Box>

                            <Box
                              display="flex"
                              flexDirection="column"
                              gap={1}
                              ml={2}
                            >
                              <Link
                                href={`/maintanence/my-schedule/${item?.headerId}`}
                              >
                                <Button
                                  size="small"
                                  variant="outlined"
                                  fullWidth
                                  sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1
                                      ),
                                      borderColor: theme.palette.primary.main,
                                    },
                                    textTransform: "capitalize",
                                    fontWeight: 500,
                                  }}
                                >
                                  View
                                </Button>
                              </Link>

                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                sx={{
                                  borderColor: "#f57c00",
                                  color: "#f57c00",
                                  "&:hover": {
                                    bgcolor: alpha("#f57c00", 0.1),
                                    borderColor: "#f57c00",
                                  },
                                  textTransform: "capitalize",
                                  fontWeight: 500,
                                }}
                                onClick={() => handleReschedule(item?.detailId)}
                              >
                                Reschedule
                              </Button>

                              {Boolean(item?.workOrderId) && (
                                <Link
                                  href={`/maintanence/work-order-detail/${item?.workOrderId}`}
                                  target="_blank"
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                      borderColor: "#d32f2f",
                                      color: "#d32f2f",
                                      "&:hover": {
                                        bgcolor: alpha("#d32f2f", 0.1),
                                        borderColor: "#d32f2f",
                                      },
                                      textTransform: "capitalize",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Work Order
                                  </Button>
                                </Link>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </DialogContent>
        </EventDialog>
      )}
      <EventDialog
        open={Boolean(selectedCalendar)}
        onClose={() => {
          setSelectedCalendar(null);
          setScheduleId("");
          setScheduleDate(null);
        }}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Fade}
        transitionDuration={200}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600}>
              Reschedule Date
            </Typography>
            <IconButton
              onClick={() => {
                setSelectedCalendar(null);
                setScheduleId("");
                setScheduleDate(null);
              }}
              size="small"
            >
              <CgClose />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "",
                },
              }}
              minDate={dayjs(new Date())}
              value={scheduleDate ? dayjs(scheduleDate) : null}
              onChange={(value) => setScheduleDate(value)}
            />
          </LocalizationProvider>
          <Box mt={1} textAlign={"center"}>
            <MuiButton
              variant="contained"
              onClick={() => {
                handleScheduleSave();
              }}
              disabled={!scheduleDate || isSubmitting()}
            >
              Save
            </MuiButton>
          </Box>
        </DialogContent>
      </EventDialog>
    </Box>
  );
}
