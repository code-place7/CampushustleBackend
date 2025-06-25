import express from "express";
import "dotenv/config";
import { db } from "./config/db.js";
import { tasks, taskApplicants } from "./config/schema.js";
import { eq, and, desc } from "drizzle-orm";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});

// create a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, reward, deadline, postedBy } = req.body;

    if (!title || !description || !reward || !deadline || !postedBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTask = await db
      .insert(tasks)
      .values({
        title,
        description,
        reward,
        deadline,
        postedBy,
      })
      .returning();

    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error("Error creating task", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// endpoint for fetching all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const allTasks = await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt)); // newest first

    res.status(200).json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// endpoint for updating a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { title, description, reward, deadline } = req.body;

    const updatedTask = await db
      .update(tasks)
      .set({
        title,
        description,
        reward,
        deadline,
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(updatedTask[0]);
  } catch (error) {
    console.error("Error updating task", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// endpoint for deleting a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!deletedTask.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// endpoint for fetching a single task by ID
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const task = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task[0]);
  } catch (error) {
    console.error("Error fetching task", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// endpoint for fetching tasks posted by a specific user
app.get("/api/tasks/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.postedBy, userId));

    res.status(200).json(userTasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// endpoint for applying to a task
app.post("/api/tasks/:id/apply", async (req, res) => {
  try {
    const { userId, taskId } = req.body;

    if (!userId || !taskId) {
      return res.status(400).json({ error: "Missing userId or taskId" });
    }

    // Prevent same user from applying twice to same task
    const alreadyApplied = await db
      .select()
      .from(taskApplicants)
      .where(
        and(
          eq(taskApplicants.userId, userId),
          eq(taskApplicants.taskId, taskId)
        )
      );

    if (alreadyApplied.length > 0) {
      return res
        .status(409)
        .json({ error: "You already applied to this task" });
    }

    const newEntry = await db
      .insert(taskApplicants)
      .values({ userId, taskId })
      .returning();

    res.status(201).json(newEntry[0]);
  } catch (error) {
    console.error("Error applying to task:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// endpoint for fetching all applicants for a task
app.get("/api/tasks/:id/applicants", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const applicants = await db
      .select()
      .from(taskApplicants)
      .where(eq(taskApplicants.taskId, taskId));

    res.status(200).json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
