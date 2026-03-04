# STL Prime 📦
A SaaS platform for exclusive, high-quality 3D printing models (STL, 3MF).

## 🚀 Como Executar Localmente
1. Instale as dependências: `npm install`
2. Crie um arquivo `.env.local` na raiz de `frontend/` usando o `.env.example` como base.
3. Inicie o servidor: `npm run dev`

## 🚀 Deploy na Vercel
A melhor forma de subir o STL Prime em produção é utilizando a Vercel. Siga as instruções:

1. Suba este repositório para o seu **GitHub**.
2. No painel da [Vercel](https://vercel.com), clique em **"Add New Project"** e conecte seu repositório GitHub.
3. Durante o processo de importe, certifique-se que o "Root Directory" está configurado como `frontend` se este repouso estiver dentro de uma pasta maior (ou não altere se a pasta raiz já for o Next.js).
4. Na seção **Environment Variables**, adicione *exatamente* as chaves que estão detalhadas no seu `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (Deixe com a URL provisória da Vercel ou o seu domínio final `https://www.stlprime.com`)
   - Chaves da Stripe (`PUBLISHABLE`, `SECRET` e `WEBHOOK`) e Resend.
5. Clique em **Deploy**! A Vercel cuidará do build automaticamente (`npm run build`).

*Nota: Para que os Webhooks da Stripe (confirmação automática de compra e recibos) funcionem sob o Vercel, vá no painel da Stripe e adicione um novo webhook apontando para `seu-dominio-vercel.com/api/webhooks/stripe`.*
