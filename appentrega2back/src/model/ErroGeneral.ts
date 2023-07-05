import { ErroType } from "./../Interfaces/index";
import { ReturnDefault } from "../Interfaces";

export class ErroGeneral extends ReturnDefault {
  static getErrorGeneral(arg0: string, error: unknown) {
    throw new Error("Método não implementado.");
  }

  retorno: { erro: ErroType; mensagem: string };

  constructor(retorno: ReturnDefault) {
    super();
    this.retorno = retorno.retorno;
  }
}
