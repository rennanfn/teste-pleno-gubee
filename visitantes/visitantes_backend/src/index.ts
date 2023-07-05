import cors, { CorsOptions } from 'cors';
import express from 'express';
import oracledb from 'oracledb';
import dbconfig from './DB/dbconfig';
import { routes } from './routes/index';

const origensPermitidas = process.env.CORS_URL_PERMITIDAS_VISITANTES || '';

const expressPort = Number(process.env.PORTAEXPRESS);

if (!expressPort) {
  console.log('Falta variável de ambiente PORTAEXPRESS');
  process.exit(1);
}

const corsOptions: CorsOptions = {
  origin: origensPermitidas.split(';'),
  optionsSuccessStatus: 200,
};

async function init() {
  try {
    console.log('Aguarde, criando pool');
    await oracledb.createPool(dbconfig);
    console.log('Pool Oracle criado');
  } catch (error) {
    console.log(`Erro ao iniciar pool do Oracle`);
  }
}
const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.use(routes);

app.listen(3333, () => {
  console.log('Servidor iniciado na porta 3333');
  init();
});
