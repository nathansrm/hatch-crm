import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { MobileAppHeader, MobileAvatar } from "../layout/MobileChrome";
import { TasksListContent } from "./TasksListContent";
import { useTranslate } from "ra-core";

export const MobileTasksList = () => {
  const translate = useTranslate();
  return (
    <>
      <MobileHeader>
        <MobileAppHeader
          title={translate("resources.tasks.name", { smart_count: 2 })}
          subtitle="Mine, sales, delivery"
          actions={<MobileAvatar label="N" />}
        />
      </MobileHeader>
      <MobileContent>
        <TasksListContent />
      </MobileContent>
    </>
  );
};
