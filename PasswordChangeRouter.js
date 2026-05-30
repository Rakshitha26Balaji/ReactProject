import express from "express";
import { changePassword } from "../controllers/user.controller.js";

export const PasswordChangeRouter = express.Router();

PasswordChangeRouter.put(
  "/change-password",
  changePassword
);