import { useTranslate } from "ra-core";

import { AddTask } from "./AddTask";
import { TasksListContent } from "./TasksListContent";

export const TasksPage = () => {
  const translate = useTranslate();
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        minHeight: 0,
        background: "#060A16",
      }}
    >
      <div style={{ padding: "24px 28px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#4DC8E8",
              fontWeight: 700,
            }}
          >
            Work queue
          </span>
          <span
            style={{
              height: 1,
              width: 24,
              background: "rgba(77,200,232,0.4)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: '"Manrope Variable", ui-sans-serif',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#ECEEF5",
            }}
          >
            {translate("resources.tasks.name", {
              smart_count: 2,
              _: "Tasks",
            })}
          </h1>
          <AddTask display="icon" selectContact />
        </div>
      </div>
      <div style={{ padding: "0 28px 40px" }}>
        <TasksListContent />
      </div>
    </div>
  );
};
