import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";

export const HATCH_PRIMARY_BUTTON_CLASS =
  "bg-[#4DC8E8] font-semibold text-[#06111F] shadow-[0_0_20px_rgba(77,200,232,0.25)] hover:bg-[#7DDCF0]";

export const HATCH_GHOST_BUTTON_CLASS =
  "text-[#B8C0D6] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#ECEEF5]";

export const FormToolbar = () => (
  <div
    role="toolbar"
    className="sticky bottom-0 flex flex-row justify-end gap-2 border-t border-[rgba(255,255,255,0.07)] bg-[#0D1424] pt-4 pb-4 md:pb-0"
  >
    <CancelButton className={HATCH_GHOST_BUTTON_CLASS} />
    <SaveButton className={HATCH_PRIMARY_BUTTON_CLASS} />
  </div>
);
