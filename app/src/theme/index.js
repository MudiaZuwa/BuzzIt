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
    // Light mode backgrounds
    background: {
      light: "#f0f0f0",
      dark: "#121212",
    },
    // Dark mode specific colors
    dark: {
      50: "#e8e8e8",
      100: "#d1d1d1",
      200: "#b0b0b0",
      300: "#888888",
      400: "#6d6d6d",
      500: "#5d5d5d",
      600: "#4f4f4f",
      700: "#3d3d3d",
      800: "#2d2d2d",
      900: "#1a1a1a",
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
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
      baseStyle: ({ colorMode }) => ({
        rounded: "md",
        bg: colorMode === "dark" ? "dark.800" : "gray.100",
        borderColor: colorMode === "dark" ? "dark.600" : "gray.300",
        color: colorMode === "dark" ? "white" : "black",
        _focus: {
          borderColor: "primary.500",
          bg: colorMode === "dark" ? "dark.700" : "white",
        },
        _android: {
          _focus: {
            outlineWidth: undefined,
            outlineStyle: undefined,
          },
        },
        placeholderTextColor: colorMode === "dark" ? "dark.300" : "gray.400",
      }),
      defaultProps: {
        variant: "filled",
      },
    },
    Card: {
      baseStyle: ({ colorMode }) => ({
        rounded: "md",
        shadow: 2,
        bg: colorMode === "dark" ? "dark.800" : "white",
      }),
    },
    TextArea: {
      baseStyle: ({ colorMode }) => ({
        rounded: "md",
        bg: colorMode === "dark" ? "dark.800" : "gray.100",
        borderColor: colorMode === "dark" ? "dark.600" : "gray.300",
        color: colorMode === "dark" ? "white" : "black",
        _focus: {
          borderColor: "primary.500",
          bg: colorMode === "dark" ? "dark.700" : "white",
        },
        _android: {
          _focus: {
            outlineWidth: undefined,
            outlineStyle: undefined,
          },
        },
      }),
    },
    Box: {
      baseStyle: ({ colorMode }) => ({
        _dark: {
          bg: "dark.900",
        },
      }),
    },
    Text: {
      baseStyle: ({ colorMode }) => ({
        color: colorMode === "dark" ? "white" : "gray.800",
      }),
    },
    Heading: {
      baseStyle: ({ colorMode }) => ({
        color: colorMode === "dark" ? "white" : "gray.800",
      }),
    },
    Modal: {
      baseStyle: ({ colorMode }) => ({
        _backdrop: {
          bg: colorMode === "dark" ? "black" : "gray.600",
        },
      }),
    },
    Skeleton: {
      baseStyle: ({ colorMode }) => ({
        startColor: colorMode === "dark" ? "dark.700" : "gray.200",
        endColor: colorMode === "dark" ? "dark.600" : "gray.300",
      }),
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
