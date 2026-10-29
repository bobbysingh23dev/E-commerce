import type { Request, Response } from "express";
import * as userService from "../services/users";
import { getUserId } from "../utils/getUserId";

export async function listUsers(_req: Request, res: Response) {
  res.status(200).json(await userService.listUsers());
}

export async function createStaffUser(req: Request, res: Response) {
  const { email, password, name, role } = req.body;
  const user = await userService.createStaffUser({
    email,
    password,
    name,
    role,
  });
  res.status(201).json(user);
}

export async function changeUserRole(req: Request, res: Response) {
  const user = await userService.changeUserRole(
    Number(req.params.id),
    req.body.role,
    getUserId(req),
  );
  res.status(200).json(user);
}
