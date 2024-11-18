import { chromium, test } from "@playwright/test";

const TIMEOUT_MS_LONG = 2000;
const TIMEOUT_MS_SHORT = 1000;

const browserArgs = [
  "--disable-blink-features=AutomationControlled",
  "--no-sandbox", // May help in some environments
  "--disable-web-security", // Not recommended for production use
  "--disable-infobars", // Prevent infobars
  "--disable-extensions", // Disable extensions
  "--start-maximized", // Start maximized
  "--window-size=1280,720", // Set a specific window size
];

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const KAKAO_USERNAME = process.env.KAKAO_USERNAME;
const KAKAO_PASSWORD = process.env.KAKAO_PASSWORD;
const HEADLESS = process.env.HEADLESS === "true" ? true : false; // for google login, headless should be false

test("webwallet google social login", async () => {
  if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
    throw new Error("GOOGLE_EMAIL or GOOGLE_PASSWORD is not set");
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: browserArgs,
  });
  const context = await browser.newContext({});
  const page = await context.newPage();

  await page.goto("https://web.myabcwallet.com/en/signin");
  await page.waitForTimeout(TIMEOUT_MS_SHORT);

  await page.getByText("Welcome to ABC Wallet.").click();
  await page.waitForTimeout(TIMEOUT_MS_SHORT);

  await page.getByRole("link", { name: "ENG" }).click();

  await page.waitForTimeout(TIMEOUT_MS_LONG);

  await page
    .getByRole("button", { name: "google Continue with Google" })
    .click();
  await page.waitForTimeout(TIMEOUT_MS_LONG);

  await page.getByLabel("Email or phone").click();
  await page.waitForTimeout(TIMEOUT_MS_LONG);

  await page.getByLabel("Email or phone").fill(GOOGLE_EMAIL);
  await page.getByRole("button", { name: "Next" }).click();

  await page.waitForTimeout(TIMEOUT_MS_LONG);

  await page.getByLabel("Enter Your Password").click();

  await page.waitForTimeout(TIMEOUT_MS_LONG);
  await page.getByLabel("Enter Your Password").fill(GOOGLE_PASSWORD);
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Next" }).click();

  await page.waitForTimeout(TIMEOUT_MS_LONG);
  await page.getByRole("button", { name: "계속" }).click();

  await page.waitForTimeout(TIMEOUT_MS_LONG);
  await page.waitForURL("https://web.myabcwallet.com/en/nft", {
    timeout: 30000,
  });
  await page.waitForTimeout(TIMEOUT_MS_LONG);
});

test("webwallet kakao social login", async () => {
  if (!KAKAO_USERNAME || !KAKAO_PASSWORD) {
    throw new Error("KAKAO_USERNAME or KAKAO_PASSWORD is not set");
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: browserArgs,
  });
  const context = await browser.newContext({});
  const page = await context.newPage();

  await page.goto("https://web.myabcwallet.com/en/signin");
  await page.waitForTimeout(TIMEOUT_MS_SHORT);

  await page.getByRole("button", { name: "kakao Continue with Kakao" }).click();
  await page.waitForTimeout(TIMEOUT_MS_LONG);

  await page.getByPlaceholder("KakaoMail ID, email, phone").click();
  await page
    .getByPlaceholder("KakaoMail ID, email, phone")
    .fill(KAKAO_USERNAME);
  await page.waitForTimeout(TIMEOUT_MS_SHORT);

  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill(KAKAO_PASSWORD);
  await page.waitForTimeout(TIMEOUT_MS_SHORT);

  await page.getByRole("button", { name: "Log In", exact: true }).click();

  await page.waitForTimeout(TIMEOUT_MS_LONG);
  await page.waitForURL("https://web.myabcwallet.com/en/nft", {
    timeout: 30000,
  });
  await page.waitForTimeout(TIMEOUT_MS_LONG);
});
