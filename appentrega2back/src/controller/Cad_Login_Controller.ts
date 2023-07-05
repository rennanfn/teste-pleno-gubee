import oracledb from "oracledb";
import { Token } from "./../Interfaces/index";
/* eslint-disable prettier/prettier */
import { Request, Response } from "express";
import { BdOracle } from "../model/BdOracle";
import { OperadorInterface } from "../model/Cad_Operador";
import CadOperadorDB from "../modelDB/Cad_Operador_DB";
import Criptografar from "../utils/criptografar";
import retornoPadrao from "../utils/retornoPadrao";
import { gerarToken } from "../utils/token";
import { ErroGeneral } from "./../model/ErroGeneral";

export class LoginController {
  static async autenticar(req: Request, resp: Response): Promise<Response> {
    const operador: OperadorInterface = req.body;

    if (
      typeof operador.login === "undefined" ||
      typeof operador.senha === "undefined"
    ) {
      return resp
        .status(400)
        .json(retornoPadrao(1, "Objeto recebido não é do tipo esperado!"));
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retorno = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retorno);
    }

    const cadOperador = new CadOperadorDB(operador);
    try {
      console.log(`Validando operador ${operador.login} e senha!`, 0);
      const operadorDB = await cadOperador.findLogin(
        operador.login,
        connection
      );

      if (operadorDB.length === 0) {
        return resp.status(400).json(retornoPadrao(1, `Login inválido`));
      }

      if (
        typeof operadorDB[0].senha === "undefined" ||
        operadorDB[0].senha === null
      ) {
        return resp.status(400).json(retornoPadrao(1, `Senha inválida`));
      }

      if (operadorDB[0].desativado_em !== null) {
        return resp
          .status(400)
          .json(
            retornoPadrao(1, `Não é possível autenticar. Operador desativado!`)
          );
      }

      const senhasConferem = await Criptografar.compararSenhas(
        operador.senha,
        operadorDB[0].senha
      );

      if (!senhasConferem) {
        return resp.status(400).json(retornoPadrao(1, `Senha inválida!`));
      }

      if (senhasConferem) {
        const dadosToken = await LoginController.prepararToken(
          operadorDB[0],
          connection
        );
        const token = gerarToken(dadosToken);
        if (token === "") {
          return resp.status(400).json(retornoPadrao(1, `Erro ao gerar token`));
        }
        console.log(`Token gerado com sucesso!`, 0);
        return resp.status(200).json({ token });
      }

      return resp.json(operadorDB);
    } catch (error) {
      await connection.rollback();
      const retorno = ErroGeneral.getErrorGeneral(
        "Erro ao autenticar operador",
        error
      );
      return resp.status(400).json(retorno);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async prepararToken(
    operadorDB: OperadorInterface,
    conn: oracledb.Connection
  ): Promise<Token> {
    const cadOperador = new CadOperadorDB({});

    if (typeof operadorDB.login === "undefined" || operadorDB.login === null) {
      return {} as Token;
    }
    const operadorLogin = await cadOperador.findLogin(operadorDB.login, conn);

    const dadosToken: Token = {
      id: String(operadorLogin[0].id),
      nome:
        typeof operadorLogin[0].nome !== "undefined"
          ? operadorLogin[0].nome
          : "",
      login:
        typeof operadorLogin[0].login !== "undefined"
          ? operadorLogin[0].login
          : "",
    };
    return dadosToken;
  }
}
