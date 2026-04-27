import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import {
  useRecordContext,
  useDeleteWithUndoController,
  useGetRecordRepresentation,
  useNotify,
  useTranslate,
  useUpdate,
} from "ra-core";
import { useEffect, useState } from "react";
import { ReferenceField } from "@/components/admin/reference-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

import { HATCH } from "../_primitives";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, Task as TData } from "../types";
import { TaskEdit } from "./TaskEdit";
import { TaskEditSheet } from "./TaskEditSheet";

export const Task = ({
  task: taskProp,
  showContact,
}: {
  task: TData;
  showContact?: boolean;
}) => {
  const task = useRecordContext<TData>() ?? taskProp;
  const isMobile = useIsMobile();
  const { taskTypes } = useConfigurationContext();
  const notify = useNotify();
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const getContactRepresentation = useGetRecordRepresentation("contacts");

  const [openEdit, setOpenEdit] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  const [update, { isPending: isUpdatePending, isSuccess, variables }] =
    useUpdate();
  const { handleDelete } = useDeleteWithUndoController({
    record: task,
    redirect: false,
    mutationOptions: {
      onSuccess() {
        notify("resources.tasks.deleted", {
          undoable: true,
        });
      },
    },
  });

  const handleEdit = () => {
    setOpenEdit(true);
  };

  const handleCheck = () => () => {
    update("tasks", {
      id: task.id,
      data: {
        done_date: task.done_date ? null : new Date().toISOString(),
      },
      previousData: task,
    });
  };

  useEffect(() => {
    // We do not want to invalidate the query when a tack is checked or unchecked
    if (
      isUpdatePending ||
      !isSuccess ||
      variables?.data?.done_date != undefined
    ) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["tasks", "getList"] });
  }, [queryClient, isUpdatePending, isSuccess, variables]);

  const checkboxId = `checkbox-list-${task.id}`;
  const labelId = `checkbox-list-label-${task.id}`;
  const taskTypeLabel =
    task.type && task.type !== "none"
      ? (taskTypes.find((taskType) => taskType.value === task.type)?.label ??
        task.type)
      : null;
  const taskText = task.text;
  const isDone = !!task.done_date;
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          padding: "14px 16px",
          borderRadius: 10,
          transition: "all 0.15s",
          background: isHovered ? "rgb(17 26 46)" : HATCH.surface,
          border: "1px solid rgba(255,255,255,0.07)",
          opacity: isDone ? 0.5 : 1,
          marginBottom: 8,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1 }}
          onClick={isMobile ? handleCheck() : undefined}
        >
          <button
            type="button"
            id={checkboxId}
            aria-labelledby={labelId}
            aria-pressed={isDone}
            disabled={isUpdatePending}
            onClick={(event) => {
              event.stopPropagation();
              handleCheck()();
            }}
            style={{
              width: 20,
              height: 20,
              flexShrink: 0,
              borderRadius: 6,
              marginTop: 2,
              background: isDone ? "rgb(52 211 153)" : HATCH.fieldBg,
              border: isDone
                ? "1.5px solid rgb(52 211 153)"
                : "1.5px solid rgba(255,255,255,0.2)",
              display: "grid",
              placeItems: "center",
              cursor: isUpdatePending ? "default" : "pointer",
              transition: "all 0.15s",
              color: "rgb(255 255 255)",
              fontSize: 11,
            }}
          >
            {isDone ? "\u2713" : null}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              id={labelId}
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: isDone ? HATCH.textMuted : HATCH.textHi,
                textDecoration: isDone ? "line-through" : "none",
                marginBottom: 4,
                lineHeight: 1.35,
              }}
            >
              {taskText}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 11.5,
                flexWrap: "wrap",
              }}
            >
              {formattedDueDate ? (
                <span
                  className="font-mono"
                  style={{
                    color: HATCH.textLo,
                    fontWeight: 600,
                  }}
                >
                  {formattedDueDate}
                </span>
              ) : null}
              {taskTypeLabel ? (
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: HATCH.textMuted,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {taskTypeLabel}
                </span>
              ) : null}
              {showContact && (
                <ReferenceField<TData, Contact>
                  source="contact_id"
                  reference="contacts"
                  record={task}
                  link="show"
                  className="inline"
                  render={({ referenceRecord }) => {
                    if (!referenceRecord) return null;
                    return (
                      <span
                        style={{
                          color: HATCH.textLo,
                          fontSize: 11.5,
                        }}
                      >
                        {translate("resources.tasks.regarding_contact", {
                          name: getContactRepresentation(referenceRecord),
                        })}
                      </span>
                    );
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={translate("resources.tasks.actions.title")}
              style={{
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                color: HATCH.textLo,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <MoreVertical className="size-5 md:size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            style={{
              background: HATCH.surface,
              border: "1px solid rgba(255,255,255,0.08)",
              color: HATCH.textHi,
            }}
          >
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              style={{ color: HATCH.textHi }}
              onClick={() => {
                update("tasks", {
                  id: task.id,
                  data: {
                    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 10),
                  },
                  previousData: task,
                });
              }}
            >
              {translate("resources.tasks.actions.postpone_tomorrow")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              style={{ color: HATCH.textHi }}
              onClick={() => {
                update("tasks", {
                  id: task.id,
                  data: {
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 10),
                  },
                  previousData: task,
                });
              }}
            >
              {translate("resources.tasks.actions.postpone_next_week")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              style={{ color: HATCH.textHi }}
              onClick={handleEdit}
            >
              {translate("ra.action.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              style={{ color: HATCH.textHi }}
              onClick={handleDelete}
            >
              {translate("ra.action.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isMobile ? (
        <TaskEditSheet
          taskId={task.id}
          open={openEdit}
          onOpenChange={setOpenEdit}
        />
      ) : (
        <TaskEdit taskId={task.id} open={openEdit} close={handleCloseEdit} />
      )}
    </>
  );
};
