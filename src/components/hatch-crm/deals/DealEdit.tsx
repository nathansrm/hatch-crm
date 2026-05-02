import {
  EditBase,
  Form,
  useEditContext,
  useNotify,
  useRecordContext,
  useRedirect,
  useTranslate,
} from "ra-core";
import { Link } from "react-router";
import { DeleteButton } from "@/components/admin/delete-button";
import { ReferenceField } from "@/components/admin/reference-field";

import { HatchDialog, HatchGhostButton } from "../_primitives";
import { FormToolbar } from "@/components/admin/simple-form";
import { CompanyAvatar } from "../companies/CompanyAvatar";
import type { Deal } from "../types";
import { DealInputs } from "./DealInputs";

export const DealEdit = ({ open, id }: { open: boolean; id?: string }) => {
  const redirect = useRedirect();
  const notify = useNotify();

  const handleClose = () => {
    redirect("/deals", undefined, undefined, undefined, {
      _scrollToTop: false,
    });
  };

  if (!id) {
    return (
      <HatchDialog
        open={open}
        onOpenChange={() => handleClose()}
        eyebrow="EDIT DEAL"
        title=""
        size="xl"
      >
        <div />
      </HatchDialog>
    );
  }

  return (
    <HatchDialogEditBody
      id={id}
      open={open}
      onClose={handleClose}
      notify={notify}
      redirect={redirect}
    />
  );
};

function HatchDialogEditBody({
  id,
  open,
  onClose,
  notify,
  redirect,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  notify: ReturnType<typeof useNotify>;
  redirect: ReturnType<typeof useRedirect>;
}) {
  return (
    <HatchDialog
      open={open}
      onOpenChange={() => onClose()}
      eyebrow="EDIT DEAL"
      title={<DealEditTitle />}
      headerActions={<DealEditActions />}
      size="xl"
      wrap={(node) => (
        <EditBase
          id={id}
          mutationMode="pessimistic"
          mutationOptions={{
            onSuccess: () => {
              notify("resources.deals.updated", {});
              redirect(`/deals/${id}/show`, undefined, undefined, undefined, {
                _scrollToTop: false,
              });
            },
          }}
        >
          <Form className="flex flex-col">{node}</Form>
        </EditBase>
      )}
    >
      <DealInputs />
      <FormToolbar />
    </HatchDialog>
  );
}

function DealEditTitle() {
  const { defaultTitle } = useEditContext<Deal>();
  const deal = useRecordContext<Deal>();
  if (!deal) {
    return null;
  }
  return (
    <div className="flex items-center gap-3">
      <ReferenceField source="company_id" reference="companies" link="show">
        <CompanyAvatar />
      </ReferenceField>
      <span className="font-heading text-lg font-bold text-[#ECEEF5] truncate">
        {defaultTitle}
      </span>
    </div>
  );
}

function DealEditActions() {
  const translate = useTranslate();
  const deal = useRecordContext<Deal>();
  if (!deal) {
    return null;
  }
  return (
    <>
      <DeleteButton />
      <HatchGhostButton
        asChild
        variant="outline"
        className="h-9 border-[rgba(255,255,255,0.09)] bg-transparent text-[#B8C0D6] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#ECEEF5]"
      >
        <Link to={`/deals/${deal.id}/show`}>
          {translate("resources.deals.action.back_to_deal")}
        </Link>
      </HatchGhostButton>
    </>
  );
}
