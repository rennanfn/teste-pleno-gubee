/* eslint-disable prettier/prettier */
import { ErroGeneral } from "./../model/ErroGeneral";
/* eslint-disable camelcase */
import * as CryptoJS from "crypto-js";
import { Token } from "../Interfaces";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import retornoPadrao from "./retornoPadrao";
import { BdOracle } from "../model/BdOracle";
import CadOperadorDB from "../modelDB/Cad_Operador_DB";

function encryptToken(obj: string): string {
  console.log(`Criptografando payload token`, 0);
  const token_key =
    typeof process.env.TOKEN_KEY !== "undefined" ? process.env.TOKEN_KEY : "";

  if (token_key === "") return "";
  const key = CryptoJS.enc.Utf8.parse(token_key);
  const iv = CryptoJS.enc.Utf8.parse(token_key);

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(obj.toString()),
    key,
    {
      keySize: 128 / 8,
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  console.log(`Payload criptogrado com sucesso!`, 0);
  return encrypted.toString();
}

function gerarToken(obj: Token): string {
  const secretKey =
    typeof process.env.TOKEN_SECRET_KEY !== "undefined"
      ? process.env.TOKEN_SECRET_KEY
      : "";

  if (secretKey === "") return "";

  const corpoToken = JSON.stringify(obj);
  const newPayload = encryptToken(corpoToken);

  if (newPayload === "") return "";
  const tokenEncrypto = {
    tokenEnc: newPayload,
  };

  const tokenExpireTime = process.env.TOKEN_EXPIRES_IN_MINUTE ?? "60";
  const jwtOptions: jwt.SignOptions = {
    expiresIn: `${tokenExpireTime}m`,
  };
  const token = jwt.sign(tokenEncrypto, secretKey, jwtOptions);

  return token;
}

function decryptToken(encrypted: string): string {
  console.log(`Descriptografando payload token`, 0);
  const token_key =
    typeof process.env.TOKEN_KEY !== "undefined" ? process.env.TOKEN_KEY : "";

  if (token_key === "") return "";

  const key = CryptoJS.enc.Utf8.parse(token_key);
  const iv = CryptoJS.enc.Utf8.parse(token_key);

  const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key, {
    keySize: 128 / 8,
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  console.log(`Payload descriptogrfado com sucesso!`, 0);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function validLifeTimeToken(iat: number, exp: number): boolean {
  const tokenExpireTime = process.env.TOKEN_EXPIRES_IN_MINUTE ?? "60";
  const tokenExpireInMs = Number(tokenExpireTime) * 60000;

  const timeDiff = Math.abs(+new Date(exp) - +new Date(iat)) * 1000;
  if (Math.trunc(timeDiff) <= tokenExpireInMs) return true;
  return false;
}

export const validaToken = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const userIp = req.userIp?.ip ?? "";
  const url = req.url ?? "";

  console.log("Validando Token", 0, undefined, userIp);
  const token = req.headers.authorization;
  if (typeof token === "undefined") {
    console.log(`Request sem token`, 1, undefined, userIp);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, "Sessão expirada. Realize a autenticação novamente.")
      );
  }
  try {
    const secretKey =
      typeof process.env.TOKEN_SECRET_KEY !== "undefined"
        ? process.env.TOKEN_SECRET_KEY
        : "";

    const payloadTokenEnc = jwt.verify(token, secretKey) as jwt.JwtPayload;

    const { iat, exp } = payloadTokenEnc;
    if (
      typeof iat === "undefined" ||
      typeof exp === "undefined" ||
      iat === null ||
      exp === null ||
      !validLifeTimeToken(iat, exp)
    ) {
      console.log(`Claims inválidas`, 1, undefined, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, "Sessão expirada. Realize a autenticação novamente.")
        );
    }
    const decoded = decryptToken(payloadTokenEnc.tokenEnc);
    if (decoded === "") {
      console.log(
        `Não foi possível descriptografar o token`,
        1,
        undefined,
        userIp
      );
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`)
        );
    }
    const tokenDados = JSON.parse(decoded) as Token;
    if (typeof tokenDados.id === "undefined") {
      console.log(`Token sem o parâmetro id`, 1, undefined, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão expirada. Realize a autenticação novamente`)
        );
    }
    let connection;
    try {
      connection = await BdOracle.getConnection();
    } catch (error) {
      const retorno = ErroGeneral.getErrorGeneral(
        "Erro ao abrir conexão com o oracle",
        error
      );
      return resp.status(400).json(retorno);
    }
    try {
      const cadOperador = new CadOperadorDB({});
      const operador = await cadOperador.findLogin(
        tokenDados.login,
        connection
      );

      if (operador.length === 0) {
        console.log(
          `Operador ${tokenDados.login} não encontrado!`,
          1,
          undefined,
          userIp,
          tokenDados.id
        );
        return resp.status(403).json(retornoPadrao(1, `Sessão Expirada!`));
      }

      req.customProperties = {
        login: tokenDados.login,
        id: tokenDados.id,
        token_data: tokenDados,
      };
    } catch (error) {
      console.log(
        `Erro ao buscar operador = url: ${url}`,
        1,
        undefined,
        userIp,
        tokenDados.id
      );
      return resp.status(403).json(retornoPadrao(1, `Token Inválido!`));
    } finally {
      BdOracle.closeConnection(connection);
    }
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.log(`Token Expirado - url: ${url}`, 1, undefined, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão Expirada. Realize a autenticação novamente`)
        );
    }
    console.log(`Token Inválido - url: ${url}`, 1, undefined, userIp);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, `Sessão Expirada! Realize a autenticação novamente`)
      );
  }
};

export { gerarToken, encryptToken, decryptToken };
