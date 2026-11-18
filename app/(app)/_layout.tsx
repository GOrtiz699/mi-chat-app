import { Stack } from "expo-router";
import { colors } from "@shared/presentation/theme/tokens";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background.deep },
      }}
    />
  );
}
