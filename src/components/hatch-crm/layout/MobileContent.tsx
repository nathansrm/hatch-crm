import { type ReactNode } from "react";

export const MobileContent = ({ children }: { children: ReactNode }) => (
  <main
    className="max-w-screen-xl mx-auto pt-18 px-4 pb-[calc(7rem_+_env(safe-area-inset-bottom))] min-h-dvh overflow-y-auto scroll-pb-[calc(7rem_+_env(safe-area-inset-bottom))]"
    id="main-content"
  >
    {children}
  </main>
);
