import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as fs from "fs";
import { readFile } from "node:fs/promises";

/**
 * read ./playwright-report/test-results.json
 * if json data 'errors' is not [], then send json file to aws sns message
 * and upload ./playwright-report/index.html file to s3 bucket
 */

const bucketName = process.env.BUCKET_NAME;
const regionName = process.env.REGION_NAME;
const bucketWebsiteBaseUrl = `http://${bucketName}.s3-website.ap-northeast-2.amazonaws.com`;

const testReportPublish = async () => {
  await s3Publish("./playwright-report/index.html", regionName);
  await snsPublish();
};

const s3Publish = async (filePath: string, region: string) => {
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
  console.log("bucket site url: ", `${bucketWebsiteBaseUrl}/${key}`);
};

const snsPublish = async () => {
  const data = fs.readFileSync("./playwright-report/test-results.json", "utf8");
  const jsonData = JSON.parse(data);
  if (jsonData.errors.length > 0) {
    console.log("error.");
  } else {
    console.log("no error.");
  }
};

testReportPublish();
