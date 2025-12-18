import { extendTheme } from "native-base";

const theme = extendTheme({
  colors: {
    primary: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#0d7059", // Primary color from web app
      600: "#0a5a47",
      700: "#074436",
      800: "#052e24",
      900: "#021812",
    },
    secondary: {
      50: "#fce4ec",
      100: "#f8bbd0",
      200: "#f48fb1",
      300: "#f06292",
      400: "#ec407a",
      500: "#6c757d", // Secondary color
      600: "#5a6268",
      700: "#495057",
      800: "#343a40",
      900: "#212529",
    },
    success: {
      500: "#128c7e", // Success color from chat
    },
    background: {
      light: "#f0f0f0",
      dark: "#ffffff",
    },
  },
  config: {
    initialColorMode: "light",
  },
  components: {
    Button: {
      baseStyle: {
        rounded: "md",
      },
      defaultProps: {
        colorScheme: "primary",
      },
    },
    Input: {
      baseStyle: {
        rounded: "md",
        _focus: {
          borderColor: "primary.500",
        },
        // Fix for Android crash: "String cannot be cast to Double" on outlineWidth
        _android: {
          _focus: {
            outlineWidth: undefined,
            outlineStyle: undefined,
          },
        },
      },
      defaultProps: {
        variant: "filled",
        _focus: {
          borderColor: "primary.500",
          bg: "white",
        },
      },
    },
    Card: {
      baseStyle: {
        rounded: "md",
        shadow: 2,
      },
    },
    TextArea: {
      baseStyle: {
        rounded: "md",
        _focus: {
          borderColor: "primary.500",
        },
        _android: {
          _focus: {
            outlineWidth: undefined,
            outlineStyle: undefined,
          },
        },
      },
    },
  },
  fontConfig: {
    Inter: {
      400: {
        normal: "Inter-Regular",
      },
      500: {
        normal: "Inter-Medium",
      },
      600: {
        normal: "Inter-SemiBold",
      },
      700: {
        normal: "Inter-Bold",
      },
    },
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
    mono: "Inter",
  },
});

export default theme;
