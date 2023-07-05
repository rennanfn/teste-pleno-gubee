/* eslint-disable camelcase */
import { Router } from "express";
import Cad_Operador_Controller from "../controller/Cad_Operador_Controller";

const cadOperadorRoutes = Router();

cadOperadorRoutes.post("/", Cad_Operador_Controller.insert);
cadOperadorRoutes.get("/", Cad_Operador_Controller.show);
cadOperadorRoutes.get("/:id", Cad_Operador_Controller.find);
cadOperadorRoutes.put("/", Cad_Operador_Controller.update);
// cadOperadorRoutes.delete("/:id", Cad_Operador_Controller.delete);
cadOperadorRoutes.patch("/:id", Cad_Operador_Controller.patch);

export default cadOperadorRoutes;
