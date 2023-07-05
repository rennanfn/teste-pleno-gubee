/* eslint-disable prettier/prettier */
import oracledb from "oracledb";
import { z } from "zod";
import { ReturnDefault } from "../Interfaces";

export const maxRetiradaSchema = z.object({
  matricula: z.number({ required_error: "Campo Obrigatório!" }).optional(),
  produto_id: z
    .string({ required_error: "Campo Obrigatório!" })
    .min(1)
    .max(36)
    .optional(),
  criado_em: z.date().optional(),
  qtd_max_retirada: z
    .number({ required_error: "Campo Obrigatório" })
    .optional(),
  periodo_liberado_retirada: z.string(),
});

export type MaxRetiradaZ = z.infer<typeof maxRetiradaSchema>;

export interface MaxRetiradaInterface {
  matricula?: number | undefined;
  produto_id?: string | undefined;
  criado_em?: Date | string;
  qtd_max_retirada?: number | undefined;
  periodo_liberado_retirada?: Date | undefined | string;
}

export interface CadMaxRetiradaOut extends MaxRetiradaInterface {
  criado_em: string;
  periodo_liberado_retirada: string;
}

export default abstract class CadMaxRetirada {
  private maxRetirada: MaxRetiradaInterface;

  constructor(obj: MaxRetiradaInterface) {
    this.maxRetirada = obj;
  }

  getMaxRetiradaObj(): MaxRetiradaInterface {
    return this.maxRetirada;
  }

  getMatricula(): Number | undefined {
    return this.maxRetirada.matricula;
  }

  getProdutoId(): string | undefined {
    return this.maxRetirada.produto_id;
  }

  getCriadoEm(): Date | undefined | string {
    return this.maxRetirada.criado_em;
  }

  getQtdMaxRetirada(): Number | undefined {
    return this.maxRetirada.qtd_max_retirada;
  }

  getPeriodoLiberadoRetirada(): Date | string | undefined {
    return this.maxRetirada.periodo_liberado_retirada;
  }

  abstract insert(
    obj: MaxRetiradaZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault>;

  abstract update(
    obj: MaxRetiradaZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault>;

  abstract show(conn: oracledb.Connection): Promise<CadMaxRetiradaOut[]>;

  abstract find(
    matricula: number,
    conn: oracledb.Connection
  ): Promise<CadMaxRetiradaOut[]>;
}
