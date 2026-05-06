import { Router } from "express";
import { signup, login , getUsers } from "../controller/usercontroller.js";
import { authorization } from "../middleware/authmiddlewire.js";

const useroute = Router();

// POST /api/auth/signup
useroute.post("/signup", signup);

// POST /api/auth/login
useroute.post("/login", login);


export default useroute;