/* eslint-disable prettier/prettier */
import { Request, Response } from "express";
import { BdOracle } from "../model/BdOracle";
import { produtoSchema } from "../model/Cad_Produto";
import CadProdutoDB from "../modelDB/Cad_Produto_DB";
import retornoPadrao from "../utils/retornoPadrao";
import { ErroGeneral } from "./../model/ErroGeneral";

export default class ProdutoController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    const produto = produtoSchema.parse(req.body);

    produto.criado_em = new Date();

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retornar);
    }
    const cadProduto = new CadProdutoDB(produto);
    try {
      const retorno = await cadProduto.insert(produto, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir o produto ${produto.descricao}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    const produto = produtoSchema.parse(req.body);
    if (typeof produto === "undefined") {
      return resp
        .status(400)
        .json(retornoPadrao(1, "Objeto recebido não é do tipo esperado!"));
    }

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retornar);
    }

    const cadProduto = new CadProdutoDB(produto);
    try {
      // Verifica na tabela APP_ENTREGA_COMODATO se já existe um produto_id cadastrado
      const comodatoDB = await cadProduto.verificaComodato(
        String(produto.id),
        connection
      );

      // Se o produto não for um comodato mas passar a ser, o produto.comodato recebe o valor 1
      // Sendo o valor 1, será feito um insert deste produto_id na tabela APP_ENTREGA_COMODATO
      if (comodatoDB.length === 0 && produto.comodato === 1) {
        produto.comodato = 1;

        // Se o produto for um comodato, mas precisar deixar de ser, o produto.comodato recebe o valor 0
        // Sendo o valor 0, será feito um update na tabela APP_ENTREGA_COMODATO setando a data atual no campo desativado_em
        // Desde que este campo esteja null. Se já tiver preenchido com uma data, a sentença será ignorada
      } else if (comodatoDB.length >= 1 && produto.comodato === 0) {
        produto.comodato = 0;

        // Se o produto for um comodato e continuar sendo ou vice-versa (sem alterações) o produto.comodato recebe o valor undefined
        // Sendo o valor undefined, será feito um update na tabela APP_ENTREGA_COMODATO removendo a data do campo desativado_em, caso esteja desativado
        // Ou se não estiver desativado, será setado null em um campo que já será null, não havendo alterações nos dados
      } else if (
        (comodatoDB.length >= 1 && produto.comodato === 1) ||
        (comodatoDB.length === 0 && produto.comodato === 0)
      ) {
        produto.comodato = undefined;
      }

      const retorno = await cadProduto.update(produto, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar produto ${produto.descricao}`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async show(req: Request, resp: Response): Promise<Response> {
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erro = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(erro);
    }
    const cadProduto = new CadProdutoDB({});
    try {
      const retorno = await cadProduto.show(connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async showAtivo(req: Request, resp: Response): Promise<Response> {
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erro = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(erro);
    }
    const cadProduto = new CadProdutoDB({});
    try {
      const retorno = await cadProduto.showAtivo(connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async find(req: Request, resp: Response): Promise<Response> {
    const { id } = req.params;

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const erro = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(erro);
    }

    const cadProduto = new CadProdutoDB({ id });
    try {
      const retorno = await cadProduto.find(String(id), connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }

  static async patch(req: Request, resp: Response): Promise<Response> {
    const { id } = req.params;

    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retornar);
    }

    const cadProduto = new CadProdutoDB({ id });
    try {
      const produto = await cadProduto.findPatch(id, connection);
      if (typeof produto === "undefined") {
        return resp
          .status(400)
          .json(retornoPadrao(1, "Produto não encontrado"));
      }

      if (produto[0].desativado_em === null) {
        produto[0].desativado_em = new Date();
      } else {
        produto[0].desativado_em = undefined;
      }

      cadProduto.patch(produto[0], connection);
      await connection.commit();
      return resp.json(produto);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar o produto`,
        error
      );
      return resp.status(400).json(resultErro);
    } finally {
      BdOracle.closeConnection(connection);
    }
  }
}
