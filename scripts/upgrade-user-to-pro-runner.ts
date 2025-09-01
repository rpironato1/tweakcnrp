import { config } from "dotenv";

// Carregar variáveis de ambiente do .env.local
config({ path: ".env.local" });

// Executar o script principal
import("./upgrade-user-to-pro.js");
