import { type CSSProperties, type ReactNode } from "react";

export const MobileContent = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <main
    className="max-w-screen-xl mx-auto pt-18 px-4 pb-20 min-h-screen overflow-y-auto"
    id="main-content"
    style={style}
  >
    {children}
  </main>
);
