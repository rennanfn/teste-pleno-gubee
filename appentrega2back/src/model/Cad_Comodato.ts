export interface ComodatoInterface {
  produto_id?: string | undefined;
  desativado_em?: Date | undefined | string;
}

export interface CadComodatoOut extends ComodatoInterface {
  desativado_em: string;
}

export default abstract class CadComodato {
  private comodato: ComodatoInterface;

  constructor(obj: ComodatoInterface) {
    this.comodato = obj;
  }

  getComodatoObj(): ComodatoInterface {
    return this.comodato;
  }

  getProdutoId(): string | undefined {
    return this.comodato.produto_id;
  }

  getDesativadoEm(): Date | undefined | string {
    return this.comodato.desativado_em;
  }
}
