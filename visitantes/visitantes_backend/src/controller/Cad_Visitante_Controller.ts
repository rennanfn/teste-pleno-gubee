import { Request, Response } from 'express';
import { BdOracle } from '../model/BdOracle';
import { ErrorGeneral } from '../model/ErrorGeneral';
import CadVisitanteDB from '../modelDB/Cad_Visitante_DB';
import retornoPadrao from '../utils/retornoPadrao';
import { iVisitante, visitanteSchema } from './../model/Cad_visitante';

export default class VisitanteController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    //Recebe os dados e faz a validação pelo Zod
    let visitante: iVisitante;
    try {
      visitante = visitanteSchema.parse(req.body);
    } catch (error) {
      const retornar = ErrorGeneral.getErrorGeneral(
        'Objeto recebido não é do tipo esperado',
        error,
      );
      return resp.status(400).json(retornar);
    }

    //Se o visitante for udenfined, gera um Bad Request
    if (typeof visitante === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retor = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retor);
    }

    //Se a conexão com oracle for válida e os dados também, passa os dados para a classe DB enviar para o oracle
    //Se houver algum erro, gera um rollback para desfazer qualquer alteração que tenha sido feita
    const cadVisitanteDB = new CadVisitanteDB();
    try {
      const retorno = await cadVisitanteDB.insert(visitante, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao inserir visitante ${visitante.cod_visitante}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    //Recebe os dados e faz a validação pelo Zod
    let visitante: iVisitante;
    try {
      visitante = visitanteSchema.parse(req.body);
    } catch (error) {
      const retornar = ErrorGeneral.getErrorGeneral(
        'Objeto recebido não é do tipo esperado',
        error,
      );
      return resp.status(400).json(retornar);
    }

    //Se o visitante for udenfined, gera um Bad Request
    if (typeof visitante === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retor = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(retor);
    }

    //Se a conexão com oracle for válida e os dados também, passa os dados para a classe DB enviar para o oracle
    //Se houver algum erro, gera um rollback para desfazer qualquer alteração que tenha sido feita
    const cadVisitanteDB = new CadVisitanteDB();
    try {
      const retorno = await cadVisitanteDB.update(visitante, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao inserir usuário ${visitante.cod_visitante}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async show(req: Request, resp: Response): Promise<Response> {
    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erroG = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(erroG);
    }

    //Neste caso não é passado nenhum parametro, apenas a conexão criada para o oracle retornar os dados cadastrados na tabela
    const CadVisitante = new CadVisitanteDB();
    try {
      const retorno = await CadVisitante.show(connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async find(req: Request, resp: Response): Promise<Response> {
    //Para este caso, passa o cod_visitante como parametro para fazer uma busca especifica
    const { cod_visitante } = req.params;

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erroG = ErrorGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o oracle',
        error,
      );
      return resp.status(400).json(erroG);
    }

    //Se a conexão com oracle for válida e o cod_agendamento também, passa o valor para a classe DB enviar para o oracle
    const CadVisitante = new CadVisitanteDB();
    try {
      const retorno = await CadVisitante.find(cod_visitante, connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErrorGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
