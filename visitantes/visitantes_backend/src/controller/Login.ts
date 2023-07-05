import { Request, Response } from 'express';
import oracledb from 'oracledb';
import { Token } from '../Interfaces';
import { BdOracle } from '../model/BdOracle';
import { iUsuario } from '../model/Cad_usuario';
import { ErrorGeneral } from '../model/ErrorGeneral';
import CadUsuarioDB from '../modelDB/Cad_Usuario_DB';
import Criptografar from '../utils/criptografar';
import retornoPadrao from '../utils/retornoPadrao';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import { gerarToken, getDataToRefresh } from '../utils/token';

export class Login {
  static async autenticar(req: Request, resp: Response): Promise<Response> {
    //Recebe o login e senha, se o valor for undefined gera um bad request
    const usuario: iUsuario = req.body;

    if (
      typeof usuario.usuario === 'undefined' ||
      typeof usuario.senha === 'undefined'
    ) {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebeido não é do tipo esperado'));
    }

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retorno = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retorno);
    }

    //Faz a validação do usuário, comparando o recebido com o existente no banco
    const cadUsuario = new CadUsuarioDB();
    try {
      consoleLog(
        `Validando usuário ${usuario.usuario} e senha`,
        pVerbose.aviso,
      );

      const usuarioBD = await cadUsuario.find(usuario.usuario, connection);

      //Se não retornar nenhum existente, retonar um bad request
      if (usuarioBD.length === 0) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválidos.`));
      }

      //Se encontrar um usuário, mas a senha estiver nula ou undefined, retorna um bad request
      if (
        typeof usuarioBD[0].senha === 'undefined' ||
        usuarioBD[0].senha === null
      ) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválidos.`));
      }

      //Faz um comparativo entre a senha digitada e a senha cadastrada no banco
      const senhasConferem = await Criptografar.compararSenhas(
        usuario.senha,
        usuarioBD[0].senha,
      );

      //Se as senhas não conferirem, gera um bad request
      if (!senhasConferem) {
        return resp
          .status(400)
          .json(retornoPadrao(1, `Usuário ou senha inválidos`));
      }

      //Se as senhas conferirem, pega os dados do usuário para gerar um token de autenticação
      if (senhasConferem) {
        const dadosToken = await Login.prepararToken(usuarioBD[0], connection);

        const token = gerarToken(dadosToken);
        if (token === '') {
          return resp.status(400).json(retornoPadrao(1, `Erro ao gerar token`));
        }
        consoleLog(`Token gerado com sucesso.`, pVerbose.aviso);
        return resp.status(200).json({ token });
      }
      return resp.json(usuarioBD);
    } catch (error) {
      await connection.rollback();
      const retorno = ErrorGeneral.getErrorGeneral(
        'Erro ao autenticar usuário',
        error,
      );
      return resp.status(400).json(retorno);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async prepararToken(
    usuarioBD: iUsuario,
    connection: oracledb.Connection,
  ): Promise<Token> {
    const cadUsuario = new CadUsuarioDB();

    //Recebe os dados do usuário para gerar o token de autenticação
    if (
      typeof usuarioBD.usuario === 'undefined' ||
      usuarioBD.usuario === null
    ) {
      return {} as Token;
    }
    const usuarioNome = await cadUsuario.find(usuarioBD.usuario, connection);

    const dadosToken: Token = {
      cod_usuario: Number(usuarioNome[0].cod_usuario),
      usuario:
        typeof usuarioNome[0].usuario !== 'undefined'
          ? usuarioNome[0].usuario
          : '',
    };
    return dadosToken;
  }

  static async refreshToken(req: Request, resp: Response): Promise<Response> {
    const token = req.headers.authorization;
    const userIp = req.userIp?.ip ?? '';

    if (typeof token === 'undefined') {
      console.log(
        `Request sem token, cancelado refresh token - ip: ${userIp}`,
        1,
      );
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`),
        );
    }

    const dataToken = getDataToRefresh(token, userIp);
    if (!dataToken) {
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`),
        );
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retorno = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retorno);
    }

    try {
      console.log(`Validando usuário - RefreshToken ${dataToken.usuario}`, 0);
      const cadUsuario = new CadUsuarioDB();
      const usuarioBD = await cadUsuario.find(dataToken.usuario, connection);

      if (usuarioBD.length === 0) {
        console.log(
          `Usuário ${dataToken.usuario} não encontrado - ip: ${userIp}`,
          1,
        );
        return resp
          .status(400)
          .json(retornoPadrao(1, `Erro ao tentar atualizar token`));
      }

      const dadosToken = await Login.prepararToken(usuarioBD[0], connection);

      const tokenNovo = gerarToken(dadosToken);
      if (tokenNovo === '') {
        return resp.status(400).json(retornoPadrao(1, `Erro ao gerar token`));
      }

      console.log(`Token gerado com sucesso`, 0);
      return resp.status(200).json({ token: tokenNovo });
    } catch (error) {
      const resultErro = ErrorGeneral.getErrorGeneral(
        'Erro ao atualizar token',
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
