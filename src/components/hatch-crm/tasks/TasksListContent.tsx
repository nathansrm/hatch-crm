import { TasksListByDueDate } from "./TasksListByDueDate";
import { useTranslate } from "ra-core";
import { HATCH } from "../_primitives";

export const TasksListContent = () => {
  const translate = useTranslate();
  return (
    <TasksListByDueDate
      emptyPlaceholder={
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: HATCH.textMuted,
            fontSize: 14,
          }}
        >
          {translate("resources.tasks.empty_list_hint")}
        </div>
      }
    />
  );
};
