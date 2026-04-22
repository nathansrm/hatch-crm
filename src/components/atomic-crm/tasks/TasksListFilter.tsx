import {
  ListContextProvider,
  ResourceContextProvider,
  useList,
  useTranslate,
} from "ra-core";

import { TasksIterator } from "./TasksIterator";

type TaskListProps = {
  tasks: any[];
  title: string;
  showContact?: boolean;
  isMobile: boolean;
};

export const TaskListFilter = ({
  tasks,
  title,
  showContact,
  isMobile,
}: TaskListProps) => {
  const translate = useTranslate();
  const listContext = useList({
    data: tasks,
    resource: "tasks",
    perPage: isMobile ? 10 : 5,
  });

  const { total } = listContext;
  const titleLower = title.toLowerCase();
  const groupTone = titleLower.includes("overdue")
    ? "#EF5A6F"
    : titleLower.includes("today")
      ? "#F5B84A"
      : titleLower.includes("tomorrow") ||
          titleLower.includes("week") ||
            titleLower.includes("upcoming") ||
              titleLower.includes("later")
        ? "#4DC8E8"
        : "#5C6784";

  if (!tasks?.length || !total) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: groupTone,
          }}
        />
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: groupTone,
            fontWeight: 700,
          }}
        >
          {title}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 10.5,
            color: "#5C6784",
            fontWeight: 600,
          }}
        >
          {total}
        </span>
      </div>
      <ResourceContextProvider value="tasks">
        <ListContextProvider value={listContext}>
          <TasksIterator showContact={showContact} />
        </ListContextProvider>
      </ResourceContextProvider>
      {total > listContext.perPage && (
        <div className="flex justify-center">
          <a
            href="#"
            onClick={(e) => {
              listContext.setPerPage(listContext.perPage + 10);
              e.preventDefault();
            }}
            style={{
              fontSize: 12,
              color: "#4DC8E8",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            {translate("crm.common.load_more")}
          </a>
        </div>
      )}
    </div>
  );
};
