.PHONY: up down build logs test e2e migrate migrate-v2 migrate-v3 migrate-v4 seed

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

test:
	docker-compose exec backend npm test

e2e:
	npm run test

migrate:
	docker-compose exec backend node migrate.js

migrate-v2:
	docker-compose exec backend node migrate-v2.js

migrate-v3:
	docker-compose exec backend node migrate-v3.js

migrate-v4:
	docker-compose exec backend node migrate-v4.js

seed:
	docker-compose exec backend node ./seed/seed.js