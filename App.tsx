import { StatusBar } from "expo-status-bar";
import React from "react";
import { SessionScreen } from "./src/screens/SessionScreen";

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <SessionScreen />
    </>
  );
}
