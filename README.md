# MERN Invoice Generator

A full-stack invoice management application built with MongoDB, Express, React, and Node.js.

## Live Demo

- **App**: https://pack-test.up.railway.app
- **API**: https://pack-test-api.up.railway.app

## Features

- User authentication with JWT
- Product management with image upload
- Invoice creation with multiple line items
- Profile and cover image updates
- Responsive Material-UI design

## Tech Stack

**Frontend:** React, TypeScript, Material-UI, Vitest
**Backend:** Node.js, Express, TypeScript, MongoDB, JWT, Multer, Vitest

## Quick Start

### Prerequisites
- Node.js v18+
- pnpm
- MongoDB

### Installation

```bash
# Clone repository
git clone https://github.com/tatangdev/Mern-Invoice-App
cd the-pack

# Backend setup
cd backend
pnpm install
pnpm dev

# Frontend setup
cd frontend
pnpm install
pnpm start
```

### Environment Variables

Create `.env` in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/invoice-app
JWT_SECRET=your-secret-key
PORT=5000
```

## Testing

```bash
# Backend tests
cd backend && pnpm test
cd backend && pnpm test:ui

# Frontend tests
cd frontend && pnpm test
cd frontend && pnpm test:ui
```

## 🔗 Links

- **Repository**: https://github.com/tatangdev/Mern-Invoice-App