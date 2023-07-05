/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
import { Router } from "express";
import Cad_Produto_Controller from "../controller/Cad_Produto_Controller";

const cadProdutoRoutes = Router();

cadProdutoRoutes.post("/", Cad_Produto_Controller.insert);
cadProdutoRoutes.put("/", Cad_Produto_Controller.update);
cadProdutoRoutes.get("/", Cad_Produto_Controller.show);
cadProdutoRoutes.get("/ativo", Cad_Produto_Controller.showAtivo);
cadProdutoRoutes.get("/:id", Cad_Produto_Controller.find);
cadProdutoRoutes.patch("/:id", Cad_Produto_Controller.patch);

export default cadProdutoRoutes;
