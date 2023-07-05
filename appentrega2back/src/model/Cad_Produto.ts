import oracledb from "oracledb";
/* eslint-disable prettier/prettier */
import { z } from "zod";
import { ReturnDefault } from "../Interfaces";

export const produtoSchema = z.object({
  id: z
    .string({ required_error: "Campo Obrigatório!" })
    .min(1)
    .max(36)
    .optional(),
  descricao: z
    .string({ required_error: "Campo Obrigatório" })
    .min(1, { message: "A descrição deve ter mais de 1 caracter" })
    .max(100, { message: "A descrição de ter no máximo 100 caracteres" })
    .optional(),
  entrega_com_restricao_comodato: z
    .number({ required_error: "Campo Obrigatório!" })
    .optional(),
  retira_com_menos_trinta_dias: z
    .number({ required_error: "Campo Obrigatório" })
    .optional(),
  periodicidade_id: z
    .string({ required_error: "Campo Obrigatório" })
    .optional(),
  criado_em: z.date().optional(),
  desativado_em: z.date().optional(),
  comodato: z.number().optional(),
});

export type ProdutoZ = z.infer<typeof produtoSchema>;

export interface ProdutoInterface {
  id?: string | undefined;
  descricao?: string | undefined;
  entrega_com_restricao_comodato?: number | undefined;
  retira_com_menos_trinta_dias?: number | undefined;
  periodicidade_id?: string | undefined;
  criado_em?: Date | undefined | string;
  desativado_em?: Date | undefined | string;
  comodato?: number | undefined;
}

export interface CadProdutoOut extends ProdutoInterface {
  criado_em: string;
  desativado_em: string;
}

export default abstract class CadProduto {
  private produto: ProdutoInterface;

  constructor(obj: ProdutoInterface) {
    this.produto = obj;
  }

  getProdutoObj(): ProdutoInterface {
    return this.produto;
  }

  getId(): string | undefined {
    return this.produto.id;
  }

  getDescricao(): string | undefined {
    return this.produto.descricao;
  }

  getEntregaComRestricaoComodato(): Number | undefined {
    return this.produto.entrega_com_restricao_comodato;
  }

  getRetiraComMenosTrintaDias(): Number | undefined {
    return this.produto.retira_com_menos_trinta_dias;
  }

  getPeriodicidadeId(): string | undefined {
    return this.produto.periodicidade_id;
  }

  getCriadoEm(): Date | undefined | string {
    return this.produto.criado_em;
  }

  getDesativadoEm(): Date | undefined | string {
    return this.produto.desativado_em;
  }

  getComodato(): Number | undefined {
    return this.produto.comodato;
  }

  abstract insert(
    obj: ProdutoZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault>;

  abstract update(
    obj: ProdutoZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault>;

  abstract show(conn: oracledb.Connection): Promise<CadProdutoOut[]>;

  abstract find(
    id: string,
    conn: oracledb.Connection
  ): Promise<CadProdutoOut[]>;

  abstract findPatch(
    id: string,
    conn: oracledb.Connection
  ): Promise<ProdutoInterface[]>;
}
