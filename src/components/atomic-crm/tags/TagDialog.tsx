import { HatchDialog } from "../_primitives";
import type { Tag } from "../types";
import { TagForm } from "./TagForm";

type TagDialogProps = {
  open: boolean;
  tag?: Pick<Tag, "name" | "color">;
  title: string;
  onSubmit(tag: Pick<Tag, "name" | "color">): Promise<void>;
  onClose(): void;
};

export function TagDialog({
  open,
  tag,
  title,
  onClose,
  onSubmit,
}: TagDialogProps) {
  const handleClose = (isOpen = false) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmit = async (data: Pick<Tag, "name" | "color">) => {
    await onSubmit(data);
    handleClose();
  };

  return (
    <HatchDialog
      open={open}
      onOpenChange={handleClose}
      eyebrow={tag ? "EDIT TAG" : "NEW TAG"}
      title={title}
      size="md"
    >
      <TagForm open={open} tag={tag} onSubmit={handleSubmit} />
    </HatchDialog>
  );
}
