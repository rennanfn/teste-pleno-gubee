/* eslint-disable camelcase */
import { Router } from "express";
import Cad_Comodato_Controller from "../controller/Cad_Comodato_Controller";

const cadComodatoRoutes = Router();

cadComodatoRoutes.get("/", Cad_Comodato_Controller.show);

export default cadComodatoRoutes;
