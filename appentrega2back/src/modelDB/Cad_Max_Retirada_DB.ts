/* eslint-disable object-shorthand */
import CadMaxRetirada, {
  CadMaxRetiradaOut,
  MaxRetiradaInterface,
  MaxRetiradaZ,
} from "./../model/Cad_Max_Retirada";
/* eslint-disable camelcase */
/* eslint-disable no-async-promise-executor */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import oracledb from "oracledb";
import { ReturnDefault } from "../Interfaces";
import convertLowerCase from "../utils/convertLowerCase";
import CreateBinds from "../utils/createBinds";
import createSqlCampos from "../utils/createSqlCampos";
import { convertDate2String, convertDate2StringMonth } from "../utils/dateNow";
import retornoPadrao from "../utils/retornoPadrao";

interface MaxRetiradaBindOut extends MaxRetiradaInterface {
  cadMaxRetiradaOut: string;
}

export default class CadMaxRetiradaDB extends CadMaxRetirada {
  private rowsUndefined(): Error {
    console.log(`Erro ao buscar produto, rows = undefined`, 1);
    return new Error(`Erro ao buscar produto, rows = undefined`);
  }

  async insert(
    obj: MaxRetiradaZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    const new_data = convertDate2String(
      new Date(obj.periodo_liberado_retirada)
    );
    const [day, month, year] = new_data.split("/");
    const data = new Date(`${month}/${day}/${year}`);

    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        obj,
        "app_entrega_max_retirada",
        "insert",
        "RETURNING matricula INTO :cadMaxRetiradaOut"
      );
      const binds = CreateBinds.createBinds(obj);
      binds.cadMaxRetiradaOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      delete binds.data;
      binds.periodo_liberado_retirada = {
        val: data,
        type: oracledb.DATE,
      };

      delete binds.criado_em;
      binds.criado_em = {
        val: obj.criado_em,
        type: oracledb.DATE,
      };

