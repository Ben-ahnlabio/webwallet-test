import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import * as fs from "fs";
import { readFile } from "node:fs/promises";

/**
 * read ./playwright-report/test-results.json
 * if json data 'errors' is not [], then send json file to aws sns message
 * and upload ./playwright-report/index.html file to s3 bucket
 */

interface Suite {
  title: string;
  file: string;
  specs: Spec[];
}

interface Spec {
  title: string;
  ok: boolean;
}

const bucketName = process.env.BUCKET_NAME;
const regionName = process.env.REGION_NAME;
const topicArn = process.env.TOPIC_ARN;
const bucketWebsiteBaseUrl = `http://${bucketName}.s3-website.ap-northeast-2.amazonaws.com`;

const testReportPublish = async () => {
  const htmlReportUrl = await s3Publish(
    "./playwright-report/index.html",
    regionName
  );
  const errors = await getErrorSpecs("./playwright-report/test-results.json");
  if (errors.length > 0) {
    const message = `Webwallet UI Test Failed! check the report: ${htmlReportUrl}`;
    await snsPublish(topicArn, regionName, message);
    return;
  }

  console.log("All tests passed!");
};

const s3Publish = async (filePath: string, region: string): Promise<string> => {
  const s3 = new S3Client({ region });
  // key 는 오늘 날짜와 시간을 key 로 구분해서 prefix 로 붙여서 저장
  // ex) playwright-reports/2021/09/01/20210901142521-test-report.html
  const date = new Date();
  const key = `playwright-reports/${date.getFullYear()}/${
    date.getMonth() + 1
  }/${date.getDate()}/${date
    .toISOString()
    .replace(/[-:]/g, "")}-test-report.html`;

  // 저장할 때 Content-Type 을 text/html 로 설정
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: await readFile(filePath),
    ContentType: "text/html",
  });

  const response = await s3.send(command);
  console.log(response);
  console.log(
    "test report upload. bucket site url: ",
    `${bucketWebsiteBaseUrl}/${key}`
  );
  return `${bucketWebsiteBaseUrl}/${key}`;
};

const getErrorSpecs = async (filePath: string): Promise<Spec[]> => {
  const data = fs.readFileSync(filePath, "utf8");
  const jsonData = JSON.parse(data);
  const specs: Spec[] = jsonData.suites.reduce((acc, suite) => {
    const specs = suite.specs.map((spec) => spec);
    return [...acc, ...specs];
  }, []);

  const errorSpecs = specs.filter((spec) => spec.ok === false);
  return errorSpecs;
};

const snsPublish = async (
  topicArn: string,
  regionName: string,
  message: string
) => {
  const sns = new SNSClient({ region: regionName });
  const command = new PublishCommand({
    TopicArn: topicArn,
    Message: message,
  });
  console.log("sns Published. message: ", message);
  const response = await sns.send(command);
  console.log(response);
};

testReportPublish();
