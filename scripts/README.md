# Scripts de Administração de Subscrições

Este diretório contém scripts utilitários para administração do sistema de subscrições do tweakcn.

## Scripts Disponíveis

### 1. `upgrade-user-to-pro.ts`
Script para atualizar um usuário para o plano Pro internamente.

**Uso:**
```bash
npx tsx scripts/upgrade-user-to-pro-runner.ts --email user@example.com
```

**Opções:**
- `--email <email>`: Email do usuário (obrigatório)
- `--product-id <id>`: ID do produto Pro (padrão: NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID)
- `--amount <centavos>`: Valor em centavos (padrão: 800 = $8.00)
- `--currency <moeda>`: Moeda (padrão: usd)
- `--recurring-interval <tipo>`: Tipo de recorrência (padrão: month)
- `--period-days <dias>`: Dias do período (padrão: 30)
- `--help, -h`: Mostra ajuda

**Exemplos:**
```bash
# Atualizar usuário básico
npx tsx scripts/upgrade-user-to-pro-runner.ts --email user@example.com

# Atualizar com valor personalizado
npx tsx scripts/upgrade-user-to-pro-runner.ts --email user@example.com --amount 1000 --currency brl

# Atualizar com período anual
npx tsx scripts/upgrade-user-to-pro-runner.ts --email user@example.com --period-days 365
```

### 2. `list-user-subscriptions.ts`
Script para listar usuários e suas subscrições.

**Uso:**
```bash
npx tsx scripts/list-user-subscriptions-runner.ts [opções]
```

**Opções:**
- `--email <email>`: Filtrar por email específico
- `--status <status>`: Filtrar por status da subscrição (active, canceled, etc.)
- `--limit <número>`: Limite de resultados (padrão: 50)
- `--help, -h`: Mostra ajuda

**Exemplos:**
```bash
# Listar todos os usuários
npx tsx scripts/list-user-subscriptions-runner.ts

# Buscar usuário específico
npx tsx scripts/list-user-subscriptions-runner.ts --email user@example.com

# Listar apenas subscrições ativas
npx tsx scripts/list-user-subscriptions-runner.ts --status active --limit 10

# Listar subscrições canceladas
npx tsx scripts/list-user-subscriptions-runner.ts --status canceled
```

## Pré-requisitos

1. **Variáveis de ambiente**: Certifique-se de que o arquivo `.env.local` contém:
   - `DATABASE_URL`: String de conexão do PostgreSQL
   - `NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID`: ID do produto Pro

2. **Dependências**: Os scripts usam as dependências já instaladas no projeto:
   - `drizzle-orm`
   - `cuid`

## Funcionalidades

### Upgrade de Usuário
- ✅ Validação se o usuário existe
- ✅ Verificação se já possui subscrição ativa
- ✅ Criação de subscrição com dados completos
- ✅ Metadados para rastreamento (fonte: internal_upgrade)
- ✅ Logs detalhados do processo
- ✅ Verificação de criação bem-sucedida

### Listagem de Subscrições
- ✅ Listagem de todos os usuários ou filtragem por email
- ✅ Filtro por status da subscrição
- ✅ Informações completas da subscrição
- ✅ Formatação clara dos dados
- ✅ Tratamento de usuários sem subscrição

## Segurança

- 🔒 Validação rigorosa dos parâmetros
- 🔒 Verificação de existência do usuário antes de operações
- 🔒 Logs detalhados para auditoria
- 🔒 Tratamento adequado de erros
- 🔒 Não sobrescreve subscrições existentes ativas

## Casos de Uso

1. **Suporte ao Cliente**: Atualizar usuários que pagaram externamente
2. **Testes**: Criar usuários de teste com plano Pro
3. **Migração**: Migrar usuários de outros sistemas
4. **Administração**: Verificar status de subscrições
5. **Desenvolvimento**: Testes locais com dados controlados

## Estrutura da Subscrição Criada

```typescript
{
  id: string,                    // ID único gerado
  status: "active",             // Status da subscrição
  productId: string,            // ID do produto Pro
  amount: number,               // Valor em centavos
  currency: string,             // Moeda
  recurringInterval: string,    // Intervalo (month/year)
  currentPeriodStart: Date,     // Início do período atual
  currentPeriodEnd: Date,       // Fim do período atual
  userId: string,               // ID do usuário
  customerId: string,           // ID do cliente (internal)
  checkoutId: string,           // ID do checkout (internal)
  metadata: string,             // JSON com metadados
  // ... outros campos padrão
}
```

## Troubleshooting

### Erro: "NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID não está definido"
- Verifique se a variável de ambiente está definida no `.env.local`
- Certifique-se de que o arquivo está sendo carregado corretamente

### Erro: "Usuário não encontrado"
- Verifique se o email está correto
- Confirme se o usuário existe na tabela `user`

### Erro: "Usuário já possui subscrição ativa"
- O script não sobrescreve subscrições existentes
- Use o script de listagem para verificar o status atual
- Se necessário, cancele a subscrição existente primeiro

## Logs e Auditoria

Todos os scripts geram logs detalhados:
- ✅ Status das operações
- ✅ IDs gerados
- ✅ Dados da subscrição criada
- ✅ Erros com contexto completo
- ✅ Verificações de integridade

Os logs incluem metadados para rastreamento:
```json
{
  "source": "internal_upgrade",
  "upgradedBy": "admin_script",
  "upgradedAt": "2024-01-15T10:30:00.000Z"
}
```
