# FundRise Backend API

Backend API for the FundRise crowdfunding platform built with Node.js, Express, and MongoDB.

## Features

- JWT authentication with role-based access (Donor, Creator, Admin)
- Campaign management (CRUD operations)
- Donation processing
- Admin approval workflow
- RESTful API design

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT

## Environment Variables

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Campaigns
- GET `/api/campaigns` - Get all campaigns
- GET `/api/campaigns/:slug` - Get single campaign
- POST `/api/campaigns` - Create campaign (Creator only)
- PUT `/api/campaigns/:id` - Update campaign (Creator only)
- DELETE `/api/campaigns/:id` - Delete campaign (Creator only)
- GET `/api/campaigns/my-campaigns` - Get user's campaigns

### Admin
- GET `/api/admin/users` - Get all users (Admin only)
- GET `/api/campaigns/pending` - Get pending campaigns (Admin only)
- PUT `/api/campaigns/:id/approve` - Approve campaign (Admin only)
- PUT `/api/campaigns/:id/reject` - Reject campaign (Admin only)

### Donations
- POST `/api/donations` - Create donation
- GET `/api/donations/my-donations` - Get user's donations

## Deployment

This backend is designed to be deployed on AWS services like:
- AWS Elastic Beanstalk
- AWS EC2
- AWS Lambda (with serverless framework)
- AWS ECS/Fargate

## License

MIT
