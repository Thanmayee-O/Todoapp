import { Router } from "express";
import { authorization } from "../middleware/authmiddlewire.js";
import { allowRoles } from "../middleware/rolemiddleware.js";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTasks
} from "../controller/taskcontroller.js";

const taskroute = Router();

// GET /api/tasks  → all (Admin) or assigned (User)
taskroute.get("/", authorization, getTasks);

// POST /api/tasks → Admin only
taskroute.post("/", authorization, createTask);

// PUT /api/tasks/:id → update status
taskroute.put("/:id", authorization, updateTaskStatus);
taskroute.delete("/:id" , authorization , deleteTasks);

export default taskroute;