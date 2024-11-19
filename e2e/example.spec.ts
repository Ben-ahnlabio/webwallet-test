import { chromium, expect, Page, test } from "@playwright/test";

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
const NAVER_USERNAME = process.env.NAVER_USERNAME;
const NAVER_PASSWORD = process.env.NAVER_PASSWORD;
const HEADLESS = process.env.HEADLESS === "true" ? true : false; // for google login, headless should be false

test.beforeAll(async () => {
  // Set timeout for this hook.
  test.setTimeout(60000);
});

async function googleNextBtnClick(page: Page) {
  // '계속', 'Next' 는 사용자 언어설정, 실행되는 환경에 따라 다름
  try {
    await page.getByRole("button", { name: "계속" }).click({ timeout: 3000 });
  } catch (e) {
    console.warn("'계속' button not found");
  }
  try {
    await page.getByRole("button", { name: "Next" }).click({ timeout: 3000 });
  } catch (e) {
    console.warn("'Next' button not found");
  }
}

test("webwallet google social login", async () => {
  if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
    console.warn("GOOGLE_EMAIL or GOOGLE_PASSWORD is not set");
    return;
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: browserArgs,
  });
  const context = await browser.newContext({});
  const page = await context.newPage();

  await page.goto("https://web.myabcwallet.com/en/signin");
  const isVisible = await page.getByText("Welcome to ABC Wallet.").isVisible();
  expect(isVisible).toBeTruthy();

  await page
    .getByRole("button", { name: "google Continue with Google" })
    .click();

  await page.getByLabel("Email or phone").click();
  await page.getByLabel("Email or phone").fill(GOOGLE_EMAIL);
  await googleNextBtnClick(page);

  await page.getByLabel("Enter Your Password").click();
  await page.getByLabel("Enter Your Password").fill(GOOGLE_PASSWORD);
  await googleNextBtnClick(page);
  await page.waitForTimeout(TIMEOUT_MS_LONG);

  await googleNextBtnClick(page);
  await page.waitForURL("https://web.myabcwallet.com/en/nft", {
    timeout: 30000,
  });
});

test("webwallet naver social login", async () => {
  if (!NAVER_USERNAME || !NAVER_PASSWORD) {
    console.log("NAVER_USERNAME or NAVER_PASSWORD is not set");
    return;
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: browserArgs,
  });
  const context = await browser.newContext({});
  const page = await context.newPage();

  await page.goto("https://web.myabcwallet.com/en/signin");
  await page.waitForTimeout(TIMEOUT_MS_SHORT);

  const isVisible = await page.getByText("Welcome to ABC Wallet.").isVisible();
  expect(isVisible).toBeTruthy();

  await page.getByRole("button", { name: "naver Continue with NAVER" }).click();

  await page.getByLabel("ID or Phone number").click();
  await page.getByLabel("ID or Phone number").fill(NAVER_USERNAME);

  await page.getByLabel(">Password").click();
  await page.getByLabel(">Password").fill(NAVER_PASSWORD);

  await page.getByText("ON OFF").click();
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("https://web.myabcwallet.com/en/nft", {
    timeout: 10000,
  });
});

test("webwallet kakao social login", async () => {
  if (!KAKAO_USERNAME || !KAKAO_PASSWORD) {
    console.warn("KAKAO_USERNAME or KAKAO_PASSWORD is not set");
    return;
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
    timeout: 10000,
  });
  await page.waitForTimeout(TIMEOUT_MS_LONG);
});