      const connection = conn;
      try {
        const result = await connection.execute<MaxRetiradaBindOut>(sql, binds);

        if (typeof result.outBinds === "undefined") {
          console.log(
            `Erro ao inserir Máx. Retirada do colaborador ${obj.matricula}, rows = undefined`,
            1
          );
          return reject(
            retornoPadrao(1, `Erro ao inserir Máx. Retirada, rows = undefined`)
          );
        }
        const maxRetiradaOutReturn = result.outBinds.cadMaxRetiradaOut;
        if (maxRetiradaOutReturn.length <= 0) {
          console.log(
            `Erro ao inserir Máx. Retirada do colaborador ${obj.matricula}`,
            1
          );
          return resolve(
            retornoPadrao(
              1,
              `Erro ao inserir Máx. Retirada do colaborador ${obj.matricula}`
            )
          );
        }
        console.log(
          `Máx. Retirada do colaborador ${obj.matricula}, inserida com sucesso!`,
          0
        );
        return resolve(
          retornoPadrao(
            0,
            `Máx. Retirada do colaborador ${obj.matricula}, inserida com sucesso!`
          )
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: MaxRetiradaZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    const new_data = convertDate2String(
      new Date(obj.periodo_liberado_retirada)
    );
    const [day, month, year] = new_data.split("/");
    const data = new Date(`${month}/${day}/${year}`);

    console.log(
      `Tentando atualizar a máx. retirada do colaborador ${obj.matricula}`,
      0
    );
    const sql = createSqlCampos(
      obj,
      "app_entrega_max_retirada",
      "update",
      "WHERE matricula = :matricula RETURNING matricula INTO :cadMaxRetiradaOut"
    );

    const binds = CreateBinds.createBinds(obj);
    binds.cadMaxRetiradaOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    delete binds.data;
    binds.periodo_liberado_retirada = {
      val: data,
      type: oracledb.DATE,
    };

    const connection = conn;
    try {
      const result = await connection.execute<MaxRetiradaBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      const returnMaxRetirada = result.outBinds.cadMaxRetiradaOut;
      if (returnMaxRetirada.length <= 0) {
        console.log(`Colaborador ${obj.matricula} não encontrado`, 1);
        return Promise.resolve(
          retornoPadrao(0, `Colaborador ${obj.matricula} não encontrado`)
        );
      }
      console.log(
        `Máx. Retirada do colaborador ${obj.matricula} atualizada com sucesso!`,
        0
      );
      return Promise.resolve(
        retornoPadrao(
          0,
          `Máx. Retirada do colaborador ${obj.matricula} atualizada com sucesso!`
        )
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(conn: oracledb.Connection): Promise<CadMaxRetiradaOut[]> {
    const sql = `SELECT max.matricula,
                 col.nome_funcio,
                 max.produto_id,
                 prod.descricao,
                 max.criado_em,
                 max.qtd_max_retirada,
                 max.periodo_liberado_retirada
                 FROM app_entrega_max_retirada max
                 LEFT JOIN senior.cdc_info_colaboradores_view col on col.matricula = max.matricula
                 LEFT JOIN app_entrega_produto prod on prod.id = max.produto_id ORDER BY max.matricula asc`;

    const result = await conn.execute<CadMaxRetiradaOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const maxRetirada = result.rows;

    if (typeof maxRetirada === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const maxRetirada_lower = convertLowerCase(maxRetirada);
    const cadMaxRetirada = maxRetirada_lower.map((maxRetirada) => {
      const item_maxRetirada = maxRetirada;

      item_maxRetirada.criado_em = convertDate2String(
        new Date(maxRetirada.criado_em)
      );

      item_maxRetirada.periodo_liberado_retirada = convertDate2StringMonth(
        new Date(maxRetirada.periodo_liberado_retirada)
      );

      return item_maxRetirada;
    });
    return Promise.resolve(cadMaxRetirada);
  }

  async find(
    matricula: number,
    conn: oracledb.Connection
  ): Promise<CadMaxRetiradaOut[]> {
    // const sql = `SELECT * FROM app_entrega_max_retirada WHERE matricula = :matricula ORDER BY matricula asc`;
    const sql = `SELECT max.matricula,
                 col.nome_funcio,
                 max.produto_id,
                 prod.descricao,
                 max.criado_em,
                 max.qtd_max_retirada,
                 max.periodo_liberado_retirada
                 FROM app_entrega_max_retirada max
                 LEFT JOIN senior.cdc_info_colaboradores_view col on col.matricula = max.matricula
                 LEFT JOIN app_entrega_produto prod on prod.id = max.produto_id
                 WHERE max.matricula = :matricula ORDER BY max.matricula asc`;

    const result = await conn.execute<CadMaxRetiradaOut>(sql, [matricula], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const maxRetirada = result.rows;
    if (typeof maxRetirada === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const maxRetirada_lower = convertLowerCase(maxRetirada);
    const cadMaxRetirada = maxRetirada_lower.map((maxRetirada) => {
      const item_maxRetirada = maxRetirada;

      item_maxRetirada.criado_em = convertDate2String(
        new Date(maxRetirada.criado_em)
      );

      item_maxRetirada.periodo_liberado_retirada = convertDate2StringMonth(
        new Date(maxRetirada.periodo_liberado_retirada)
      );
      return item_maxRetirada;
    });
    return Promise.resolve(cadMaxRetirada);
  }

  async verificaMaxRetirada(
    obj: MaxRetiradaInterface,
    conn: oracledb.Connection
  ): Promise<CadMaxRetiradaOut[]> {
    const sql = `SELECT * FROM app_entrega_max_retirada WHERE matricula = :matricula AND produto_id = :produto_id`;
    const result = await conn.execute<CadMaxRetiradaOut>(
      sql,
      [obj.matricula, obj.produto_id],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );
    const res_maxRetirada = result.rows;
    if (typeof res_maxRetirada === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    return Promise.resolve(res_maxRetirada);
  }

  async showColaborador(
    conn: oracledb.Connection
  ): Promise<CadMaxRetiradaOut[]> {
    const sql = `SELECT matricula,
                 nome_funcio,
                 desc_situacao
                 FROM senior.cdc_info_colaboradores_view
                 WHERE desc_situacao != 'Demitido'
                 ORDER BY matricula asc`;
    const result = await conn.execute<CadMaxRetiradaOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const res_maxRetirada = result.rows;
    if (typeof res_maxRetirada === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }

    return res_maxRetirada;
  }

  async findColaborador(
    matricula: number,
    conn: oracledb.Connection
  ): Promise<CadMaxRetiradaOut[]> {
    const sql = `SELECT matricula,
                 nome_funcio,
                 desc_situacao
                 FROM senior.cdc_info_colaboradores_view
                 WHERE matricula = :matricula
                 AND desc_situacao != 'Demitido'
                 ORDER BY matricula asc`;
    const result = await conn.execute<CadMaxRetiradaOut>(sql, [matricula], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const res_maxRetirada = result.rows;
    if (typeof res_maxRetirada === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    return Promise.resolve(res_maxRetirada);
  }

  async delete(
    obj: MaxRetiradaInterface,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    return new Promise(async (resolve, reject) => {
      console.log(
        `Tentando deletar retirada do colaborador ${obj.matricula}`,
        0
      );
      let resposta = {} as ReturnDefault;
      const sql =
        "DELETE FROM app_entrega_max_retirada WHERE matricula = :matricula AND produto_id = :produto_id";
      const connection = conn;
      try {
        const result = await connection.execute(sql, [
          obj.matricula,
          obj.produto_id,
        ]);
        const deleteResult = result.rowsAffected;
        if (typeof deleteResult === "undefined") {
          console.log(
            `Erro ao deletar retirada do colaborador ${obj.matricula}, result = undefined`,
            1
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao deletar retirada do colaborador ${obj.matricula}, result = undefined`
            )
          );
        }
        if (deleteResult <= 0) {
          resposta = retornoPadrao(
            0,
            `Não foi encontrado nenhuma retirada para o colaborador ${obj.matricula} para deletar`
          );
        } else {
          resposta = retornoPadrao(
            0,
            `Retirada do colaborador ${obj.matricula} deletada com sucesso!`
          );
        }
        console.log(resposta.retorno.mensagem, 0);
        return resolve(resposta);
      } catch (error) {
        return reject(error);
      }
    });
  }
}
