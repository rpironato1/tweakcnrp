# Deploy no Vercel

Este guia explica como fazer o deploy do projeto tweakcnrp no Vercel.

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [Neon](https://console.neon.tech/) para o banco de dados
3. Conta no [GitHub](https://github.com) para OAuth
4. Conta no [Google Cloud](https://console.cloud.google.com/) para OAuth e APIs
5. Conta no [Polar.sh](https://polar.sh) para pagamentos

## Configuração das Variáveis de Ambiente

### 1. No Vercel Dashboard

Acesse seu projeto no Vercel e vá para **Settings > Environment Variables**. Adicione as seguintes variáveis:

#### Banco de Dados
- `DATABASE_URL`: String de conexão do Neon (formato: `postgresql://user:password@host/database?sslmode=require`)

#### Autenticação
- `BETTER_AUTH_SECRET`: Chave secreta para criptografia (gere uma string aleatória segura)
- `GITHUB_CLIENT_ID`: Client ID do GitHub OAuth App
- `GITHUB_CLIENT_SECRET`: Client Secret do GitHub OAuth App
- `GOOGLE_CLIENT_ID`: Client ID do Google OAuth
- `GOOGLE_CLIENT_SECRET`: Client Secret do Google OAuth

#### APIs de IA
- `GOOGLE_API_KEY`: Chave da API do Google AI Studio
- `GROQ_API_KEY`: Chave da API do Groq

#### Google Fonts
- `GOOGLE_FONTS_API_KEY`: Chave da API do Google Fonts

#### Assinaturas
- `NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID`: ID do produto Pro (204854417)
- `POLAR_WEBHOOK_SECRET`: Secret do webhook do Polar.sh

### 2. Configuração dos Provedores Externos

#### GitHub OAuth
1. Vá para [GitHub Developer Settings](https://github.com/settings/developers)
2. Crie um novo OAuth App
3. Homepage URL: `https://your-domain.vercel.app`
4. Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

#### Google OAuth
1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google+ API
4. Vá para "Credentials" e crie um OAuth 2.0 Client ID
5. Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

#### Polar.sh
1. Vá para [Polar.sh](https://polar.sh/)
2. Configure o webhook endpoint: `https://your-domain.vercel.app/api/webhook/polar`
3. Copie o webhook secret gerado

## Deploy

### Método 1: Deploy via Git (Recomendado)

1. Faça push do código para um repositório Git
2. Conecte o repositório ao Vercel
3. Configure as variáveis de ambiente conforme descrito acima
4. Faça o deploy

### Método 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## Verificação do Deploy

Após o deploy, verifique:

1. ✅ O site carrega corretamente
2. ✅ A autenticação funciona (GitHub/Google)
3. ✅ O banco de dados está conectado
4. ✅ As funcionalidades de IA funcionam
5. ✅ Os webhooks do Polar estão sendo processados

## Troubleshooting

### Erro: "No database connection string was provided"
- Verifique se a variável `DATABASE_URL` está configurada corretamente no Vercel
- Certifique-se de que a string de conexão inclui `sslmode=require`

### Erro: "POLAR_WEBHOOK_SECRET environment variable is required"
- Adicione a variável `POLAR_WEBHOOK_SECRET` no Vercel
- Obtenha o secret do seu dashboard do Polar.sh

### Build falhando
- Verifique se todas as variáveis de ambiente estão configuradas
- Certifique-se de que as chaves de API são válidas
- Verifique os logs de build no Vercel para erros específicos

## Configurações Adicionais

### Custom Domain
Para usar um domínio personalizado:
1. Vá para Settings > Domains no Vercel
2. Adicione seu domínio
3. Configure os registros DNS conforme instruído

### Environment Variables por Branch
Você pode configurar variáveis diferentes para branches diferentes (ex: staging/production).

## Suporte

Se encontrar problemas durante o deploy, consulte:
- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Fórum da Comunidade Vercel](https://vercel.community/)
