import "react-native-url-polyfill/auto";
import { registerRootComponent } from "expo";
import { BackHandler } from "react-native";
import App from "./App";

// Polyfill for deprecated BackHandler.removeEventListener (required for NativeBase on RN 0.73+)
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = (eventName, handler) => {
    // The new API returns a subscription from addEventListener
    // This polyfill is a no-op since the old API is deprecated
    // Libraries should use the subscription.remove() pattern instead
  };
}

registerRootComponent(App);
