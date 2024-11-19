test:
	yarn playwright test

test-ui:
	npx playwright test --ui

report:
	yarn playwright show-report

docker:
	docker build --no-cache -t webwallet-test:latest .

docker-run:
	docker run -it --rm --env-file .env -v $(shell pwd)/docker-playwright-report:/app/playwright-report webwallet-test:latest