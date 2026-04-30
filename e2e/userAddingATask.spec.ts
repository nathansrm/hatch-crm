import { expect, test } from "./fixtures";

test.describe("user adding a task", () => {
  test.beforeEach(async ({ createSales, createContact, createCompany }) => {
    const sales = await createSales({
      first_name: "John",
      last_name: "Doe",
      email: "john@doe.com",
      password: "password",
    });

    const company = await createCompany({
      name: "Smith Corp",
      salesId: sales.id,
    });

    await createContact({
      first_name: "Jane",
      last_name: "Smith",
      title: "CEO",
      sales_id: sales.id,
      company_id: company.id,
      notes: [{ text: "Met at a conference." }],
    });

    await createContact({
      first_name: "Bob",
      last_name: "Johnson",
      title: "CTO",
      sales_id: sales.id,
      company_id: company.id,
    });

    await createContact({
      first_name: "Alice",
      last_name: "Williams",
      title: "CFO",
      sales_id: sales.id,
      company_id: company.id,
    });
  });
  test("user adding a task", async ({ page, isMobile, menu, dismissToast }) => {
    await page.goto("http://localhost:5175/");
    await page.getByLabel("Email").fill("john@doe.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveTitle(/Hatch CRM/);
    await expect(page.getByText("Team activity")).toBeVisible();

    await menu.goToContacts();
    await page.waitForLoadState("networkidle");

    await page.getByText("Jane Smith").click();
    await page.waitForLoadState("networkidle");

    if (isMobile) {
      await page.getByRole("button", { name: "Create" }).click();
      await page.getByRole("menuitem", { name: "Task" }).click();
    } else {
      await page.getByRole("button", { name: "Add Task" }).click();
    }
    if (isMobile) {
      await page
        .getByRole("textbox", { name: "Task" })
        .fill("Follow up with Jane");
      await page.getByLabel("Due date").fill("2026-04-11");
    } else {
      await page
        .getByRole("textbox", { name: "Task" })
        .fill("Follow up with Jane");
      await page.getByLabel("Due date").fill("2026-04-11");
      await page.getByRole("button", { name: "Call", exact: true }).click();
    }

    await page.getByRole("button", { name: "Save" }).click();

    await dismissToast("Task added");

    await page.getByRole("link", { name: /Tasks/ }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Follow up with Jane")).toBeVisible();

    if (isMobile) {
      await expect(page.getByText(/Apr 10|Apr 11|4\/11\/2026/)).toBeVisible();
    } else {
      await menu.goToDashboard();

      await expect(page.getByText("Up next")).toBeVisible();
      await expect(page.getByText("Follow up with Jane")).toBeVisible();
    }
  });
});
