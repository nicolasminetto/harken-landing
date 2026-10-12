# Harken

Landing page conceitual de um headset fictício com IA que detecta e filtra ruídos específicos
(obra, trânsito, latido, buzina, sirene, multidão) em tempo real durante chamadas de vídeo.
Peça de portfólio, construída como **experiência de rolagem** (scrollytelling): a rolagem é a
linha do tempo da história.

**Harken é fictício. As specs são ilustrativas, não representam performance real.**

## Como rodar

Sem build. Basta servir a pasta:

```bash
npx serve .
```

## A jornada (6 cenas)

1. **Madrugada** (hero) — estúdio escuro com grão de filme; o título se monta palavra a palavra;
   o logo "h" de vidro holográfico entre as conchas. A **bolha de silêncio** segue o cursor.
2. **O sinal** (como funciona) — 4 passos que entram alternando os lados.
3. **A cidade emudece** (pico) — cena presa de 5 telas: o fone cercado por camadas de ruído
   rotuladas, retiradas uma a uma; a onda achata até virar um traço ciano calmo; o fundo viaja
   ao silêncio.
4. **Agora, você** — demo hands-on: toggles por categoria + áudio sintetizado no navegador.
5. **O repertório** (ruídos) — trilho horizontal com as 6 categorias.
6. **Detalhes** (specs + FAQ) e **Feito à mão** (lista de espera) — fecho no silêncio mais fundo.

## Movimento-assinatura

**A bolha de silêncio:** onde o cursor passa, o grão de ruído do fundo se aquieta, como se o
Harken limpasse o som ao redor dele. Código próprio na página (`script.js`).

## Decisões

- **HTML, CSS e JS puro**, sem framework nem build.
- **Motor de rolagem** da skill *Sites Incríveis* (`sites-incriveis.js/.css`, não editados): efeitos
  por atributos `data-fx-*` (revelações, cena fixa com `--progresso`, trilho, contagem, fundo que
  viaja). A coreografia do pico, a onda em `<canvas>` e a bolha de silêncio vivem em `script.js`.
- **Demo antes/depois** com áudio **sintetizado** (Web Audio, ruído branco por bandas de
  frequência). Nenhum arquivo de áudio licenciado: é só demonstração de UX, não o algoritmo real.
- **Imagens do fone:** renders originais com fundo transparente; não referenciam marca real.
- **Performance:** imagens em WebP com preload, `width/height` contra salto de layout, canvas só
  anima quando visível, JS com `defer`, sem framework.
- **Acessibilidade:** foco visível, alvos de toque ≥ 44px, menu mobile, e `prefers-reduced-motion`
  desliga o grão, a bolha e o pino das cenas fixas, mostrando todo o conteúdo empilhado e legível.

## Verificação

Rolagem conferida em desktop, celular e movimento-reduzido (screenshots do verificador da skill),
sem erros de console.

## Créditos

Fonte: [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) via Google Fonts.
Motor de rolagem: *Sites Incríveis* (Enzo Barbatto — Sparo).

Feito por **Nícolas Minetto** · [GitHub](https://github.com/nicolasminetto) · [LinkedIn](https://www.linkedin.com/in/nicolas-minetto-658938ab/)
