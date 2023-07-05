/* eslint-disable prettier/prettier */
import { ErroGeneral } from "./../model/ErroGeneral";
import { BdOracle } from "../model/BdOracle";
import { periodicidadeSchema } from "./../model/Cad_Periodicidade";
import CadPeriodicidadeDB from "../modelDB/Cad_Periodicidade_DB";
import { Request, Response } from "express";
import retornoPadrao from "../utils/retornoPadrao";

export default class PeriodicidadeController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    const periodo = periodicidadeSchema.parse(req.body);

    periodo.criado_em = new Date();

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retornar);
    }
    const cadPeriodo = new CadPeriodicidadeDB(periodo);
    try {
      const retorno = await cadPeriodo.insert(periodo, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir período ${periodo.descricao}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    const periodo = periodicidadeSchema.parse(req.body);
    if (typeof periodo === "undefined") {
      return resp
        .status(400)
        .json(retornoPadrao(1, "Objeto recebido não é do tipo esperado"));
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retornar);
    }

    const cadPeriodo = new CadPeriodicidadeDB(periodo);
    try {
      const retorno = await cadPeriodo.update(periodo, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar período ${periodo.descricao}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

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
    const cadPeriodo = new CadPeriodicidadeDB({});
    try {
      const retorno = await cadPeriodo.show(connection);
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

  static async showAtivo(req: Request, resp: Response): Promise<Response> {
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
    const cadPeriodo = new CadPeriodicidadeDB({});
    try {
      const retorno = await cadPeriodo.showAtivo(connection);
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

  static async find(req: Request, resp: Response): Promise<Response> {
    const { id } = req.params;

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

    const cadPeriodo = new CadPeriodicidadeDB({ id });
    try {
      const retorno = await cadPeriodo.find(String(id), connection);
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

  static async patch(req: Request, resp: Response): Promise<Response> {
    const { id } = req.params;

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retornar);
    }

    const cadPeriodo = new CadPeriodicidadeDB({ id });
    try {
      const periodo = await cadPeriodo.findPatch(id, connection);
      if (typeof periodo === "undefined") {
        return resp
          .status(400)
          .json(retornoPadrao(1, "Período não encontrado"));
      }

      if (periodo[0].desativado_em === null) {
        periodo[0].desativado_em = new Date();
      } else {
        periodo[0].desativado_em = undefined;
      }

      cadPeriodo.patch(periodo[0], connection);
      await connection.commit();
      return resp.json(periodo);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar o período`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
