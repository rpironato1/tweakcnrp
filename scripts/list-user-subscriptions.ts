// Carregar variáveis de ambiente PRIMEIRO
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../db";
import { subscription, user } from "../db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Script para listar usuários e suas subscrições
 * Uso: npx tsx scripts/list-user-subscriptions.ts [--email user@example.com] [--status active]
 */

interface ListOptions {
  email?: string;
  status?: string;
  limit?: number;
}

interface SubscriptionResult {
  userId: string;
  userName: string | null;
  userEmail: string;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  productId: string | null;
  amount: number | null;
  currency: string | null;
  recurringInterval: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date | null;
  cancelAtPeriodEnd: boolean | null;
}

async function listUserSubscriptions(options: ListOptions = {}) {
  const { email, status, limit = 50 } = options;

  try {
    const results: SubscriptionResult[] = [];

    if (email) {
      // Buscar usuário específico
      const userResult = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (userResult.length > 0) {
        const userData = userResult[0];
        const subscriptionResult = await db
          .select()
          .from(subscription)
          .where(eq(subscription.userId, userData.id))
          .orderBy(desc(subscription.createdAt))
          .limit(1);

        results.push({
          userId: userData.id,
          userName: userData.name,
          userEmail: userData.email,
          subscriptionId: subscriptionResult[0]?.id || null,
          subscriptionStatus: subscriptionResult[0]?.status || null,
          productId: subscriptionResult[0]?.productId || null,
          amount: subscriptionResult[0]?.amount || null,
          currency: subscriptionResult[0]?.currency || null,
          recurringInterval: subscriptionResult[0]?.recurringInterval || null,
          currentPeriodStart: subscriptionResult[0]?.currentPeriodStart || null,
          currentPeriodEnd: subscriptionResult[0]?.currentPeriodEnd || null,
          createdAt: subscriptionResult[0]?.createdAt || null,
          cancelAtPeriodEnd: subscriptionResult[0]?.cancelAtPeriodEnd || null,
        });
      }
    } else {
      // Buscar todos os usuários com suas subscrições
      const allUsers = await db
        .select()
        .from(user)
        .limit(limit);

      for (const userData of allUsers) {
        const subscriptionResult = await db
          .select()
          .from(subscription)
          .where(eq(subscription.userId, userData.id))
          .orderBy(desc(subscription.createdAt))
          .limit(1);

        const subData = subscriptionResult[0];

        // Aplicar filtro de status se especificado
        if (status && (!subData || subData.status !== status)) {
          continue;
        }

        results.push({
          userId: userData.id,
          userName: userData.name,
          userEmail: userData.email,
          subscriptionId: subData?.id || null,
          subscriptionStatus: subData?.status || null,
          productId: subData?.productId || null,
          amount: subData?.amount || null,
          currency: subData?.currency || null,
          recurringInterval: subData?.recurringInterval || null,
          currentPeriodStart: subData?.currentPeriodStart || null,
          currentPeriodEnd: subData?.currentPeriodEnd || null,
          createdAt: subData?.createdAt || null,
          cancelAtPeriodEnd: subData?.cancelAtPeriodEnd || null,
        });
      }
    }

    if (results.length === 0) {
      console.log("📭 Nenhum usuário encontrado com os critérios especificados");
      return;
    }

    console.log(`📊 Encontrados ${results.length} resultado(s):\n`);

    results.forEach((result, index) => {
      console.log(`${index + 1}. 👤 ${result.userName} (${result.userEmail})`);

      if (result.subscriptionId) {
        const amount = result.amount ? `$${(result.amount / 100).toFixed(2)}` : "N/A";
        const periodStart = result.currentPeriodStart ? result.currentPeriodStart.toLocaleDateString() : "N/A";
        const periodEnd = result.currentPeriodEnd ? result.currentPeriodEnd.toLocaleDateString() : "N/A";

        console.log(`   📋 Subscrição: ${result.subscriptionId}`);
        console.log(`   📊 Status: ${result.subscriptionStatus || "N/A"}`);
        console.log(`   🏷️  Produto: ${result.productId || "N/A"}`);
        console.log(`   💰 Valor: ${amount} ${result.currency?.toUpperCase() || ""} / ${result.recurringInterval || ""}`);
        console.log(`   📅 Período: ${periodStart} - ${periodEnd}`);
        console.log(`   ❌ Cancelar no fim: ${result.cancelAtPeriodEnd ? "Sim" : "Não"}`);
        console.log(`   📆 Criada em: ${result.createdAt?.toLocaleDateString() || "N/A"}`);
      } else {
        console.log(`   ❌ Sem subscrição ativa`);
      }

      console.log(""); // Linha em branco
    });

  } catch (error) {
    console.error("❌ Erro ao listar subscrições:", error);
    process.exit(1);
  }
}

// Função para processar argumentos da linha de comando
function parseArgs() {
  const args = process.argv.slice(2);
  const options: ListOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--email" && args[i + 1]) {
      options.email = args[i + 1];
      i++;
    } else if (arg === "--status" && args[i + 1]) {
      options.status = args[i + 1];
      i++;
    } else if (arg === "--limit" && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
📋 Script para listar usuários e subscrições

Uso:
  npx tsx scripts/list-user-subscriptions.ts [opções]

Opções:
  --email <email>              Filtrar por email específico
  --status <status>            Filtrar por status da subscrição (active, canceled, etc.)
  --limit <número>             Limite de resultados (padrão: 50)
  --help, -h                   Mostra esta ajuda

Exemplos:
  npx tsx scripts/list-user-subscriptions.ts
  npx tsx scripts/list-user-subscriptions.ts --email user@example.com
  npx tsx scripts/list-user-subscriptions.ts --status active --limit 10
  npx tsx scripts/list-user-subscriptions.ts --status canceled
`);
}

// Executar o script
async function main() {
  try {
    const options = parseArgs();
    await listUserSubscriptions(options);
  } catch (error) {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { listUserSubscriptions };
