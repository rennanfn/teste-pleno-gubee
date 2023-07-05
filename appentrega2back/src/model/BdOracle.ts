import { ErroGeneral } from "./ErroGeneral";

import oracledb, { Connection } from "oracledb";

export abstract class BdOracle {
  static async getConnection(): Promise<oracledb.Connection> {
    try {
      return await oracledb.getConnection();
    } catch (error) {
      ErroGeneral.getErrorGeneral("Erro ao abrir conexão com o oracle", error);
      throw error;
    }
  }

  static async closeConnection(conn: Connection | undefined): Promise<void> {
    if (typeof conn === "undefined") return Promise.resolve();
    return conn
      .close()
      .then()
      .catch((erro) => console.log("Erro ao fechar conexão", 1, erro));
  }
}
