import { TasksList } from "./TasksList";
import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { CapacityPanel } from "./widgets/CapacityPanel";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";

export const DeliveryDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Delivery Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Handoff queue, active project load, and capacity.
        </p>
      </div>
      <DeliveryKPIs />
      <HandoffQueue />
      <CapacityPanel />
      <ActiveProjectsGrid />
      <TasksList variant="sales" />
    </div>
  );
};
