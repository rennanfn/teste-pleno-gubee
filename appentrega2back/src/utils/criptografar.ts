import bcrypt from "bcrypt";
import retornoPadrao from "./retornoPadrao";

// Classe para criptografar senha do operador utilizando a função hash
export default abstract class Criptografar {
  static criptografarSenha(senha: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`Criptografando senha`, 0);
      bcrypt
        .hash(senha, 10)
        .then((hash) => {
          console.log(`Senha criptografada com sucesso!`, 0);
          return resolve(hash);
        })
        .catch((erro) => {
          console.log(`Erro ao criptografar senha ${erro.message}`, 1);
          return reject(retornoPadrao(1, `Erro ao criptogrfar senha`));
        });
    });
  }

  static compararSenhas(senhaOperador: string, senhaBD: string): boolean {
    console.log(`Comparando senhas`, 0);
    if (bcrypt.compareSync(senhaOperador, senhaBD)) {
      console.log(`Senhas conferem`, 0);
      return true;
    }
    console.log(`Senhas não conferem`, 1);
    return false;
  }

  static compararLogin(loginOperador: string, loginBD: string): any {
    console.log(`Comparando senhas`, 0);
    if (bcrypt.compareSync(loginOperador, loginBD)) {
      console.log(`Senhas conferem`, 0);
      return true;
    }
    console.log(`Senhas não conferem`, 1);
    return false;
  }
}
