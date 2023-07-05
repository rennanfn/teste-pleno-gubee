import { default as OracleDB, default as oracledb } from 'oracledb';
import { v4 as uuidv4 } from 'uuid';
import { ReturnDefault } from '../Interfaces';
import { iUsuario } from '../model/Cad_usuario';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import convertLowerCase from '../utils/convertLowerCase';
import CreateBinds from '../utils/createBinds';
import createSqlCampos from '../utils/createSqlCampos';
import retornoPadrao from '../utils/retornoPadrao';

interface UsuarioBindOut {
  cadUsuarioOut: string;
}

export default class CadUsuarioDB {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na bibliteca oracledb
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no oracledb
    consoleLog(`Erro ao buscar usuário, rows = undefined`, pVerbose.erro);
    return new Error(`Erro ao buscar usuário, rows = undefined`);
  }

  async insert(
    obj: iUsuario,
    conn: OracleDB.Connection,
  ): Promise<ReturnDefault> {
    const usuario_db = {
      cod_usuario: uuidv4(), //cod_usuario gerado automaticamente
      usuario: obj.usuario,
      senha: obj.senha,
    };

    //Utiliza o createSqlCampos para montar o sql, passando os dados do objeto
    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        usuario_db,
        'visitantes_usuario',
        'insert',
        'RETURNING cod_usuario INTO :cadUsuarioOut',
      );

      //Cria os binds para enviar os dados corretamente para o oracle
      const binds = CreateBinds.createBinds(usuario_db);
      binds.cadUsuarioOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      //Envia o sql e os binds para o oracle. Caso dê algum erro na construção dos binds, retorna um erro
      try {
        const result = await conn.execute<UsuarioBindOut>(sql, binds);

        if (typeof result.outBinds === 'undefined') {
          consoleLog(
            `Erro ao inserir usuário, rows = undefined`,
            pVerbose.erro,
          );
          return reject(
            retornoPadrao(1, `Erro ao inserir usuário, rows = undefined`),
          );
        }
        const usuarioGeralOutReturn = result.outBinds.cadUsuarioOut;
        if (usuarioGeralOutReturn.length <= 0) {
          // Se não retornou o cadUsuarioOut não deu certo o insert
          consoleLog(`Erro ao inserir usuário ${obj.usuario}`, pVerbose.erro);
          return resolve(
            retornoPadrao(1, `Erro ao inserir usuário ${obj.usuario}`),
          );
        }
        // Se retornou usuarioOut é porque inseriu
        consoleLog(
          `Usuário Cód: ${usuarioGeralOutReturn} - Login: ${obj.usuario}, inserido com sucesso`,
          pVerbose.aviso,
        );
        return resolve(
          retornoPadrao(
            0,
            `Usuário Cód: ${usuarioGeralOutReturn} - Login: ${obj.usuario}, inserido com sucesso`,
          ),
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: iUsuario,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    //Utiliza o createSqlCampos para montar o sql, passando os dados do objeto
    const sql = createSqlCampos(
      obj,
      'visitantes_usuario',
      'update',
      'where cod_usuario= :cod_usuario RETURNING cod_usuario INTO :cadUsuarioOut',
    );

    //Cria os binds para enviar os dados corretamente para o oracle
    const binds = CreateBinds.createBinds(obj);
    binds.cadUsuarioOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    //Envia o sql e os binds para o oracle. Caso dê algum erro na construção dos binds, retorna um erro
    try {
      const result = await conn.execute<UsuarioBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }
      const returnUsuario = result.outBinds.cadUsuarioOut;
      if (returnUsuario.length <= 0) {
        consoleLog(
          `Não encontrado nenhum Usuario ${obj.cod_usuario}`,
          pVerbose.erro,
        );
        return Promise.resolve(
          retornoPadrao(1, `Não encontrado nenhum usuário ${obj.cod_usuario}`),
        );
      }
      consoleLog(
        `Usuário ${obj.cod_usuario} atualizado com sucesso`,
        pVerbose.aviso,
      );
      return Promise.resolve(
        retornoPadrao(0, `Usuário ${obj.cod_usuario} atualizado com sucesso.`),
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async find(usuario: string, conn: oracledb.Connection): Promise<iUsuario[]> {
    //Cria sql para exibir um agendamento especifico passando o cod_agendamento como parametro
    const sql = `SELECT * FROM visitantes_usuario where usuario = :usuario`;

    //Envia o sql e o cod_agendamento para o oracle fazer a consulta
    try {
      const result = await conn.execute<Usuario>(sql, [usuario], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      const usuarios = result.rows;
      if (typeof usuarios === 'undefined') {
        return Promise.reject(this.rowsUndefined());
      }

      return Promise.resolve(convertLowerCase(usuarios)); //Faz a conversão para lowerCase para assim ignorar se tiver algum upperCase
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete(
    cod_usuario: string,
    conn: oracledb.Connection,
  ): Promise<ReturnDefault> {
    return new Promise(async (resolve, reject) => {
      consoleLog(`Tentando deletar o Usuario ${cod_usuario}`, pVerbose.aviso);
      let resposta = {} as ReturnDefault;

      //cria sql para deletar passando o cod_agendamento como parametro
      const sql =
        'DELETE FROM visitantes_usuario WHERE cod_usuario = :cod_usuario';

      //Envia o sql e o cod_agendamento para o oracle realizar o delete
      try {
        const result = await conn.execute(sql, [cod_usuario]);

        //Se retornar undefined, o delete não deu certo
        const deletedResult = result.rowsAffected;
        if (typeof deletedResult === 'undefined') {
          console.log(`Erro ao deletar, result = undefined`, 1);
          return reject(
            retornoPadrao(1, `Erro ao deletar, result = undefined`),
          );
        }
        if (deletedResult <= 0) {
          // Se retornar 0 é porque não deletou nenhuma linha.
          resposta = retornoPadrao(
            0,
            `Não encontrado nenhum nenhum usuario para deletar.`,
          );
        } else {
          // Se retornar 1 ou mais em deletedResult é porque deletou alguma coisa
          resposta = retornoPadrao(0, `Usuario deletado com sucesso.`);
        }
        consoleLog(resposta.retorno.mensagem, pVerbose.aviso);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }
}
