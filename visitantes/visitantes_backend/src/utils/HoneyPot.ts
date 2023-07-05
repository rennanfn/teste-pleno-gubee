import { Request, Response } from 'express';

export class HoneyPot {
  static reqGet(req: Request, resp: Response) {
    const clienteIp = req.userIp?.ip;
    const { url } = req;
    const { method } = req;
    const msg = `HoneyPot - Tentativa acesso url: ${url} - metodo: ${method} - ip ${clienteIp}`;
    console.log(msg);
    req.destroy(); // Não responde a requisição propositalmente para que o script do atacante fique aguardando infinitamente uma resposta!
  }
}
