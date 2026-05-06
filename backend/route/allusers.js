import { Router } from "express";
import { getUsers } from "../controller/usercontroller.js";
import { authorization } from "../middleware/authmiddlewire.js";

const router = Router();

router.get("/", authorization, getUsers);

export default router;