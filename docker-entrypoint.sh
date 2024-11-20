#!/bin/bash
xvfb-run npx playwright test --retries 0 --workers 1
node ./dist/publish-report.js