# CyberBlue SOC Monorepo

A monorepo structure for the CyberBlue SOC platform.

## Structure

```
/soc
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # FastAPI backend
├── packages/
│   └── types/        # Shared TypeScript types
└── infrastructure/   # Docker Compose and Traefik config
```

## Quick Start

### Using Docker (Recommended)

```bash
make up
```

Access:
- Web app: http://localhost
- API: http://localhost/api
- Traefik dashboard: http://localhost:8080

### Development

```bash
make install
make dev
```

## Commands

- `make up` - Start all services
- `make down` - Stop all services
- `make build` - Build all services
- `make clean` - Remove containers and volumes
- `make install` - Install dependencies
- `make lint` - Run linting
- `make test` - Run tests
- `make dev` - Start development servers