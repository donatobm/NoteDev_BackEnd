import express from "express";
import { createUser, loginUser, test } from "../controllers/users.controllers";
import passport from "passport";

const router = express.Router();

router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/test", passport.authenticate("jwt", { session: false }), test);

export default router;
