import { Request, Response, NextFunction } from "express";
import passport from "../configs/passport";
import User from "../models/user";
import AuthRequest from "../interfaces/authRequest.interface";
import generateToken from "../utils/jwt";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  await passport.authenticate("signup", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: "errors", error: err });
    }
    if (!user) {
      return res.status(400).json(info);
    }
    return res.json({ message: "User created", user });
  })(req, res, next);
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  await passport.authenticate("login", (err: any, user: any, info: any) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err });
    }
    if (!user) {
      return res.status(400).json(info);
    }
    try {
      req.login(user, { session: false }, async (error) => {
        if (error) {
          return next(error);
        }
        const body = { _id: user._id };
        const token = generateToken(body);
        return res.json({ user: user, token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    return res.json({ message: "User deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

const EditUser = async (req: AuthRequest, res: Response) => {
  const { email, username } = req.body;
  const { id } = req.params;
  try {
    const UserEmail = await User.findOne({ email: email }).exec();
    if (UserEmail) {
      return res.status(400).json({ message: "email already register" });
    }
    const CurrentUser = await User.findById(req.user.id).exec();
    if (CurrentUser.id !== id) {
      return res.status(400).json({ message: "You can't edit this user" });
    }

    const newUser = await User.findByIdAndUpdate(req.user.id).exec();
    newUser.email = email;
    newUser.username = username;
    await newUser.save();
    return res.json({ message: "User edited" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};

const test = async (req: AuthRequest, res: Response) => {
  return res.json({ message: "test" });
};
export { createUser, loginUser, test };
