/**
 * NativeInput.js
 *
 * A styled TextInput component using React Native's native TextInput
 * to completely bypass NativeBase's Input which has an Android bug
 * with outlineWidth causing "String cannot be cast to Double" crashes.
 */
import React, { forwardRef, useState } from "react";
import { TextInput, StyleSheet, View, Platform } from "react-native";
import { Icon, HStack, Pressable } from "native-base";

const COLORS = {
  primary: "#0d7059",
  gray100: "#f5f5f5",
  gray200: "#eeeeee",
  gray300: "#e0e0e0",
  gray400: "#bdbdbd",
  gray500: "#9e9e9e",
  gray800: "#424242",
  white: "#ffffff",
  border: "#d4d4d4",
  focusBorder: "#0d7059",
};

export const Input = forwardRef(
  (
    {
      placeholder,
      value,
      onChangeText,
      onSubmitEditing,
      keyboardType,
      autoCapitalize,
      secureTextEntry,
      type,
      size = "md",
      isDisabled,
      returnKeyType,
      InputLeftElement,
      InputRightElement,
      borderRadius,
      borderWidth,
      bg,
      py,
      px,
      fontSize,
      mr,
      ml,
      flex,
      style,
      variant = "outline",
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return { height: 36, fontSize: 14 };
        case "lg":
          return { height: 48, fontSize: 16 };
        case "xl":
          return { height: 56, fontSize: 18 };
        default:
          return { height: 42, fontSize: 15 };
      }
    };

    const getVariantStyles = () => {
      switch (variant) {
        case "filled":
          return {
            backgroundColor: bg || COLORS.gray100,
            borderWidth: 0,
          };
        case "unstyled":
          return {
            backgroundColor: "transparent",
            borderWidth: 0,
          };
        case "underlined":
          return {
            backgroundColor: "transparent",
            borderWidth: 0,
            borderBottomWidth: 1,
            borderRadius: 0,
          };
        default: // outline
          return {
            backgroundColor: bg || COLORS.white,
            borderWidth: 1,
          };
      }
    };

    const sizeStyles = getSizeStyles();
    const variantStyles = getVariantStyles();

    const containerStyle = [
      styles.container,
      variantStyles,
      {
        borderColor: isFocused ? COLORS.focusBorder : COLORS.border,
        borderRadius: borderRadius === "full" ? 25 : borderRadius || 8,
        opacity: isDisabled ? 0.5 : 1,
        minHeight: sizeStyles.height,
      },
      flex && { flex },
      mr && { marginRight: typeof mr === "number" ? mr * 4 : 8 },
      ml && { marginLeft: typeof ml === "number" ? ml * 4 : 8 },
    ];

    const inputStyle = [
      styles.input,
      {
        height: sizeStyles.height,
        fontSize: fontSize === "sm" ? 14 : sizeStyles.fontSize,
        paddingVertical: py ? py * 4 : 8,
        paddingHorizontal: px ? px * 4 : 12,
      },
      InputLeftElement && { paddingLeft: 4 },
      InputRightElement && { paddingRight: 4 },
      style,
    ];

    return (
      <View style={containerStyle}>
        <HStack alignItems="center" flex={1}>
          {InputLeftElement}
          <TextInput
            ref={ref}
            style={inputStyle}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray500}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry || type === "password"}
            editable={!isDisabled}
            returnKeyType={returnKeyType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...rest}
          />
          {InputRightElement}
        </HStack>
      </View>
    );
  }
);

export const TextArea = forwardRef(
  (
    {
      placeholder,
      value,
      onChangeText,
      isDisabled,
      numberOfLines = 4,
      style,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View
        style={[
          styles.container,
          styles.textArea,
          {
            borderColor: isFocused ? COLORS.focusBorder : COLORS.border,
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, styles.textAreaInput, style]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray500}
          value={value}
          onChangeText={onChangeText}
          editable={!isDisabled}
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    color: COLORS.gray800,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // Explicitly remove outline styles for Android
    ...Platform.select({
      android: {
        textAlignVertical: "center",
      },
    }),
  },
  textArea: {
    minHeight: 100,
  },
  textAreaInput: {
    height: "100%",
    textAlignVertical: "top",
    paddingTop: 12,
  },
});

Input.displayName = "NativeInput";
TextArea.displayName = "NativeTextArea";
