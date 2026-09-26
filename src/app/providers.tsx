"use client";

import { Provider } from "react-redux";
import { useMeQuery } from "@/store/api/auth-api";
import { store } from "@/store";
import { GlobalImpressionPrompt } from "@/components/layout/global-impression-prompt";
import { GlobalToast } from "@/components/layout/global-toast";

function AuthBootstrap() {
  useMeQuery();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      {children}
      <GlobalToast />
      <GlobalImpressionPrompt />
    </Provider>
  );
}
