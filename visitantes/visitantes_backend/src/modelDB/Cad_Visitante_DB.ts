import { default as OracleDB, default as oracledb } from 'oracledb';
import { v4 as uuidv4 } from 'uuid';
import { ReturnDefault } from '../Interfaces';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import convertLowerCase from '../utils/convertLowerCase';
import CreateBinds from '../utils/createBinds';
import createSqlCampos from '../utils/createSqlCampos';
import { convertDate2String } from '../utils/dateNow';
import retornoPadrao from '../utils/retornoPadrao';
import { CadVisitanteOut, iVisitante } from './../model/Cad_visitante';

interface VisitanteBindOut {
  cadVisitanteOut: string;
}

export default class CadVisitanteDB {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na bibliteca oracledb
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no oracledb
    consoleLog(`Erro ao buscar visitante, rows = undefined`, pVerbose.erro);
    return new Error(`Erro ao buscar visitante, rows = undefined`);
  }

  async insert(
    obj: iVisitante,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    const visitante_bd = {
      cod_visitante: uuidv4(), //cod_visitante gerado automaticamente
      nome: obj.nome,
      rg: obj.rg,
      empresa: obj.empresa,
      foto: obj.foto,
      data_criacao: new Date(), //data_criacao gerada automaticamente
      usuario_criacao: obj.usuario_criacao,
    };

    //Utiliza o createSqlCampos para montar o sql, passando os dados do objeto
    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        visitante_bd,
        'visitantes_cadastro',
        'insert',
        'RETURNING cod_visitante INTO :cadVisitanteOut',
      );

      //Cria os binds para enviar os dados corretamente para o oracle
      const binds = CreateBinds.createBinds(visitante_bd);
      binds.cadVisitanteOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      //Exclui a data do bind anterior para criar um padrão exclusivo de data aceita pelo oracle
      delete binds.data_criacao;
      binds.data_criacao = {
        val: obj.data_criacao,
        type: OracleDB.DATE,
      };

      //Exclui a foto do bind anterior para criar um padrão exclusivo de foto (imagem) aceita pelo oracle
      delete binds.foto;
      binds.foto = {
        val: obj.foto,
        type: OracleDB.BLOB,
      };

      //Envia o sql e os binds para o oracle. Caso dê algum erro na construção dos binds, retorna um erro
      try {
        const result = await conn.execute<VisitanteBindOut>(sql, binds);

        if (typeof result.outBinds === 'undefined') {
          consoleLog(
            `Erro ao inserir visitante, rows = undefined`,
            pVerbose.erro,
          );
          return reject(
            retornoPadrao(1, `Erro ao inserir visitante, rows = undefined`),
          );
        }
        const visitanteGeralOutReturn = result.outBinds.cadVisitanteOut;
        if (visitanteGeralOutReturn.length <= 0) {
          // Se não retornou o cadUsuarioOut não deu certo o insert
          consoleLog(`Erro ao inserir visitante`, pVerbose.erro);
          return resolve(retornoPadrao(1, `Erro ao inserir visitante`));
        }
        // Se retornou usuarioOut é porque inseriu
        consoleLog(
          `Visitante Cód: ${visitanteGeralOutReturn} - Nome: ${obj.nome}, inserido com sucesso`,
          pVerbose.aviso,
        );
        return resolve(
          retornoPadrao(
            0,
            `Visitante Cód: ${visitanteGeralOutReturn} - Nome: ${obj.nome}, inserido com sucesso`,
          ),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: iVisitante,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    //Utiliza o createSqlCampos para montar o sql, passando os dados do objeto
    const sql = createSqlCampos(
      obj,
      'visitantes_cadastro',
      'update',
      'where cod_visitante = :cod_visitante RETURNING cod_visitante INTO :cadVisitanteOut',
    );

    //Cria os binds para enviar os dados corretamente para o oracle
    const binds = CreateBinds.createBinds(obj);
    binds.cadVisitanteOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    //Exclui a foto do bind anterior para criar um padrão exclusivo de foto (imagem) aceita pelo oracle
    delete binds.foto;
    binds.foto = {
      val: obj.foto,
      type: OracleDB.BLOB,
    };

    try {
      const result = await conn.execute<VisitanteBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const returnVisitante = result.outBinds.cadVisitanteOut;
      if (returnVisitante.length <= 0) {
        consoleLog(`Não encontrado nenhum visitante`, pVerbose.erro);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado nenhum visitante`),
        );
      }
      consoleLog(`Visitante atualizado com sucesso`, pVerbose.aviso);
      return Promise.resolve(
        retornoPadrao(0, `Visitante atualizado com sucesso.`),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(conn: OracleDB.Connection): Promise<CadVisitanteOut[]> {
    //Cria sql para exibir todos os dados da tabela visitantes_cadastro
    const sql = `SELECT * FROM visitantes_cadastro
                 ORDER BY cod_visitante asc`;

    //Envia o sql para o oracle esperando o retorno de um array de dados.
    const result = await conn.execute<CadVisitanteOut>(sql, [], {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });

    //Se retornar undefined, rejeita a request
    const res_visita = result.rows;
    if (typeof res_visita === 'undefined') {
      return Promise.reject(this.rowsUndefined());
    }
    const visita_lower = convertLowerCase(res_visita); //Faz a conversão para lowerCase para assim ignorar se tiver algum upperCase

    //Converte a data do oracle para exibir no padrão DD/MM/YYYY
    const visitas = visita_lower.map(visita => {
      const item_visita = visita;
      item_visita.data_criacao = convertDate2String(
        new Date(visita.data_criacao),
      );
      return item_visita;
    });
    return Promise.resolve(visitas);
  }

  async find(
    cod_visitante: string,
    conn: oracledb.Connection,
  ): Promise<CadVisitanteOut[]> {
    //Cria sql para exibir um agendamento especifico passando o cod_agendamento como parametro
    const sql = `SELECT * FROM visitantes_cadastro
                WHERE cod_visitante = :cod_visitante`;

    //Envia o sql e o cod_agendamento para o oracle fazer a consulta
    try {
      const result = await conn.execute<CadVisitanteOut>(sql, [cod_visitante], {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      });

      //Se retornar undefined, rejeita a request
      const res_visita = result.rows;
      if (typeof res_visita === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const visita_lower = convertLowerCase(res_visita); //Faz a conversão para lowerCase para assim ignorar se tiver algum upperCase

      //Converte a data do oracle para exibir no padrão DD/MM/YYYY
      const visitantes = visita_lower.map(visita => {
        const item_visita = visita;
        item_visita.data_criacao = convertDate2String(
          new Date(visita.data_criacao),
        );
        return item_visita;
      });
      return Promise.resolve(visitantes);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
