import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#C47B4D', 
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#EED3BB', 
      },
      background: {
        default: '#FAF7F4', 
        paper: '#ffffff',   
      },
      text: {
        primary: '#2E2E2E',
      },
    },
    shape: {
      borderRadius: 20, 
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 25,
            paddingInline: '24px',
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: 25,
          },
        },
      },
    },
  });