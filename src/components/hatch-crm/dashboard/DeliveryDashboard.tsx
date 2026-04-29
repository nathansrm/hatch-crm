import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";
import { HatchPageHeader } from "../_primitives";

export const DeliveryDashboard = () => {
  return (
    <main
      style={{
        padding: "24px 28px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: "var(--ink-1)",
        flex: 1,
        overflowY: "auto",
        minHeight: 0,
      }}
    >
      <HatchPageHeader
        eyebrow="Client delivery"
        title="Delivery Hub"
        subline="Active project load, handoffs, notes, files, and client work in one workspace."
      />
      <DeliveryKPIs />
      <ActiveProjectsGrid />
      <HandoffQueue />
    </main>
  );
};
