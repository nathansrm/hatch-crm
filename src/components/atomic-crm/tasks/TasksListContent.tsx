import { TasksListByDueDate } from "./TasksListByDueDate";
import { useTranslate } from "ra-core";

export const TasksListContent = () => {
  const translate = useTranslate();
  return (
    <TasksListByDueDate
      emptyPlaceholder={
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "#5C6784",
            fontSize: 14,
          }}
        >
          {translate("resources.tasks.empty_list_hint")}
        </div>
      }
    />
  );
};
