.PHONY: up down build clean lint test install

# Infrastructure commands
up:
	cd infrastructure && docker-compose up -d

down:
	cd infrastructure && docker-compose down

build:
	cd infrastructure && docker-compose build

clean:
	cd infrastructure && docker-compose down -v --remove-orphans

# Development commands
install:
	cd apps/web && npm install
	cd apps/api && pip install -r requirements.txt

lint:
	cd apps/web && npm run lint

test:
	cd apps/web && npm run test
	cd apps/api && python -m pytest

# Combined commands
dev: install
	@echo "Starting development servers..."
	@echo "Web app: http://localhost:3000"
	@echo "API: http://localhost:8000"
	@cd apps/web && npm run dev &
	@cd apps/api && uvicorn main:app --reload --host 0.0.0.0 --port 8000