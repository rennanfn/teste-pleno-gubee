/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable no-async-promise-executor */
/* eslint-disable prettier/prettier */
/* eslint-disable no-import-assign */
import oracledb from "oracledb";
import { v4 as uuidv4 } from "uuid";
import { ReturnDefault } from "../Interfaces";
import convertLowerCase from "../utils/convertLowerCase";
import CreateBinds from "../utils/createBinds";
import createSqlCampos from "../utils/createSqlCampos";
import { convertDate2String } from "../utils/dateNow";
import retornoPadrao from "../utils/retornoPadrao";
import CadProduto, {
  CadProdutoOut,
  ProdutoInterface,
  ProdutoZ,
} from "./../model/Cad_Produto";

interface ProdutoBindOut extends ProdutoInterface {
  cadProdutoOut: string;
}

export default class CadProdutoDB extends CadProduto {
  private rowsUndefined(): Error {
    console.log(`Erro ao buscar produto, rows = undefined`, 1);
    return new Error(`Erro ao buscar produto, rows = undefined`);
  }

  async insert(
    obj: ProdutoZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    const produto_bd = {
      id: uuidv4(),
      descricao: obj.descricao,
      entrega_com_restricao_comodato: obj.entrega_com_restricao_comodato,
      retira_com_menos_trinta_dias: obj.retira_com_menos_trinta_dias,
      periodicidade_id: obj.periodicidade_id,
      criado_em: obj.criado_em,
      desativado_em: obj.desativado_em,
      comodato: obj.comodato,
    };

    // Remove a propriedade 'comodato' do objeto ProdutoZ para fazer a inserção das demais props na tabela APP_ENTREGA_PRODUTO
    const { comodato, ...objProduto } = produto_bd;

    return new Promise(async (resolve, reject) => {
      const sql = createSqlCampos(
        objProduto,
        "app_entrega_produto",
        "insert",
        "RETURNING id INTO :cadProdutoOut"
      );
      const binds = CreateBinds.createBinds(objProduto);
      binds.cadProdutoOut = {
        type: oracledb.STRING,
        dir: oracledb.BIND_OUT,
      };

      delete binds.criado_em;
      binds.criado_em = {
        val: produto_bd.criado_em,
        type: oracledb.DATE,
      };

      const connection = conn;
      try {
        const result = await connection.execute<ProdutoBindOut>(sql, binds);

        if (typeof result.outBinds === "undefined") {
          console.log(
            `Erro ao inserir produto: ${produto_bd.descricao}, rows = undefined`,
            1
          );
          return reject(
            retornoPadrao(
              1,
              `Erro ao inserir produto: ${produto_bd.descricao}, rows = undefined`
            )
          );
        }

        // Verifica se o produto é comodato: 0 = Não e 1 = Sim. Caso seja, insere o id do produto na tabela APP_ENTREGA_COMODATO
        if (produto_bd.comodato === 1) {
          const sqlComodato =
            "INSERT INTO app_entrega_comodato (produto_id) VALUES (:produto_id)";
          const bindsComodato = {
            produto_id: {
              val: produto_bd.id,
              type: oracledb.STRING,
            },
          };
          await connection.execute(sqlComodato, bindsComodato);
        }
        const produtoOutReturn = result.outBinds.cadProdutoOut;
        if (produtoOutReturn.length <= 0) {
          // Se não retornou o cadProdutoOut não deu certo o insert
          console.log(`Erro ao inserir produto: ${produto_bd.descricao}`, 1);
          return resolve(
            retornoPadrao(1, `Erro ao inserir produto: ${produto_bd.descricao}`)
          );
        }
        // Se retornou produtoOut é porque inseriu
        console.log(
          `Produto: ${produto_bd.descricao}, inserido com sucesso!`,
          0
        );
        return resolve(
          retornoPadrao(
            0,
            `Produto: ${produto_bd.descricao}, inserido com sucesso!`
          )
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update(
    obj: ProdutoZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    console.log(`Tentando atualizar o produto ${obj.descricao}`, 0);

    const { comodato, ...objProduto } = obj;

    const sql = createSqlCampos(
      objProduto,
      "app_entrega_produto",
      "update",
      "where id = :id RETURNING id INTO :cadProdutoOut"
    );

    const binds = CreateBinds.createBinds(objProduto);
    binds.cadProdutoOut = {
      type: oracledb.STRING,
      dir: oracledb.BIND_OUT,
    };

    const connection = conn;
    try {
      const result = await connection.execute<ProdutoBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      const returnProduto = result.outBinds.cadProdutoOut;

      if (obj.comodato === 1) {
        const sqlComodato =
          "INSERT INTO app_entrega_comodato (produto_id) VALUES (:produto_id)";
        const bindsComodato = {
          produto_id: {
            val: obj.id,
            type: oracledb.STRING,
          },
        };
        await connection.execute(sqlComodato, bindsComodato);
      }

      if (obj.comodato === 0) {
        const sql = `UPDATE app_entrega_comodato
                     SET desativado_em = sysdate
                     WHERE produto_id = :produto_id
                     AND desativado_em IS NULL`;
        const bindsComodato = {
          produto_id: {
            val: obj.id,
            type: oracledb.STRING,
          },
        };
        await connection.execute(sql, bindsComodato);
      }

      if (obj.comodato === undefined) {
        const sql = `UPDATE app_entrega_comodato
                     SET desativado_em = null
                     WHERE produto_id = :produto_id`;
        const bindsComodato = {
          produto_id: {
            val: obj.id,
            type: oracledb.STRING,
          },
        };
        await connection.execute(sql, bindsComodato);
      }

      if (returnProduto.length <= 0) {
        console.log(`Não encontrado produto ${obj.descricao}`, 1);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado produto ${obj.descricao}`)
        );
      }
      console.log(`Produto ${obj.descricao} atualizado com sucesso!`, 0);
      return Promise.resolve(
        retornoPadrao(0, `Produto ${obj.descricao} atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async verificaComodato(
    produto_id: string,
    conn: oracledb.Connection
  ): Promise<CadProdutoOut[]> {
    const sql = `SELECT * FROM app_entrega_comodato WHERE produto_id = :produto_id`;
    const result = await conn.execute<CadProdutoOut>(sql, [produto_id], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const res_comodato = result.rows;
    if (typeof res_comodato === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    return Promise.resolve(res_comodato);
  }

  async patch(
    obj: ProdutoInterface,
    conn: oracledb.Connection
  ): Promise<ReturnDefault> {
    console.log(`Tentando atualizar o produto ${obj.id}`, 0);

    const sql = createSqlCampos(
      obj,
      "app_entrega_produto",
      "update",
      "where id = :id RETURNING id INTO :cadProdutoOut"
    );

    const binds = CreateBinds.createBinds(obj);
    binds.cadProdutoOut = {
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
      const result = await connection.execute<ProdutoBindOut>(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      if (typeof result.outBinds === "undefined") {
        return Promise.reject(this.rowsUndefined());
      }
      const returnProduto = result.outBinds.cadProdutoOut;
      if (returnProduto.length <= 0) {
        console.log(`Não encontrado produto ${obj.id}`, 0);
        return Promise.resolve(
          retornoPadrao(0, `Não encontrado produto ${obj.id}`)
        );
      }
      console.log(`Produto ${obj.id} atualizado com sucesso!`, 0);
      return Promise.resolve(
        retornoPadrao(0, `Produto ${obj.id}, atualizado com sucesso!`)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async show(conn: oracledb.Connection): Promise<CadProdutoOut[]> {
    // const sql = `SELECT * FROM app_entrega_produto ORDER BY id asc`;
    const sql = `SELECT prod.id,
                 prod.descricao,
                 prod.entrega_com_restricao_comodato,
                 prod.retira_com_menos_trinta_dias,
                 prod.periodicidade_id,
                 per.descricao,
                 prod.criado_em,
                 prod.desativado_em,
                 SUM(CASE WHEN com.produto_id IS NOT NULL AND com.desativado_em IS NULL THEN 1 ELSE 0 END) AS comodato
                 FROM app_entrega_produto prod
                 LEFT JOIN app_entrega_periodicidade per ON per.id = prod.periodicidade_id
                 LEFT JOIN app_entrega_comodato com ON com.produto_id = prod.id
                 GROUP BY prod.id,
                 prod.descricao,
                 prod.entrega_com_restricao_comodato,
                 prod.retira_com_menos_trinta_dias,
                 prod.periodicidade_id,
                 per.descricao,
                 prod.criado_em,
                 prod.desativado_em`;

    const result = await conn.execute<CadProdutoOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const produto = result.rows;

    if (typeof produto === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const produto_lower = convertLowerCase(produto);
    const cadProduto = produto_lower.map((produto) => {
      const item_produto = produto;

      item_produto.criado_em = convertDate2String(new Date(produto.criado_em));

      if (produto.desativado_em !== null) {
        item_produto.desativado_em = convertDate2String(
          new Date(produto.desativado_em)
        );
      }
      return item_produto;
    });
    return Promise.resolve(cadProduto);
  }

  async showAtivo(conn: oracledb.Connection): Promise<CadProdutoOut[]> {
    const sql = `SELECT prod.id,
                 prod.descricao,
                 prod.entrega_com_restricao_comodato,
                 prod.retira_com_menos_trinta_dias,
                 prod.periodicidade_id,
                 per.descricao,
                 prod.criado_em,
                 prod.desativado_em,
                 SUM(CASE WHEN com.produto_id IS NOT NULL AND com.desativado_em IS NULL THEN 1 ELSE 0 END) AS comodato
                 FROM app_entrega_produto prod
                 LEFT JOIN app_entrega_periodicidade per ON per.id = prod.periodicidade_id
                 LEFT JOIN app_entrega_comodato com ON com.produto_id = prod.id
                 WHERE prod.desativado_em IS NULL
                 GROUP BY prod.id,
                 prod.descricao,
                 prod.entrega_com_restricao_comodato,
                 prod.retira_com_menos_trinta_dias,
                 prod.periodicidade_id,
                 per.descricao,
                 prod.criado_em,
                 prod.desativado_em`;
    const result = await conn.execute<CadProdutoOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const produto = result.rows;

    if (typeof produto === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const produto_lower = convertLowerCase(produto);
    const cadProduto = produto_lower.map((produto) => {
      const item_produto = produto;

      item_produto.criado_em = convertDate2String(new Date(produto.criado_em));

      return item_produto;
    });
    return Promise.resolve(cadProduto);
  }

  async find(id: string, conn: oracledb.Connection): Promise<CadProdutoOut[]> {
    const sql = `SELECT prod.id,
                 prod.descricao,
                 prod.entrega_com_restricao_comodato,
                 prod.retira_com_menos_trinta_dias,
                 prod.periodicidade_id,
                 per.descricao,
                 prod.criado_em,
                 prod.desativado_em,
                 SUM(CASE WHEN com.produto_id IS NOT NULL AND com.desativado_em IS NULL THEN 1 ELSE 0 END) AS comodato
                 FROM app_entrega_produto prod
                 LEFT JOIN app_entrega_periodicidade per ON per.id = prod.periodicidade_id
                 LEFT JOIN app_entrega_comodato com ON com.produto_id = prod.id
                 WHERE prod.id = :id
                 GROUP BY prod.id,
                 prod.descricao,
                 prod.entrega_com_restricao_comodato,
                 prod.retira_com_menos_trinta_dias,
                 prod.periodicidade_id,
                 per.descricao,
                 prod.criado_em,
                 prod.desativado_em`;

    const result = await conn.execute<CadProdutoOut>(sql, [id], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const produto = result.rows;
    if (typeof produto === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const produto_lower = convertLowerCase(produto);
    const cadProduto = produto_lower.map((produto) => {
      const item_produto = produto;
      item_produto.criado_em = convertDate2String(new Date(produto.criado_em));
      if (produto.desativado_em !== null) {
        item_produto.desativado_em = convertDate2String(
          new Date(produto.desativado_em)
        );
      }
      return item_produto;
    });
    return Promise.resolve(cadProduto);
  }

  async findPatch(
    id: string,
    conn: oracledb.Connection
  ): Promise<ProdutoInterface[]> {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT id, desativado_em FROM app_entrega_produto WHERE id = :id`;

      try {
        const result = await conn.execute<ProdutoInterface>(sql, [id], {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });
        const produto = result.rows;
        if (typeof produto === "undefined") {
          console.log(`Erro ao buscar produto, rows = undefined`, 1);
          return reject(
            retornoPadrao(1, `Erro ao buscar produto, rows = undefined`)
          );
        }
        return resolve(convertLowerCase(produto));
      } catch (error) {
        return reject(error);
      }
    });
  }
}
