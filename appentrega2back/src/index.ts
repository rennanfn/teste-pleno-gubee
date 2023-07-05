import oracledb from "oracledb";
import cors from "cors";
import routes from "./routes/index";
import dbconfig from "./DB/dbconfig";
import express from "express";

async function init() {
  try {
    console.log("Aguarde, criando pool");
    await oracledb.createPool(dbconfig);
    console.log("Pool Oracle Criado");
  } catch (error) {
    console.log(`Erro ao iniciar pool do Oracle ${error}`);
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: false, limit: "200mb" }));
// app.use(express.json());
app.use(routes);

app.listen(3333, () => {
  console.log("Servidor Iniciado na porta 3333");
  init();
});
