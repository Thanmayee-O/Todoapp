import { Task } from "../models/Task.js";

// 🔹 Get Tasks (Role-based + ownership-based)
export const getTasks = async (req, res) => {
  try {
    const user = req.user; // from auth middleware

    let tasks;

    if (user.role === "Admin") {
      // Admin sees ONLY tasks they created
      tasks = await Task.find({ createdBy: user._id }).populate("assignedTo", "email");
    } else {
      // User sees ONLY tasks assigned to them
      tasks = await Task.find({ assignedTo: user._id });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching tasks" });
  }
};

// 🔹 Create Task (Admin only — sets createdBy automatically)
export const createTask = async (req, res) => {
  try {
    const user = req.user; // set by auth middleware

    if (user.role !== "Admin") {
      return res.status(403).json({ msg: "Only admin can create tasks" });
    }

    const { title, description, assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ msg: "assignedTo is required" });
    }

    const task = await Task.create({
      title,
      description,
      status: "pending",
      assignedTo,
      createdBy: user._id, // 🔐 ownership stamped at creation
    });

    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ msg: "Error creating task" });
  }
};

// 🔹 Update Task (Admin: ownership check | User: assignment check)
export const updateTaskStatus = async (req, res) => {
  try {
    const { title, description, assignedTo, status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (req.user.role === "Admin") {
      // Admin may only update tasks they created
      if (!task.createdBy || task.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Forbidden: you can only edit tasks you created" });
      }
      if (title) task.title = title;
      if (description) task.description = description;
      if (assignedTo) task.assignedTo = assignedTo;
      if (status) task.status = status;
    } else {
      // User may only update status on tasks assigned to them
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Not authorized to update this task" });
      }
      if (status) task.status = status;
    }

    await task.save();

    res.json({ msg: "Task updated", task });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 🔹 Delete Task (Admin only + ownership check)
export const deleteTasks = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    const { id } = req.params;

    if (user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Admin may only delete tasks they created
    if (!task.createdBy || task.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ msg: "Forbidden: you can only delete tasks you created" });
    }

    await task.deleteOne();

    res.json({ msg: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error deleting task" });
  }
};