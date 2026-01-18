// MongoDB Initialization Script
// This script seeds the database with initial data

db = db.getSiblingDB('taskmanagement');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('categories');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.tasks.createIndex({ assignedTo: 1, status: 1 });
db.tasks.createIndex({ createdBy: 1 });
db.tasks.createIndex({ category: 1 });
db.tasks.createIndex({ dueDate: 1 });

db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ createdBy: 1 });

print('Database initialized successfully!');
print('Collections created: users, tasks, categories');
print('Indexes created for optimal query performance');
