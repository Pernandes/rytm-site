# rytm-site

Landing page do Rytm, publicada em https://rytm.work pelo Cloudflare Pages.

Site estático em HTML, CSS e JavaScript puro: não há build nem dependências.

| Arquivo | O que tem |
| --- | --- |
| `index.html` | Estrutura e textos da página |
| `style.css` | Animações e estilos globais |
| `script.js` | Demonstração interativa (ilha, janela do app, cronômetro, scroll suave) |
| `favicon.svg` | Ícone da aba |
| `privacidade.html` + `estilo.css` | Política de privacidade (rytm.work/privacidade.html) |

## Como atualizar o site

1. Edite os arquivos (pelo próprio GitHub ou num clone local).
2. Faça commit e push no branch `main`.
3. O Cloudflare Pages publica sozinho em cerca de um minuto.

Para testar no computador antes de publicar, abra o `index.html` no navegador
ou rode `python -m http.server` na pasta e acesse http://localhost:8000.

## Como trocar o instalador de uma nova versão

Os botões "Baixar" apontam para o instalador na pasta pública do Google Drive.

1. Suba o novo `.exe` na pasta do Drive (ela já está compartilhada como
   "qualquer pessoa com o link").
2. Copie o ID do arquivo (o trecho entre `/d/` e `/view` no link de
   compartilhamento).
3. No `index.html`, troque o ID antigo pelo novo nos 3 botões
   (procure por `drive.usercontent.google.com`) e atualize o texto
   "Versão ..." perto do fim da página.
4. Commit e push no `main`.
