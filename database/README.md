# Database Setup Guide

This directory contains database initialization scripts for the Task Management application.

## Supported Databases

The application is designed to work with **MongoDB** as the primary database, but we've provided SQL schemas for learning multiple database systems:

1. **MongoDB** (Primary) - NoSQL document database
2. **PostgreSQL** - Advanced open-source relational database
3. **MySQL** - Popular open-source relational database

## MongoDB Setup (Primary)

### Using Docker
```bash
docker run -d \
  --name taskmanager-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=taskmanagement \
  -v $(pwd)/database/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro \
  mongo:7
```

### Using Docker Compose
See the `docker-compose.yml` in the root directory.

### Manual Setup
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Run initialization:
   ```bash
   mongosh taskmanagement < database/init-mongo.js
   ```

## PostgreSQL Setup (Alternative)

### Using Docker
```bash
docker run -d \
  --name taskmanager-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=taskmanagement \
  -e POSTGRES_USER=taskuser \
  -e POSTGRES_PASSWORD=taskpass \
  -v $(pwd)/database/schema-postgres.sql:/docker-entrypoint-initdb.d/schema.sql:ro \
  postgres:16
```

### Manual Setup
1. Install PostgreSQL: https://www.postgresql.org/download/
2. Create database:
   ```bash
   createdb taskmanagement
   ```
3. Run schema:
   ```bash
   psql taskmanagement < database/schema-postgres.sql
   ```

## MySQL Setup (Alternative)

### Using Docker
```bash
docker run -d \
  --name taskmanager-mysql \
  -p 3306:3306 \
  -e MYSQL_DATABASE=taskmanagement \
  -e MYSQL_USER=taskuser \
  -e MYSQL_PASSWORD=taskpass \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -v $(pwd)/database/schema-mysql.sql:/docker-entrypoint-initdb.d/schema.sql:ro \
  mysql:8
```

### Manual Setup
1. Install MySQL: https://dev.mysql.com/downloads/
2. Create database:
   ```sql
   CREATE DATABASE taskmanagement;
   ```
3. Run schema:
   ```bash
   mysql taskmanagement < database/schema-mysql.sql
   ```

## Database Schema Overview

### Collections/Tables

#### Users
- Stores user account information
- Fields: username, email, password (hashed), profile info
- Authentication and authorization

#### Tasks
- Main task entities
- Fields: title, description, status, priority, assignments
- Relationships: assigned to users, belongs to categories

#### Categories
- Task organization system
- Fields: name, description, color, icon
- Created by users for personal organization

#### Comments & Attachments
- Task collaboration features
- Comments: user feedback on tasks
- Attachments: file uploads (URLs in current implementation)

## Indexes

Optimized indexes are created for:
- User lookups (email, username)
- Task queries (assignee, status, category, due date)
- Performance on common query patterns

## Backup & Restore

### MongoDB
```bash
# Backup
mongodump --db taskmanagement --out ./backup

# Restore
mongorestore --db taskmanagement ./backup/taskmanagement
```

### PostgreSQL
```bash
# Backup
pg_dump taskmanagement > backup.sql

# Restore
psql taskmanagement < backup.sql
```

### MySQL
```bash
# Backup
mysqldump taskmanagement > backup.sql

# Restore
mysql taskmanagement < backup.sql
```

## Environment Variables

Update your backend `.env` file:

```env
# MongoDB (Default)
MONGODB_URI=mongodb://localhost:27017/taskmanagement

# PostgreSQL (if using)
DATABASE_URL=postgresql://taskuser:taskpass@localhost:5432/taskmanagement

# MySQL (if using)
DATABASE_URL=mysql://taskuser:taskpass@localhost:3306/taskmanagement
```

## DevOps Learning Notes

This multi-database setup is excellent for learning:
- Database containerization
- Schema design across different database types
- Migration strategies
- Backup and disaster recovery
- Performance tuning
- Replication and clustering
- Database monitoring
