/* eslint-disable prettier/prettier */
import oracledb from "oracledb";
import { z } from "zod";
import { ReturnDefault } from "../Interfaces";

export const operadorSchema = z.object({
  id: z
    .string({ required_error: "Campo Obrigatório" })
    .min(1)
    .max(36)
    .optional(),
  nome: z
    .string({ required_error: "Campo Obrigatório" })
    .min(1, { message: "O nome deve ter mais de 1 caracter" })
    .max(200, { message: "O nome deve ter no máximo 200 caracteres" })
    .optional(),
  login: z
    .string({ required_error: "Campo Obrigatório" })
    .min(1, { message: "O login deve ter mais de 1 caracter" })
    .max(10, { message: "O login deve ter no máximo 10 caracteres" })
    .optional(),
  senha: z
    .string({ required_error: "Campo Obrigatório" })
    .min(1, { message: "A senha deve ter mais de 1 caracter" })
    .max(200, { message: "A senha deve ter no máximo 200 caracteres" })
    .optional(),
  criado_em: z.date().optional(),
  desativado_em: z.date().optional(),
});

export type OperadorZ = z.infer<typeof operadorSchema>;

export interface OperadorInterface {
  id?: string | undefined;
  nome?: string | undefined;
  login?: string | undefined;
  senha?: string | undefined;
  criado_em?: Date | undefined | string;
  desativado_em?: Date | undefined | string;
}

// export interface CadOperadorOut extends OperadorInterface {
//   rowsInOut: string;
// }

export interface CadOperadorOut extends OperadorInterface {
  // id: string;
  // nome: string;
  // login: string;
  // senha: string;
  criado_em: string;
  desativado_em: string;
}

export default abstract class CadOperador {
  private operador: OperadorInterface;

  constructor(obj: OperadorInterface) {
    this.operador = obj;

    // this.operador =
    //   obj ||
    //   ({
    //     id: undefined,
    //     nome: undefined,
    //     login: undefined,
    //     senha: undefined,
    //     criado_em: undefined,
    //     desativado_em: undefined,
    //   } as Operador);
  }

  getOperadorObj(): OperadorInterface {
    return this.operador;
  }

  getId(): string | undefined {
    return this.operador.id;
  }

  getNome(): string | undefined {
    return this.operador.nome;
  }

  getLogin(): string | undefined {
    return this.operador.login;
  }

  getSenha(): string | undefined | null {
    return this.operador.senha;
  }

  getCriadoEm(): Date | string | undefined {
    return this.operador.criado_em;
  }

  getDesativadoEm(): Date | string | undefined {
    return this.operador.desativado_em;
  }

  abstract insert(
    obj: OperadorZ,
    conn: oracledb.Connection
  ): Promise<ReturnDefault>;

  abstract update(
    obj: OperadorInterface,
    conn: oracledb.Connection
  ): Promise<ReturnDefault>;

  abstract show(conn: oracledb.Connection): Promise<CadOperadorOut[]>;

  abstract find(
    id: string,
    conn: oracledb.Connection
  ): Promise<CadOperadorOut[]>;

  abstract findPatch(
    id: string,
    conn: oracledb.Connection
  ): Promise<OperadorInterface[]>;

  abstract findLogin(
    id: string,
    conn: oracledb.Connection
  ): Promise<OperadorInterface[]>;
}
