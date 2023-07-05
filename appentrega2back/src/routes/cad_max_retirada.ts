/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
import { Router } from "express";
import Cad_Max_Retirada_Controller from "../controller/Cad_Max_Retirada_Controller";

const cadMaxRetiradaRoutes = Router();

cadMaxRetiradaRoutes.get(
  "/colaborador",
  Cad_Max_Retirada_Controller.showColaborador
);
cadMaxRetiradaRoutes.get(
  "/colaborador/:matricula",
  Cad_Max_Retirada_Controller.findColaborador
);
cadMaxRetiradaRoutes.post("/", Cad_Max_Retirada_Controller.insert);
cadMaxRetiradaRoutes.put("/", Cad_Max_Retirada_Controller.update);
cadMaxRetiradaRoutes.get("/", Cad_Max_Retirada_Controller.show);
cadMaxRetiradaRoutes.get("/:matricula", Cad_Max_Retirada_Controller.find);
cadMaxRetiradaRoutes.delete("/", Cad_Max_Retirada_Controller.delete);

export default cadMaxRetiradaRoutes;
