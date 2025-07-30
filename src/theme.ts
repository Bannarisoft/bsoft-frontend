import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") => {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#3a8484",
        contrastText: "#fff",
      },
      secondary: {
        main: "#3ab4c5",
        contrastText: "#ffffff",
      },
      error: {
        main: "#dd5061",
      },
      warning: {
        main: "#ff9800",
      },
      info: {
        main: "#2196f3",
      },
      success: {
        main: "#3a8484",
      },
      background: {
        default: mode === "dark" ? "#152332" : "#ffffff",
      },
    },
    typography: {
      fontFamily: `"Inter", sans-serif`,
      fontSize: 14,
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 500 },
      h4: { fontWeight: 500 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
    },
    transitions: {
      duration: {
        standard: 300,
      },
      easing: {
        easeInOut: "cubic-bezier(.17,.67,.83,.67)",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ".ag-root-wrapper ::-webkit-scrollbar": {
            height: "14px !important",
          },
          ".ag-root-wrapper ::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "7px",
          },
          ".ag-root-wrapper": {
            scrollbarWidth: "auto",
            scrollbarColor: "rgba(0, 0, 0, 0.3) #f0f0f0",
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
};

const defaultTheme = getTheme("light");
export default defaultTheme;
