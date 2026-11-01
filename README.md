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

Os botões "Baixar" baixam o instalador direto do site, da pasta `download/`
(o arquivo `_headers` força o download em vez de abrir no navegador).

1. Coloque o novo `.exe` em `download/` e apague o antigo.
2. No `index.html`, troque o nome do arquivo nos 3 botões
   (procure por `/download/Rytm_`) e atualize o texto "Versão ..."
   perto do fim da página.
3. Commit e push no `main`.

Limite do Cloudflare Pages: 25 MB por arquivo.
