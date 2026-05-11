import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5175";

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

test("synthetic flow: sign in, create company, contact, note, then verify dashboard", async ({
  page,
  isMobile,
  createUser,
}) => {
  test.skip(isMobile, "Synthetic create-company flow uses desktop navigation");

  const email = "admin@hatch-test.com";
  const password = "test-password-123";
  await createUser({ email, password });

  await page.goto(APP_URL);
  await expect(page).toHaveTitle(/Hatch Theory Solutions/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForLoadState("networkidle");

  await page.goto(`${APP_URL}/#/companies/create`);
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Company name").fill("Apex Plumbing Services");

  const serviceArea = page.getByLabel("Service Area");
  if (await serviceArea.isVisible({ timeout: 2000 }).catch(() => false)) {
    await serviceArea.fill("Greater Toronto Area");
  }

  await page.getByRole("button", { name: "Create Company" }).click();
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: "Apex Plumbing Services" }),
  ).toBeVisible();

  await page.goto(`${APP_URL}/#/contacts/create`);
  await page.waitForLoadState("networkidle");

  await page.getByLabel("First name").fill("Dave");
  await page.getByLabel("Last name").fill("Martinez");
  await page.getByLabel("Title").fill("Owner");

  await page.getByLabel("Company").click();
  await page.getByPlaceholder("Search").fill("Apex");
  await page.getByText("Apex Plumbing Services").click();

  await page.getByRole("button", { name: "Create Contact" }).click();
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByRole("heading", { name: "Dave Martinez", level: 1 }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("2/3 done")).toBeVisible();

  const noteInput = await openNoteComposer(page);
  await noteInput.fill("Initial discovery call completed.");
  await page.getByRole("button", { name: "Add this note" }).click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Team activity")).toBeVisible();
  await expect(
    page.getByText(/You added Dave Martinez to Apex Plumbing Services/),
  ).toBeVisible();
  await expect(
    page.getByText(/You added a note about Dave Martinez/),
  ).toBeVisible();
});
