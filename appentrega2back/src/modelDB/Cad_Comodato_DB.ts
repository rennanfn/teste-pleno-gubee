/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import oracledb from "oracledb";
import convertLowerCase from "../utils/convertLowerCase";
import { convertDate2String } from "../utils/dateNow";
import CadComodato, {
  CadComodatoOut,
  ComodatoInterface,
} from "./../model/Cad_Comodato";

interface ComodatoBindOut extends ComodatoInterface {
  cadComodatoOut: string;
}

export default class CadComodatoDB extends CadComodato {
  private rowsUndefined(): Error {
    console.log(`Erro ao buscar comodato, rows = undefined`, 1);
    return new Error(`Erro ao buscar comodato, rows = undefined`);
  }

  async show(conn: oracledb.Connection): Promise<CadComodatoOut[]> {
    const sql = `SELECT comodato.produto_id,
                 prod.descricao,
                 comodato.desativado_em
                 FROM app_entrega_comodato comodato
                 LEFT JOIN app_entrega_produto prod on prod.id = comodato.produto_id`;

    const result = await conn.execute<CadComodatoOut>(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const comodato = result.rows;

    if (typeof comodato === "undefined") {
      return Promise.reject(this.rowsUndefined());
    }
    const comodato_lower = convertLowerCase(comodato);
    const cadComodato = comodato_lower.map((comodato) => {
      const item_comodato = comodato;

      if (comodato.desativado_em !== null) {
        item_comodato.desativado_em = convertDate2String(
          new Date(comodato.desativado_em)
        );
      }
      return item_comodato;
    });
    return Promise.resolve(cadComodato);
  }
}
