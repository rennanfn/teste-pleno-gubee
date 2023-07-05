/* eslint-disable camelcase */
import { Router } from "express";
import Cad_Periodicidade_Controller from "../controller/Cad_Periodicidade_Controller";

const cadPeriodicidadeRoutes = Router();

cadPeriodicidadeRoutes.get("/ativo", Cad_Periodicidade_Controller.showAtivo);
cadPeriodicidadeRoutes.post("/", Cad_Periodicidade_Controller.insert);
cadPeriodicidadeRoutes.get("/", Cad_Periodicidade_Controller.show);
cadPeriodicidadeRoutes.get("/:id", Cad_Periodicidade_Controller.find);
cadPeriodicidadeRoutes.put("/", Cad_Periodicidade_Controller.update);
cadPeriodicidadeRoutes.patch("/:id", Cad_Periodicidade_Controller.patch);

export default cadPeriodicidadeRoutes;
