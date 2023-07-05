/* eslint-disable camelcase */
import {
  MaxRetiradaInterface,
  maxRetiradaSchema,
} from "./../model/Cad_Max_Retirada";
/* eslint-disable prettier/prettier */
import { Request, Response } from "express";
import { BdOracle } from "../model/BdOracle";
import CadMaxRetiradaDB from "../modelDB/Cad_Max_Retirada_DB";
import retornoPadrao from "../utils/retornoPadrao";
import { ErroGeneral } from "./../model/ErroGeneral";

export default class MaxRetiradaController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    // const maxRetirada = maxRetiradaSchema.parse(req.body);

    // maxRetirada.criado_em = new Date();

    const maxRetirada = req.body.map((maxRetirada) => {
      const maxRetiradaMap = maxRetiradaSchema.parse(maxRetirada);
      maxRetiradaMap.criado_em = new Date();
      return maxRetiradaMap;
    });

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
    const cadMaxRetirada = new CadMaxRetiradaDB(maxRetirada);
    try {
      // Verifica no banco se já existe uma liberação de um determinado produto para um determinado colaborador
      // Lembrando que o colaborador pode retirar n produtos e n quantidade destes produtos
      // Porém não pode ter mais de um cadastro de retirada para o mesmo produto
      const maxRetiradaDB = await Promise.all(
        maxRetirada.map((array) =>
          cadMaxRetirada.verificaMaxRetirada(array, connection)
        )
      );

      if (
        Array.isArray(maxRetiradaDB) &&
        maxRetiradaDB.some((arr) => Array.isArray(arr) && arr.length > 0)
      ) {
        let mensagem = `Já existe uma retirada do produto: `;
        for (let i = 0; i < maxRetirada.length; i++) {
          mensagem += `${maxRetirada[i].produto_id} para o colaborador: ${maxRetirada[i].matricula}`;
          if (i < maxRetirada.length - 1) {
            mensagem += ", do produto: ";
          }
        }
        return resp.status(400).json(retornoPadrao(1, mensagem));
      }
      // const retorno = await cadMaxRetirada.insert(maxRetirada, connection);
      const insert = maxRetirada.map((maxRet) =>
        cadMaxRetirada.insert(maxRet, connection)
      );
      const retorno = await Promise.all(insert);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir máx. retirada para o colaborador ${maxRetirada.matricula}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    const maxRetirada = maxRetiradaSchema.parse(req.body);
    if (typeof maxRetirada === "undefined") {
      return resp
        .status(400)
        .json(retornoPadrao(1, "Objeto recebido não é do tipo esperado!"));
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

    const cadMaxRetirada = new CadMaxRetiradaDB({});
    try {
      const retorno = await cadMaxRetirada.update(maxRetirada, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar máx. retirada do colaborador ${maxRetirada.matricula}`,
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
    const cadMaxRetirada = new CadMaxRetiradaDB({});
    try {
      const retorno = await cadMaxRetirada.show(connection);
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
    const { matricula } = req.params;

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

    const cadMaxRetirada = new CadMaxRetiradaDB({});
    try {
      const retorno = await cadMaxRetirada.find(Number(matricula), connection);
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

  static async showColaborador(
    req: Request,
    resp: Response
  ): Promise<Response> {
    const { matricula } = req.body;

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erroG = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(erroG);
    }
    const cadMaxRetirada = new CadMaxRetiradaDB(matricula);
    try {
      const retorno = await cadMaxRetirada.showColaborador(connection);
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

  static async findColaborador(
    req: Request,
    resp: Response
  ): Promise<Response> {
    const { matricula } = req.params;

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erroG = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(erroG);
    }

    const cadMaxRetirada = new CadMaxRetiradaDB({});
    try {
      const retorno = await cadMaxRetirada.findColaborador(
        Number(matricula),
        connection
      );
      return resp.json(retorno);
    } catch (error) {
      const resultError = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetos`,
        error
      );
      return resp.status(400).json(resultError);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async delete(req: Request, resp: Response): Promise<Response> {
    const matricula: MaxRetiradaInterface = req.body;
    if (!Array.isArray(matricula)) {
      return resp
        .status(400)
        .json(retornoPadrao(1, "Objeto recebido não é do tipo esperado"));
      // const matricula = req.body.map((matricula) => {
      //   const matriculaMap = maxRetiradaSchema.parse(matricula);
      // });
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
    const cadMaxRetirada = new CadMaxRetiradaDB({});
    try {
      // const retorno = await cadOperador.delete(String(matricula), connection);
      const deletar = matricula.map((matricula) =>
        cadMaxRetirada.delete(matricula, connection)
      );
      const retorno = await Promise.all(deletar);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao deletar retirada do colaborador ${matricula}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
