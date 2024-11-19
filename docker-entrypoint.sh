#!/bin/bash
xvfb-run npx playwright test --retries 0 --workers 1 --reporter=json > ./playwright-report/report.json