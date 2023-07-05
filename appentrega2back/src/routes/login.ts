import { LoginController } from "./../controller/Cad_Login_Controller";
import { Router } from "express";

export const loginRoutes = Router();

loginRoutes.post("/", LoginController.autenticar);
