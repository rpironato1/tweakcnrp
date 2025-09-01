// Carregar variáveis de ambiente PRIMEIRO
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../db";
import { subscription, user } from "../db/schema";
import { eq } from "drizzle-orm";
import cuid from "cuid";

interface UpgradeUserOptions {
  email: string;
  productId?: string;
  amount?: number;
  currency?: string;
  recurringInterval?: string;
  periodDays?: number;
}

/**
 * Script para atualizar um usuário para o plano Pro internamente
 * Uso: npx tsx scripts/upgrade-user-to-pro.ts --email user@example.com
 */

async function upgradeUserToPro(options: UpgradeUserOptions) {
  const {
    email,
    productId = process.env.NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID,
    amount = 800, // $8.00 em centavos
    currency = "usd",
    recurringInterval = "month",
    periodDays = 30,
  } = options;

  if (!email) {
    console.error("❌ Email é obrigatório");
    console.log("Uso: npx tsx scripts/upgrade-user-to-pro.ts --email user@example.com");
    process.exit(1);
  }

  if (!productId) {
    console.error("❌ NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID não está definido no .env");
    process.exit(1);
  }

  try {
    console.log(`🔍 Procurando usuário com email: ${email}`);

    // Encontrar o usuário pelo email
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!foundUser) {
      console.error(`❌ Usuário com email ${email} não encontrado`);
      process.exit(1);
    }

    console.log(`✅ Usuário encontrado: ${foundUser.name} (ID: ${foundUser.id})`);

    // Verificar se já existe uma subscrição ativa
    const [existingSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, foundUser.id))
      .limit(1);

    if (existingSubscription && existingSubscription.status === "active") {
      console.log(`⚠️  Usuário já possui uma subscrição ativa (ID: ${existingSubscription.id})`);
      console.log(`   Status: ${existingSubscription.status}`);
      console.log(`   Produto: ${existingSubscription.productId}`);
      return;
    }

    // Calcular datas do período
    const now = new Date();
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);
    const startedAt = now;

    // Criar nova subscrição
    const subscriptionId = cuid();
    const checkoutId = `internal-${subscriptionId}`;

    const subscriptionData = {
      id: subscriptionId,
      createdAt: now,
      modifiedAt: null,
      amount,
      currency,
      recurringInterval,
      status: "active" as const,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      startedAt,
      endsAt: null,
      endedAt: null,
      customerId: `internal-${foundUser.id}`,
      productId,
      discountId: null,
      checkoutId,
      customerCancellationReason: null,
      customerCancellationComment: null,
      metadata: JSON.stringify({
        source: "internal_upgrade",
        upgradedBy: "admin_script",
        upgradedAt: now.toISOString(),
      }),
      customFieldData: null,
      userId: foundUser.id,
    };

    console.log(`🚀 Criando subscrição Pro para o usuário...`);

    await db.insert(subscription).values(subscriptionData);

    console.log(`✅ Subscrição criada com sucesso!`);
    console.log(`   ID da subscrição: ${subscriptionId}`);
    console.log(`   Status: ${subscriptionData.status}`);
    console.log(`   Produto: ${subscriptionData.productId}`);
    console.log(`   Período: ${currentPeriodStart.toISOString()} - ${currentPeriodEnd.toISOString()}`);
    console.log(`   Valor: $${(amount / 100).toFixed(2)} ${currency.toUpperCase()}/${recurringInterval}`);

    // Verificar se a subscrição foi criada corretamente
    const [createdSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.id, subscriptionId))
      .limit(1);

    if (createdSubscription) {
      console.log(`✅ Verificação: Subscrição criada e ativa no banco de dados`);
    } else {
      console.error(`❌ Erro: Subscrição não foi encontrada após criação`);
    }

  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    process.exit(1);
  }
}

// Função para processar argumentos da linha de comando
function parseArgs() {
  const args = process.argv.slice(2);
  const options: Partial<UpgradeUserOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--email" && args[i + 1]) {
      options.email = args[i + 1];
      i++; // Pular o próximo argumento
    } else if (arg === "--product-id" && args[i + 1]) {
      options.productId = args[i + 1];
      i++;
    } else if (arg === "--amount" && args[i + 1]) {
      options.amount = parseInt(args[i + 1]);
      i++;
    } else if (arg === "--currency" && args[i + 1]) {
      options.currency = args[i + 1];
      i++;
    } else if (arg === "--recurring-interval" && args[i + 1]) {
      options.recurringInterval = args[i + 1];
      i++;
    } else if (arg === "--period-days" && args[i + 1]) {
      options.periodDays = parseInt(args[i + 1]);
      i++;
    } else if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    }
  }

  return options as UpgradeUserOptions;
}

function showHelp() {
  console.log(`
📋 Script para atualizar usuário para plano Pro

Uso:
  npx tsx scripts/upgrade-user-to-pro.ts --email user@example.com [opções]

Opções obrigatórias:
  --email <email>              Email do usuário a ser atualizado

Opções opcionais:
  --product-id <id>            ID do produto Pro (padrão: NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID)
  --amount <centavos>          Valor em centavos (padrão: 800 = $8.00)
  --currency <moeda>           Moeda (padrão: usd)
  --recurring-interval <tipo>  Tipo de recorrência (padrão: month)
  --period-days <dias>         Dias do período (padrão: 30)
  --help, -h                   Mostra esta ajuda

Exemplos:
  npx tsx scripts/upgrade-user-to-pro.ts --email user@example.com
  npx tsx scripts/upgrade-user-to-pro.ts --email user@example.com --amount 1000 --currency brl
  npx tsx scripts/upgrade-user-to-pro.ts --email user@example.com --period-days 365
`);
}

// Executar o script
async function main() {
  try {
    const options = parseArgs();
    await upgradeUserToPro(options);
    console.log("\n🎉 Processo concluído com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { upgradeUserToPro };
