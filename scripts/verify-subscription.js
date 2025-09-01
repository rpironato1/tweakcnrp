require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function verify() {
  try {
    console.log('🔍 Verificando subscrição criada...');

    const result = await sql`SELECT * FROM subscription WHERE "userId" = 'n9VIgevhUfRittHRhTzhUWYKIw1NVYY1' AND status = 'active'`;

    console.log('✅ Verificação da subscrição criada:');
    console.log('   Total de subscrições ativas:', result.length);

    if (result.length > 0) {
      const sub = result[0];
      console.log('   ID:', sub.id);
      console.log('   Status:', sub.status);
      console.log('   Produto:', sub.productId);
      console.log('   Valor:', sub.amount, sub.currency);
      console.log('   Período atual:', sub.currentPeriodStart, 'até', sub.currentPeriodEnd);
      console.log('   Metadata:', JSON.parse(sub.metadata || '{}'));
    } else {
      console.log('❌ Nenhuma subscrição ativa encontrada para este usuário');
    }
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

verify();
