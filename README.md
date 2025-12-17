## Desenvolvimento, build e deploy

Instruções rápidas para rodar, gerar a build correta para GitHub Pages e evitar erros de MIME (asset servido como `text/html`).

- Instalar dependências:

```bash
npm install
```

- Rodar em desenvolvimento (localhost):

```bash
npm run dev
```

- Gerar build para GitHub Pages (o `base` será `/daq-statusboard/` em produção):

```bash
VITE_BASE=/daq-statusboard/ npm run build
```

ou simplesmente:

```bash
npm run build
```

O `vite.config.ts` foi ajustado para usar `/daq-statusboard/` quando `mode === 'production'`, então `VITE_BASE` continua sendo aceito como override.

- Pré-deploy e deploy usando o script do `package.json` (usa `gh-pages`):

```bash
npm run predeploy
npm run deploy
```

Checagens se você ver erro de MIME (arquivo `.js` sendo servido como `text/html`):

- Abra `dist/index.html` e verifique os caminhos de `assets/` apontam para `/daq-statusboard/assets/...`.
- Confirme que todos os arquivos referenciados existem em `dist/assets/`.
- Se o site estiver numa URL de projeto (not user/org site), verifique nas configurações do GitHub Pages se a **pasta** `gh-pages` (branch) foi publicada corretamente.

Se continuar com problemas, cole aqui a URL do deploy e eu ajudo a inspecionar as referências e headers do arquivo com ênfase no status 404 e no Content-Type.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PjXkJibCvF6LFHWmksS0tHOizSKDEJYu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
