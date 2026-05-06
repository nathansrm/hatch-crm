import { render } from "vitest-browser-react";
import { useDataProvider, type DataProvider } from "ra-core";
import { buildContact, StoryWrapper } from "@/test/StoryWrapper";
import { NoteCreateSheet } from "./NoteCreateSheet";

describe("NoteCreateSheet", () => {
  it("shows an Add note action and creates the contact note", async () => {
    let dataProvider: DataProvider | null = null;
    const contact = buildContact({
      first_name: "Zach",
      last_name: "Strout",
      status: "warm",
    });

    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };

    const screen = await render(
      <StoryWrapper data={{ contacts: [contact], contact_notes: [] }}>
        <DataProviderListener />
        <NoteCreateSheet
          open
          onOpenChange={() => undefined}
          contact_id={contact.id}
        />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByText("Create note for Zach Strout"))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "Add note" }))
      .toBeVisible();

    await screen
      .getByPlaceholder("Add a note")
      .fill("Meeting about transitioning from Airtable to new CRM.");
    await screen.getByRole("button", { name: "Add note" }).click();

    let createdNote: any;
    await expect
      .poll(async () => {
        const { data } = await dataProvider!.getList("contact_notes", {
          filter: {},
          pagination: { page: 1, perPage: 10 },
          sort: { field: "id", order: "ASC" },
        });
        createdNote = data.find((note) =>
          String(note.text).includes("transitioning from Airtable"),
        );
        return createdNote;
      })
      .toBeTruthy();

    expect(createdNote).toMatchObject({ contact_id: contact.id });
  });
});
