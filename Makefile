test:
	yarn playwright test

test-ui:
	npx playwright test --ui

report:
	yarn playwright show-report

docker:
	docker build --no-cache -t webwallet-ui-test:latest .

docker-run:
	docker run -it --rm --env-file .env -v $(shell pwd)/docker-playwright-report:/app/playwright-report webwallet-ui-test:latest

docker-push: docker
	aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 915486611144.dkr.ecr.ap-northeast-2.amazonaws.com
	docker tag webwallet-ui-test:latest 915486611144.dkr.ecr.ap-northeast-2.amazonaws.com/webwallet-ui-test:$(shell cat version.info).$(shell git log -1 --format=%h).dev
	docker tag webwallet-ui-test:latest 915486611144.dkr.ecr.ap-northeast-2.amazonaws.com/webwallet-ui-test:latest
	docker push 915486611144.dkr.ecr.ap-northeast-2.amazonaws.com/webwallet-ui-test:$(shell cat version.info).$(shell git log -1 --format=%h).dev
	docker push 915486611144.dkr.ecr.ap-northeast-2.amazonaws.com/webwallet-ui-test:latest