import { expect, test } from "@playwright/test";

test.describe("portfolio v0.1 smoke paths", () => {
  test("requester creates a ticket and the Kanban board exposes keyboard-operable workflow controls", async ({
    page
  }) => {
    await page.goto("/tickets");

    await expect(page.getByRole("heading", { name: "Support tickets" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Open" })).toBeVisible();

    await page.getByLabel("Title").fill("Laptop dock fails in demo lab");
    await page
      .getByLabel("Description")
      .fill("The fictional demo lab dock drops monitor output during onboarding.");
    await page.getByRole("button", { name: "Create ticket" }).click();

    await expect(
      page.getByRole("article", { name: "Laptop dock fails in demo lab", exact: true })
    ).toBeVisible();

    const openCard = page
      .getByRole("region", { name: "Open" })
      .getByRole("article", { name: /Kanban card Laptop dock fails in demo lab/ });
    await expect(openCard.getByLabel("Move status")).toBeVisible();
    await expect(openCard.getByRole("button", { name: "Apply" })).toBeDisabled();

    await openCard.getByLabel("Move status").selectOption("TRIAGED");
    await openCard.getByRole("button", { name: "Apply" }).click();

    await expect(
      page
        .getByRole("region", { name: "Triaged" })
        .getByRole("article", { name: /Kanban card Laptop dock fails in demo lab/ })
    ).toBeVisible();
  });

  test("dashboard charts expose filter controls and text equivalents", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Support dashboard" })).toBeVisible();
    await expect(page.getByLabel("Dashboard filters")).toBeVisible();
    await expect(page.locator('[aria-label="Status distribution"]')).toBeVisible();
    await expect(page.locator('[aria-label="Category distribution"]')).toBeVisible();
    await expect(page.locator('[aria-label="Priority distribution"]')).toBeVisible();
    await expect(page.locator('[aria-label="Created tickets and status movements"]')).toBeVisible();

    await page.getByLabel("From").fill("2026-09-01");
    await page.getByLabel("To").fill("2026-09-30");
    await page.getByRole("button", { name: "Refresh dashboard" }).click();

    await expect(
      page.getByRole("heading", { name: "No dashboard metrics in this range" })
    ).toBeVisible();
  });
});
