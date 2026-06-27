import { type ReactNode } from "react";

export function AppShell({ children, dir }: { children: ReactNode; dir?: "ltr" | "rtl" }) {
  return (
    <div dir={dir} className="app-shell flex flex-col">
      {children}
    </div>
  );
}
