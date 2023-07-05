/* eslint-disable prettier/prettier */
import oracledb from "oracledb";
import { z } from "zod";
import { ReturnDefault } from "../Interfaces";

export const periodicidadeSchema = z.object({
  id: z
    .string({ required_error: "Campo Obrigatório" })
    .min(1)
    .max(36)
    .optional(),
  descricao: z
    .string({ required_error: "Campo Obrigatório" })
    .min(1, { message: "A descrição deve ter mais de 1 carcter" })
    .max(200, { message: "A descrição deve ter no máximo 100 caracteres" })
    .optional(),
  qtd_dias_periodo: z
    .number({ required_error: "Campo Obrigatório" })
    .optional(),
  criado_em: z.date().optional(),
  desativado_em: z.date().optional(),
});

export type PeriodicidadeZ = z.infer<typeof periodicidadeSchema>;

export interface PeriodicidadeInterface {
  id?: string | undefined;
  descricao?: string | undefined;
  qtd_dias_periodo?: number | undefined;
  criado_em?: Date | undefined | string;
  desativado_em?: Date | undefined | string;
}

export interface CadPeriodicidadeOut extends PeriodicidadeInterface {
  // rowsInOut: string;
  // id: string;
  // descricao: string;
  // qtd_dias_periodo: number;
  criado_em: string;
  desativado_em: string;
}

export default abstract class CadPeriodicidade {
  private periodicidade: PeriodicidadeInterface;

  constructor(obj: PeriodicidadeInterface) {
    this.periodicidade = obj;
  }

  getPeriodicidadeObj(): PeriodicidadeInterface {
    return this.periodicidade;
  }

  getId(): string | undefined {
    return this.periodicidade.id;
  }

  getDescricao(): string | undefined {
    return this.periodicidade.descricao;
  }

  getQtdDiasPeriodo(): Number | undefined {
    return this.periodicidade.qtd_dias_periodo;
  }

  getCriadoEm(): Date | string | undefined {
    return this.periodicidade.criado_em;
  }

  getDesativadoEm(): Date | string | undefined {
    return this.periodicidade.desativado_em;
  }

  abstract insert(
    obj: PeriodicidadeZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault>;

  abstract show(conn: oracledb.Connection): Promise<CadPeriodicidadeOut[]>;

  abstract find(
    id: string,
    conn: oracledb.Connection
  ): Promise<CadPeriodicidadeOut[]>;

  abstract findPatch(
    id: string,
    conn: oracledb.Connection
  ): Promise<PeriodicidadeInterface[]>;
}
