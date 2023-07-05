import CadOperador, {
  CadOperadorOut,
  OperadorInterface,
  OperadorZ,
} from "./../model/Cad_Operador";
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable no-async-promise-executor */
/* eslint-disable prettier/prettier */
import oracledb from "oracledb";
import { v4 as uuidv4 } from "uuid";
import { ReturnDefault } from "../Interfaces";
import convertLowerCase from "../utils/convertLowerCase";
import CreateBinds from "../utils/createBinds";
import createSqlCampos from "../utils/createSqlCampos";
import retornoPadrao from "../utils/retornoPadrao";
import { convertDate2String } from "../utils/dateNow";

interface OperadorBindOut extends OperadorInterface {
  cadOperadorOut: string;
}

export default class CadOperadorDB extends CadOperador {
  private rowsUndefined(): Error {
    console.log(`Erro ao buscar operador, rows = undefined`, 1);
    return new Error(`Erro ao buscar operador, rows = undefined`);
  }

  async insert(
    obj: OperadorZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    const resumo: OperadorZ = {
      id: uuidv4(),
      nome: obj.nome,
      login: obj.login,
      senha: obj.senha,
      criado_em: obj.criado_em,
      desativado_em: obj.desativado_em,
    };

    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        resumo,
        "app_entrega_operador",
        "insert",
        "RETURNING id INTO :cadOperadorOut"
      );
      const binds = CreateBinds.createBinds(resumo);
      binds.cadOperadorOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      delete binds.criado_em;
      binds.criado_em = {
        val: resumo.criado_em,
        type: oracledb.DATE,
      };

      const connection = conn;
      try {
        const result = await connection.execute<OperadorBindOut>(sql, binds);

        if (typeof result.outBinds === "undefined") {
          console.log(
            `Erro ao inserir operador: ${obj.login}, rows = undefined`,
            1
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir operador: ${obj.login}, rows = undefined`
            )
          );
        }
        const operadorGeralOutReturn = result.outBinds.cadOperadorOut;
        if (operadorGeralOutReturn.length <= 0) {
          // Se não retornou o cadOperadorOut não deu certo o insert
          console.log(`Erro ao inserir operador: ${obj.login}`, 1);
          return resolve(
            retornoPadrao(1, `Erro ao inserir operador: ${obj.login}`)
          );
        }
        // Se retornou operadorOut é porque inseriu
        console.log(`Operador: ${obj.login}, inserido com sucesso!`, 0);
        return resolve(
          retornoPadrao(0, `Operador: ${obj.login}, inserido com sucesso!`)
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: OperadorInterface,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    console.log(`Tentando atualizar operador ${obj.id}`, 0);
    const sql = createSqlCampos(
      obj,
      "app_entrega_operador",
      "update",
      "where id = :id RETURNING id INTO :cadOperadorOut"
    );

    const binds = CreateBinds.createBinds(obj);
    binds.cadOperadorOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    const connection = conn;
    try {
      const result = await connection.execute<OperadorBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      const returnOperador = result.outBinds.cadOperadorOut;
      if (returnOperador.length <= 0) {
        console.log(`Não encontrado operador ${obj.id}`, 1);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado operador ${obj.id}`)
        );
      }
      console.log(`Operador ${obj.id} atualizado com sucesso!`, 0);
      return Promise.resolve(
        retornoPadrao(0, `Operador ${obj.id} atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async patch(
    obj: OperadorInterface,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    console.log(`Tentando atualizar operador ${obj.id}`, 0);

    const sql = createSqlCampos(
      obj,
      "app_entrega_operador",
      "update",
      "where id = :id RETURNING id INTO :cadOperadorOut"
    );

    const binds = CreateBinds.createBinds(obj);
    binds.cadOperadorOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    delete binds.desativado_em;
    binds.desativado_em = {
      val: obj.desativado_em,
      type: oracledb.DATE,
    };

    const connection = conn;
    try {
      const result = await connection.execute<OperadorBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      const returnOperador = result.outBinds.cadOperadorOut;
      if (returnOperador.length <= 0) {
        console.log(`Não encontrado operador ${obj.id}`, 1);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado operador ${obj.id}`)
        );
      }
      console.log(`Operador ${obj.id} atualizado com sucesso!`, 0);
      return Promise.resolve(
        retornoPadrao(0, `Operador ${obj.id} atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(conn: oracledb.Connection): Promise<CadOperadorOut[]> {
    const sql = `SELECT id, nome, login, criado_em, desativado_em FROM app_entrega_operador ORDER BY id asc`;
    const result = await conn.execute<CadOperadorOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const operadores = result.rows;

    if (typeof operadores === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const operador_lower = convertLowerCase(operadores);
    const cadOperador = operador_lower.map((operador) => {
      const item_operador = operador;
      item_operador.criado_em = convertDate2String(
        new Date(operador.criado_em)
      );
      if (operador.desativado_em !== null) {
        item_operador.desativado_em = convertDate2String(
          new Date(operador.desativado_em)
        );
      }
      return item_operador;
    });
    return Promise.resolve(cadOperador);
  }

  async find(id: string, conn: oracledb.Connection): Promise<CadOperadorOut[]> {
    // return new Promise(async (resolve, reject) => {
    const sql = `SELECT id, nome, login, criado_em, desativado_em FROM app_entrega_operador WHERE id = :id ORDER BY id asc`;
    // try {
    const result = await conn.execute<CadOperadorOut>(sql, [id], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const operadores = result.rows;
    if (typeof operadores === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const operador_lower = convertLowerCase(operadores);
    const cadOperador = operador_lower.map((operador) => {
      const item_operador = operador;
      item_operador.criado_em = convertDate2String(
        new Date(operador.criado_em)
      );
      if (operador.desativado_em !== null) {
        item_operador.desativado_em = convertDate2String(
          new Date(operador.desativado_em)
        );
      }
      return item_operador;
    });
    return Promise.resolve(cadOperador);
    // } catch (error) {
    //  return reject(error);
  }
  // });

  async findLogin(
    id: string,
    conn: oracledb.Connection
  ): Promise<OperadorInterface[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT * FROM app_entrega_operador WHERE login = :login`;

      try {
        const result = await conn.execute<OperadorInterface>(sql, [id], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });
        const operadores = result.rows;
        if (typeof operadores === "undefined") {
          console.log(`Erro ao buscar o operador ${id}, rows = undefined`, 1);
          return reject(
            retornoPadrao(1, `Erro ao buscar operador ${id}, rows = undefined`)
          );
        }
        return resolve(convertLowerCase(operadores));
      } catch (error) {
        return reject(error);
      }
    });
  }

  async findPatch(
    id: string,
    conn: oracledb.Connection
  ): Promise<OperadorInterface[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT id, desativado_em FROM app_entrega_operador WHERE id = :id`;

      try {
        const result = await conn.execute<OperadorInterface>(sql, [id], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });
        const operadores = result.rows;
        if (typeof operadores === "undefined") {
          console.log(`Erro ao buscar o operador ${id}, rows = undefined`, 1);
          return reject(
            retornoPadrao(1, `Erro ao buscar operador ${id}, rows = undefined`)
          );
        }
        return resolve(convertLowerCase(operadores));
      } catch (error) {
        return reject(error);
      }
    });
  }
}
