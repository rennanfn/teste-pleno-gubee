/* eslint-disable no-undef */
import { Router } from "express";
import cadComodatoRoutes from "./cad_comodato";
import cadMaxRetiradaRoutes from "./cad_max_retirada";
import cadOperadorRoutes from "./cad_operador";
import cadPeriodicidadeRoutes from "./cad_periodicidade";
import cadProdutoRoutes from "./cad_produto";
import { loginRoutes } from "./login";

const routes = Router();

/* routes.get("/", (req: Request, resp: Response) => {
  console.log("Solicitação Rota Raiz");
  return resp.json({ msg: "BackEnd Executando com sucesso!" });
}); */

routes.use("/cadOperador", cadOperadorRoutes);
routes.use("/login", loginRoutes);
routes.use("/cadPeriodo", cadPeriodicidadeRoutes);
routes.use("/cadProduto", cadProdutoRoutes);
routes.use("/cadMaxRetirada", cadMaxRetiradaRoutes);
routes.use("/cadComodato", cadComodatoRoutes);

export default routes;
