/* eslint-disable prettier/prettier */
import { ErroGeneral } from "./../model/ErroGeneral";
import { Request, Response } from "express";
import { BdOracle } from "../model/BdOracle";
import CadComodatoDB from "../modelDB/Cad_Comodato_DB";

export default class ComodatoController {
  static async show(req: Request, resp: Response): Promise<Response> {
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erro = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(erro);
    }

    const cadComodato = new CadComodatoDB({});
    try {
      const retorno = await cadComodato.show(connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
