import { default as oracledb, default as OracleDB } from 'oracledb';
import { v4 as uuidv4 } from 'uuid';
import { ReturnDefault } from '../Interfaces';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import convertLowerCase from '../utils/convertLowerCase';
import CreateBinds from '../utils/createBinds';
import createSqlCampos from '../utils/createSqlCampos';
import { convertDate2String } from '../utils/dateNow';
import retornoPadrao from '../utils/retornoPadrao';
import { cadAgendamentoOut, iAgendamento } from './../model/Cad_agendamento';

export interface AgendamentoBindOut {
  cadAgendamentoOut: string;
}

export default class CadAgendamentoDB {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na biblioteca oracledb
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no oracledb
    consoleLog(`Erro ao buscar agendamento, rows = undefined`, pVerbose.erro);
    return new Error(`Erro ao buscar agendamento, rows = undefined`);
  }

  async insert(
    obj: iAgendamento,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    const agendamento_bd = {
      cod_agendamento: uuidv4(), //cod_agendamento gerado automaticamente
      visitante: obj.visitante,
      data: obj.data,
      hora: obj.hora,
      observacao: obj.observacao,
      status: obj.status,
      data_criacao: new Date(), //data_criacao gerada automaticamente
      usuario_criacao: obj.usuario_criacao,
    };

    //Cria uma nova data com o padrão recebido do frontend DD/MM/YYYY
    const new_data = convertDate2String(new Date(agendamento_bd.data));
    const [day, month, year] = new_data.split('/');
    const data = new Date(`${month}/${day}/${year}`);

    //Utiliza o createSqlCampos para montar o sql, passando os dados do objeto
    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        agendamento_bd,
        'visitantes_agendamento',
        'insert',
        'RETURNING cod_agendamento INTO :cadAgendamentoOut',
      );

      //Cria os binds para enviar os dados corretamente para o oracle
      const binds = CreateBinds.createBinds(agendamento_bd);
      binds.cadAgendamentoOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      //Exclui a data do bind anterior para criar um padrão exclusivo de data aceita pelo oracle
      delete binds.data;
      binds.data = {
        val: data,
        type: OracleDB.DATE,
      };

      delete binds.data_criacao;
      binds.data_criacao = {
        val: obj.data_criacao,
        type: OracleDB.DATE,
      };

      //Envia o sql e os binds para o oracle. Caso dê algum erro na construção dos binds, retorna um erro
      try {
        const result = await conn.execute<AgendamentoBindOut>(sql, binds);

        if (typeof result.outBinds === 'undefined') {
          consoleLog(
            `Erro ao inserir agendamento, rows = undefined`,
            pVerbose.erro,
          );
          return reject(
            retornoPadrao(1, `Erro ao inserir agendamento, rows = undefined`),
          );
        }
        const agendamentoGeralOutReturn = result.outBinds.cadAgendamentoOut;
        if (agendamentoGeralOutReturn.length <= 0) {
          // Se não retornou o cadAgendamentoOut não deu certo o insert
          consoleLog(`Erro ao inserir agendamento`, pVerbose.erro);
          return resolve(retornoPadrao(1, `Erro ao inserir agendamento`));
        }
        // Se retornou usuarioOut é porque inseriu
        consoleLog(
          `Agendamento Cód: ${agendamentoGeralOutReturn}, inserido com sucesso`,
          pVerbose.aviso,
        );
        return resolve(
          retornoPadrao(
            0,
            `Agendamento Cód: ${agendamentoGeralOutReturn}, inserido com sucesso`,
          ),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: iAgendamento,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    //Cria uma nova data com o padrão recebido do frontend DD/MM/YYYY
    const new_data = convertDate2String(new Date(obj.data));
    const [day, month, year] = new_data.split('/');
    const data = new Date(`${month}/${day}/${year}`);

    //Utiliza o createSqlCampos para montar o sql, passando os dados do objeto
    const sql = createSqlCampos(
      obj,
      'visitantes_agendamento',
      'update',
      'where cod_agendamento = :cod_agendamento RETURNING cod_agendamento INTO :cadAgendamentoOut',
    );

    //Cria os binds para enviar os dados corretamente para o oracle
    const binds = CreateBinds.createBinds(obj);
    binds.cadAgendamentoOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    //Exclui a data do bind anterior para criar um padrão exclusivo de data aceita pelo oracle
    delete binds.data;
    binds.data = {
      val: data,
      type: OracleDB.DATE,
    };

    //Envia o sql e os binds para o oracle. Caso dê algum erro na construção dos binds, retorna um erro
    try {
      const result = await conn.execute<AgendamentoBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const returnAgendamento = result.outBinds.cadAgendamentoOut;
      if (returnAgendamento.length <= 0) {
        consoleLog(
          `Não encontrado nenhum agendamento ${obj.cod_agendamento}`,
          pVerbose.erro,
        );
        return Promise.resolve(
          retornoPadrao(
            1,
            `Não encontrado nenhum agendamento ${obj.cod_agendamento}`,
          ),
        );
      }
      consoleLog(`Agendamento atualizado com sucesso`, pVerbose.aviso);
      return Promise.resolve(
        retornoPadrao(
          0,
          `Agendamento ${obj.cod_agendamento} atualizado com sucesso.`,
        ),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(conn: OracleDB.Connection): Promise<cadAgendamentoOut[]> {
    //Cria sql para exibir todos os dados da tabela visitantes_agendamento
    const sql = `SELECT * FROM visitantes_agendamento
                 ORDER BY cod_agendamento asc`;

    //Envia o sql para o oracle esperando o retorno de um array de dados.
    const result = await conn.execute<cadAgendamentoOut>(sql, [], {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });

    //Se retornar undefined, rejeita a request
    const res_agenda = result.rows;
    if (typeof res_agenda === 'undefined') {
      return Promise.reject(this.rowsUndefined());
    }
    const agenda_lower = convertLowerCase(res_agenda); //Faz a conversão para lowerCase para assim ignorar se tiver algum upperCase

    //Converte a data do oracle para exibir no padrão DD/MM/YYYY
    const agenda = agenda_lower.map(agenda => {
      const item_agenda = agenda;
      item_agenda.data_criacao = convertDate2String(
        new Date(agenda.data_criacao),
      );
      item_agenda.data = convertDate2String(new Date(agenda.data));

      return item_agenda;
    });
    return Promise.resolve(agenda);
  }

  async find(
    cod_agendamento: string,
    conn: oracledb.Connection,
  ): Promise<cadAgendamentoOut[]> {
    //Cria sql para exibir um agendamento especifico passando o cod_agendamento como parametro
    const sql = `SELECT * FROM visitantes_agendamento
                WHERE cod_agendamento = :cod_agendamento`;

    //Envia o sql e o cod_agendamento para o oracle fazer a consulta
    try {
      const result = await conn.execute<cadAgendamentoOut>(
        sql,
        [cod_agendamento],
        {
          outFormat: OracleDB.OUT_FORMAT_OBJECT,
        },
      );

      //Se retornar undefined, rejeita a request
      const res_agenda = result.rows;
      if (typeof res_agenda === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const agenda_lower = convertLowerCase(res_agenda); //Faz a conversão para lowerCase para assim ignorar se tiver algum upperCase

      //Converte a data do oracle para exibir no padrão DD/MM/YYYY
      const agendamento = agenda_lower.map(agenda => {
        const item_agenda = agenda;
        item_agenda.data_criacao = convertDate2String(
          new Date(agenda.data_criacao),
        );
        item_agenda.data = convertDate2String(new Date(agenda.data));

        return item_agenda;
      });
      return Promise.resolve(agendamento);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete(
    cod_agendamento: string,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    return new Promise(async (resolve, reject) => {
      consoleLog(`Tentando deletar o agendamento`, pVerbose.aviso);
      let resposta = {} as ReturnDefault;

      //cria sql para deletar passando o cod_agendamento como parametro
      const sql =
        'DELETE FROM visitantes_agendamento WHERE cod_agendamento = :cod_agendamento';

      //Envia o sql e o cod_agendamento para o oracle realizar o delete
      try {
        const result = await conn.execute(sql, [cod_agendamento]);

        //Se retornar undefined, o delete não deu certo
        const deletedResult = result.rowsAffected;
        if (typeof deletedResult === 'undefined') {
          consoleLog(
            `Erro ao deletar agendamento, result = undefined`,
            pVerbose.erro,
          );
          return reject(
            retornoPadrao(1, `Erro ao deletar agendamento, result = undefined`),
          );
        }
        if (deletedResult <= 0) {
          // Se retornar 0 é porque não deletou nenhuma linha.
          resposta = retornoPadrao(
            0,
            `Não encontrado agendamento correspondente para deletar.`,
          );
        } else {
          // Se retornar 1 ou mais em deletedResult é porque deletou alguma coisa
          resposta = retornoPadrao(0, `Agendamento deletado com sucesso.`);
        }
        consoleLog(resposta.retorno.mensagem, pVerbose.aviso);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }
}
