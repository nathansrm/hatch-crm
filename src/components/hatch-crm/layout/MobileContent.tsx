import { type ReactNode } from "react";

export const MobileContent = ({ children }: { children: ReactNode }) => (
  <main
    className="mx-auto min-h-dvh max-w-screen-xl overflow-y-auto bg-[#0A0F1E] px-3 pt-20 pb-[calc(7.75rem_+_env(safe-area-inset-bottom))] scroll-pb-[calc(7.75rem_+_env(safe-area-inset-bottom))]"
    id="main-content"
  >
    {children}
  </main>
);
