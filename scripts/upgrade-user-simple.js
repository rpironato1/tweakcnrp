const { neon } = require('@neondatabase/serverless');
const cuid = require('cuid');

// Configurações do banco
const DATABASE_URL = "postgresql://neondb_owner:npg_8kNX6vxUqKEn@ep-fragrant-cake-acym5b3a-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const PRODUCT_ID = "204854417";

async function upgradeUserToPro(email) {
  const sql = neon(DATABASE_URL);

  try {
    console.log('🔍 Procurando usuário com email:', email);

    // Primeiro, vamos verificar se a tabela subscription existe e suas colunas
    console.log('🔍 Verificando estrutura da tabela subscription...');
    const tableInfo = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'subscription' ORDER BY ordinal_position`;
    console.log('📋 Colunas da tabela subscription:', tableInfo.map(col => col.column_name));

    // Buscar usuário
    const userResult = await sql`SELECT id, name, email FROM "user" WHERE email = ${email} LIMIT 1`;

    if (userResult.length === 0) {
      console.error('❌ Usuário não encontrado:', email);
      return;
    }

    const user = userResult[0];
    console.log('✅ Usuário encontrado:', user.name, `(${user.id})`);

    // Verificar se já tem subscrição ativa
    const subResult = await sql`SELECT * FROM subscription WHERE "userId" = ${user.id} AND status = 'active' LIMIT 1`;

    if (subResult.length > 0) {
      const sub = subResult[0];
      console.log('⚠️  Usuário já possui subscrição ativa:', sub.id, `(Produto: ${sub.productId})`);
      return;
    }

    // Calcular datas
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    // Criar subscrição
    const subscriptionId = cuid();
    const checkoutId = `internal-${subscriptionId}`;

    console.log('🚀 Criando subscrição Pro...');

    await sql`
      INSERT INTO subscription (
        id, "createdAt", "modifiedAt", amount, currency, "recurringInterval",
        status, "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd",
        "canceledAt", "startedAt", "endsAt", "endedAt", "customerId", "productId",
        "discountId", "checkoutId", "customerCancellationReason",
        "customerCancellationComment", metadata, "customFieldData", "userId"
      ) VALUES (
        ${subscriptionId}, ${now}, ${null}, ${800}, ${'usd'}, ${'month'},
        ${'active'}, ${now}, ${periodEnd}, ${false},
        ${null}, ${now}, ${null}, ${null},
        ${`internal-${user.id}`}, ${PRODUCT_ID}, ${null}, ${checkoutId},
        ${null}, ${null}, ${JSON.stringify({
          source: "internal_upgrade",
          upgradedBy: "admin_script",
          upgradedAt: now.toISOString(),
        })}, ${null}, ${user.id}
      )
    `;

    console.log('✅ Subscrição criada com sucesso!');
    console.log('   ID da subscrição:', subscriptionId);
    console.log('   Status: active');
    console.log('   Produto:', PRODUCT_ID);
    console.log('   Valor: $8.00 USD/month');
    console.log('   Período:', now.toISOString(), 'até', periodEnd.toISOString());

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.log('Uso: node upgrade-user-simple.js <email>');
    process.exit(1);
  }
  upgradeUserToPro(email);
}

module.exports = { upgradeUserToPro };
