import oracledb, { Connection } from 'oracledb';
import { ErrorGeneral } from './ErrorGeneral';

export abstract class BdOracle {
  static async getConnection(): Promise<oracledb.Connection> {
    try {
      return await oracledb.getConnection();
    } catch (error) {
      ErrorGeneral.getErrorGeneral('Erro ao abrir conexão com o oracle', error);
      throw error;
    }
  }

  static async closeConnection(conn: Connection | undefined): Promise<void> {
    if (typeof conn === 'undefined') return Promise.resolve();
    return conn
      .close()
      .then()
      .catch(erro => console.log('erro ao fechar conexão', 1, erro));
  }
}
