import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { CapacityPanel } from "./widgets/CapacityPanel";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";

export const DeliveryDashboard = () => {
  return (
    <main
      style={{
        padding: "24px 28px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: "#060A16",
        flex: 1,
        overflowY: "auto",
        minHeight: 0,
      }}
    >
      <DeliveryKPIs />
      <HandoffQueue />
      <CapacityPanel />
      <ActiveProjectsGrid />
    </main>
  );
};
