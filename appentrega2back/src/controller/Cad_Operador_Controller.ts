/* eslint-disable no-undef */
// import operadorSchema from "./../model/Cad_Operador";
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Request, Response } from "express";
import { BdOracle } from "../model/BdOracle";
import { OperadorInterface, operadorSchema } from "../model/Cad_Operador";
import CadOperadorDB from "../modelDB/Cad_Operador_DB";
import Criptografar from "../utils/criptografar";
import retornoPadrao from "../utils/retornoPadrao";
import { ErroGeneral } from "./../model/ErroGeneral";

export default class OperadorController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    const operador = operadorSchema.parse(req.body);

    operador.criado_em = new Date();

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

    const cadOperadorDB = new CadOperadorDB(operador);

    try {
      // Verifica no banco se já existe o login que está sendo cadastro. Logins iguais não são permitidos
      const operadorDB = await cadOperadorDB.findLogin(
        operador.login!,
        connection
      );

      if (operadorDB.length >= 1) {
        return resp
          .status(400)
          .json(
            retornoPadrao(
              1,
              `Já existe um login '${operador.login}'. Cadastre um login diferente`
            )
          );
      }

      let senhaCrip;
      if (typeof operador.senha !== "undefined") {
        if (operador.senha !== null) {
          senhaCrip = await Criptografar.criptografarSenha(operador.senha);
          operador.senha = senhaCrip;
        }
      }

      const retorno = await cadOperadorDB.insert(operador, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir operador: ${operador.login}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    const operador: OperadorInterface = req.body;
    if (typeof operador === "undefined") {
      return resp
        .status(400)
        .json(retornoPadrao(1, "Objeto recebido não é do tipo esperado"));
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com oracle",
        error
      );
      return resp.status(400).json(retornar);
    }

    const cadOperador = new CadOperadorDB(operador);
    try {
      let senhaCrip;
      if (typeof operador.senha !== "undefined") {
        if (operador.senha !== null) {
          senhaCrip = await Criptografar.criptografarSenha(operador.senha);
          operador.senha = senhaCrip;
        }
      }

      // Se durante a edição não houver alteração de senha, o front envia o campo senha como null, o que não é permitido no back
      // Por isso foi feito esta tratativa, para que caso a senha recebida do front esteja como null o back remove o campo senha do objeto
      // E envia o objeto sem senha para o banco.
      let ignorarSenhaNull = operador;
      if (operador.senha === null) {
        ignorarSenhaNull = { ...operador };
        delete ignorarSenhaNull.senha;
      }

      const retorno = await cadOperador.update(ignorarSenhaNull, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar operador ${operador.id}`,
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
    const cadOperador = new CadOperadorDB({});
    try {
      const retorno = await cadOperador.show(connection);
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
        "Erro ao abrir conexão com oracle",
        error
      );
      return resp.status(400).json(erro);
    }

    const cadOperador = new CadOperadorDB({ id });
    try {
      const retorno = await cadOperador.find(String(id), connection);
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
        "Erro ao abrir conexão com oracle",
        error
      );
      return resp.status(400).json(retornar);
    }

    const cadOperador = new CadOperadorDB({ id });
    try {
      const operador = await cadOperador.findPatch(id, connection);
      if (typeof operador === "undefined") {
        return resp
          .status(400)
          .json(retornoPadrao(1, "Operador não encontrado "));
      }

      if (operador[0].desativado_em === null) {
        operador[0].desativado_em = new Date();
      } else {
        operador[0].desativado_em = undefined;
      }

      cadOperador.patch(operador[0], connection);
      await connection.commit();
      return resp.json(operador);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar operador `,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
