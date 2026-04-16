import { TasksList } from "./TasksList";
import { ActiveProjectsGrid } from "./widgets/ActiveProjectsGrid";
import { CapacityPanel } from "./widgets/CapacityPanel";
import { DeliveryKPIs } from "./widgets/DeliveryKPIs";
import { HandoffQueue } from "./widgets/HandoffQueue";

export const DeliveryDashboard = () => {
  return (
    <div className="space-y-6">
      <DeliveryKPIs />
      <HandoffQueue />
      <CapacityPanel />
      <ActiveProjectsGrid />
      <TasksList />
    </div>
  );
};
