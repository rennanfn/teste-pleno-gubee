/* eslint-disable camelcase */
import CadPeriodicidade, {
  CadPeriodicidadeOut,
  PeriodicidadeInterface,
  PeriodicidadeZ,
} from "./../model/Cad_Periodicidade";
/* eslint-disable no-async-promise-executor */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import oracledb from "oracledb";
import { v4 as uuidv4 } from "uuid";
import { ReturnDefault } from "../Interfaces";
import CreateBinds from "../utils/createBinds";
import createSqlCampos from "../utils/createSqlCampos";
import retornoPadrao from "../utils/retornoPadrao";
import convertLowerCase from "../utils/convertLowerCase";
import { convertDate2String } from "../utils/dateNow";

interface PeriodicidadeBindOut extends PeriodicidadeInterface {
  cadPeriodicidadeOut: string;
}

export default class CadPeriodicidadeDB extends CadPeriodicidade {
  private rowsUndefined(): Error {
    console.log(`Erro ao buscar período, rows = undefined`, 1);
    return new Error(`Erro ao buscar período, rows = undefined`);
  }

  async insert(
    obj: PeriodicidadeZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    const resumo: PeriodicidadeZ = {
      id: uuidv4(),
      descricao: obj.descricao,
      qtd_dias_periodo: obj.qtd_dias_periodo,
      criado_em: obj.criado_em,
      desativado_em: obj.desativado_em,
    };

    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        resumo,
        "app_entrega_periodicidade",
        "insert",
        "RETURNING id INTO :cadPeriodicidadeOut"
      );
      const binds = CreateBinds.createBinds(resumo);
      binds.cadPeriodicidadeOut = {
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
        const result = await connection.execute<PeriodicidadeBindOut>(
          sql,
          binds
        );

        if (typeof result.outBinds === "undefined") {
          console.log(
            `Erro ao inserir período: ${obj.descricao}, rows = undefined`,
            1
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir período: ${obj.descricao}, rows = undefined`
            )
          );
        }
        const periodicidadeOutReturn = result.outBinds.cadPeriodicidadeOut;
        if (periodicidadeOutReturn.length <= 0) {
          // Se não retornou o cadPeriodicidadeOut não deu certo o insert
          console.log(`Erro ao inserir período: ${obj.descricao}`, 1);
          return resolve(
            retornoPadrao(1, `Erro ao inserir período: ${obj.descricao}`)
          );
        }
        // Se retornou periodicidadeOut é porque inseriu
        console.log(`Período: ${obj.descricao}, inserido com sucesso!`, 0);
        return resolve(
          retornoPadrao(0, `Período: ${obj.descricao}, inserido com sucesso!`)
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: PeriodicidadeZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    console.log(`Tentando atualizar o período ${obj.descricao}`, 0);
    const sql = createSqlCampos(
      obj,
      "app_entrega_periodicidade",
      "update",
      "where id = :id RETURNING id INTO :cadPeriodicidadeOut"
    );

    const binds = CreateBinds.createBinds(obj);
    binds.cadPeriodicidadeOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    const connection = conn;
    try {
      const result = await connection.execute<PeriodicidadeBindOut>(
        sql,
        binds,
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );
      if (typeof result.outBinds === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      const returnPeriodo = result.outBinds.cadPeriodicidadeOut;
      if (returnPeriodo.length <= 0) {
        console.log(`Não encontrado período ${obj.descricao}`, 1);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado período ${obj.descricao}`)
        );
      }
      console.log(`Período ${obj.descricao} atualizado com sucesso!`, 0);
      return Promise.resolve(
        retornoPadrao(0, `Período ${obj.descricao} atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async patch(
    obj: PeriodicidadeInterface,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    console.log(`Tentado atualizar período ${obj.id}`, 0);

    const sql = createSqlCampos(
      obj,
      "app_entrega_periodicidade",
      "update",
      "where id = :id RETURNING id INTO :cadPeriodicidadeOut"
    );

    const binds = CreateBinds.createBinds(obj);
    binds.cadPeriodicidadeOut = {
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
      const result = await connection.execute<PeriodicidadeBindOut>(
        sql,
        binds,
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        }
      );
      if (typeof result.outBinds === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      const returnPeriodo = result.outBinds.cadPeriodicidadeOut;
      if (returnPeriodo.length <= 0) {
        console.log(`Não encontrado período ${obj.id}`, 1);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado período ${obj.id}`)
        );
      }
      console.log(`Período ${obj.id} atualizado com sucesso!`, 0);
      return Promise.resolve(
        retornoPadrao(0, `Período ${obj.id}, atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(conn: oracledb.Connection): Promise<CadPeriodicidadeOut[]> {
    const sql = `SELECT * FROM app_entrega_periodicidade ORDER BY id asc`;
    const result = await conn.execute<CadPeriodicidadeOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const periodicidade = result.rows;

    if (typeof periodicidade === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const periodo_lower = convertLowerCase(periodicidade);
    const cadPeriodo = periodo_lower.map((periodo) => {
      const item_periodo = periodo;

      item_periodo.criado_em = convertDate2String(new Date(periodo.criado_em));

      if (periodo.desativado_em !== null) {
        item_periodo.desativado_em = convertDate2String(
          new Date(periodo.desativado_em)
        );
      }
      return item_periodo;
    });
    return Promise.resolve(cadPeriodo);
  }

  async showAtivo(conn: oracledb.Connection): Promise<CadPeriodicidadeOut[]> {
    const sql = `SELECT * FROM app_entrega_periodicidade WHERE desativado_em IS NULL ORDER BY id asc`;
    const result = await conn.execute<CadPeriodicidadeOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const periodicidade = result.rows;

    if (typeof periodicidade === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const periodo_lower = convertLowerCase(periodicidade);
    const cadPeriodo = periodo_lower.map((periodo) => {
      const item_periodo = periodo;

      item_periodo.criado_em = convertDate2String(new Date(periodo.criado_em));

      return item_periodo;
    });
    return Promise.resolve(cadPeriodo);
  }

  async find(
    id: string,
    conn: oracledb.Connection
  ): Promise<CadPeriodicidadeOut[]> {
    const sql = `SELECT * FROM app_entrega_periodicidade WHERE id = :id`;

    const result = await conn.execute<CadPeriodicidadeOut>(sql, [id], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const periodicidade = result.rows;
    if (typeof periodicidade === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const periodo_lower = convertLowerCase(periodicidade);
    const cadPeriodo = periodo_lower.map((periodo) => {
      const item_periodo = periodo;
      item_periodo.criado_em = convertDate2String(new Date(periodo.criado_em));
      if (periodo.desativado_em !== null) {
        item_periodo.desativado_em = convertDate2String(
          new Date(periodo.desativado_em)
        );
      }
      return item_periodo;
    });
    return Promise.resolve(cadPeriodo);
  }

  async findPatch(
    id: string,
    conn: oracledb.Connection
  ): Promise<PeriodicidadeInterface[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT id, desativado_em FROM app_entrega_periodicidade WHERE id = :id`;

      try {
        const result = await conn.execute<PeriodicidadeInterface>(sql, [id], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });
        const periodicidade = result.rows;
        if (typeof periodicidade === "undefined") {
          console.log(`Erro ao buscar o período, rows = undefined`, 1);
          return reject(
            retornoPadrao(1, `Erro ao buscar período, rows = undefined`)
          );
        }
        return resolve(convertLowerCase(periodicidade));
      } catch (error) {
        return reject(error);
      }
    });
  }
}
