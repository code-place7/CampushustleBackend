import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  deadline: timestamp("deadline").notNull(),
  postedBy: text("posted_by").notNull(), // Clerk userId
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskApplicants = pgTable("task_applicants", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID
  taskId: integer("task_id").notNull(), // ID from tasks table
  appliedAt: timestamp("applied_at").defaultNow(),
});
