import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const openNoteComposer = async (page: Page) => {
  await page.getByRole("button", { name: "Add note" }).first().click();
  await page.waitForLoadState("networkidle");

  const noteInput = page.getByRole("textbox", { name: "Add a note" });
  if (!(await noteInput.isVisible({ timeout: 1000 }).catch(() => false))) {
    await page.getByRole("button", { name: "Add note" }).first().click();
  }

  await expect(noteInput).toBeVisible();
  return noteInput;
};

test("user onboarding", async ({ page, isMobile, menu, dismissToast }) => {
  await page.goto("http://localhost:5175/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Hatch Theory Solutions/);
  await expect(
    page.getByText("Welcome to Hatch Theory Solutions"),
  ).toBeVisible();

  await page.getByLabel("First name").fill("John");
  await page.getByLabel("Last name").fill("Doe");
  await page.getByLabel("Email").fill("john@doe.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("What's next?")).toBeVisible();
  await expect(page.getByText("1/3 done")).toBeVisible();
  await expect(page.getByText("Install Hatch Theory Solutions")).toBeVisible();
  await expect(page.getByText("Add your first contact")).toBeVisible();
  await expect(page.getByText("Add your first note")).toBeVisible();

  await page.getByText("New Contact").click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel("She/Her").click();
  await page.getByLabel("First name").fill("Jane");
  await page.getByLabel("Last name").fill("Smith");
  await page.getByLabel("Title").fill("CEO");
  await page.getByLabel("Company").click();
  await page.getByPlaceholder("Search").fill("Smith Corp");
  await page.getByText("Create Smith Corp").click();
  await page
    .getByRole("group", { name: "Email addresses" })
    .getByRole("textbox", { name: "Email" })
    .fill("jane@smithcorp.com");
  await page
    .getByRole("group", { name: "Email addresses" })
    .getByRole("button", { name: "Add" })
    .click();

  await page
    .getByRole("group", { name: "Phone numbers" })
    .getByRole("textbox", { name: "Phone number" })
    .fill("+1234567890");
  await page
    .getByRole("group", { name: "Phone numbers" })
    .getByRole("button", { name: "Add" })
    .click();

  await page
    .getByLabel("LinkedIn URL")
    .fill("https://www.linkedin.com/in/jane-smith");

  await page
    .getByLabel("Background info (bio, how you met, etc)")
    .fill("Met at a conference.");

  await page.getByLabel("Has newsletter").check();

  await expect(page.getByLabel("Account manager *")).toHaveText("John Doe");

  await page
    .getByRole("button", { name: isMobile ? "Save" : "Create Contact" })
    .click();

  await dismissToast("Element created");

  await expect(
    page.getByRole("heading", { name: "Jane Smith" }).first(),
  ).toBeVisible();
  await expect(page.getByText("CEO at Smith Corp")).toBeVisible();

  await menu.goToDashboard();
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("2/3 done")).toBeVisible();

  const noteInput = await openNoteComposer(page);
  await noteInput.fill("This is a note about Jane.");
  await page.getByRole("button", { name: "Save" }).click();

  await dismissToast("Note added");

  await expect(
    page.getByText(isMobile ? "Me" : "Note added", { exact: false }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("This is a note about Jane.").first(),
  ).toBeVisible();

  await menu.goToDashboard();

  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Team activity")).toBeVisible();
  await expect(page.getByText(/You added company Smith Corp/)).toBeVisible();
  await expect(
    page.getByText(/You added Jane Smith to Smith Corp/),
  ).toBeVisible();
  await expect(
    page.getByText(/You added a note about Jane Smith/),
  ).toBeVisible();
});
