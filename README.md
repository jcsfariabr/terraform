<h1 align="center">
  🌍 TERRAFORM
  <br>
  <sub><sup>O Resgate do Planeta Azul</sup></sub>
</h1>

<p align="center">
  <em>"Você não está salvando um planeta — está decidindo qual tipo de planeta ele será."</em>
</p>

<p align="center">
  Um jogo narrativo de decisões: 40 dias, 4 facções, 7 minigames e 6 finais possíveis<br>
  para reconstruir Kepler-452b depois de "O Incidente".
</p>

> 🕹️ [Jogue agora](https://jcsfariabr.github.io/terraform/) | 📖 [Guia dos Finais](GUIA-DOS-FINAIS.md) | 📜 [Licença](LICENSE)

<hr>

<p align="center">
  <img alt="Versão" src="https://img.shields.io/badge/versão-2.0-00D4FF?style=flat-square">
  <img alt="Status" src="https://img.shields.io/badge/status-versão%20final-00FF00?style=flat-square">
  <img alt="Concurso" src="https://img.shields.io/badge/Concurso Atual-C.R.O.P.E.%202026-FFD700?style=flat-square">
  <img alt="Stack" src="https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS%20puro-C084FC?style=flat-square">
  <img alt="Licença" src="https://img.shields.io/badge/licença-todos%20os%20direitos%20reservados-FF0040?style=flat-square">
</p>

## 🌌 A premissa

Kepler-452b sofreu "O Incidente". Os ecossistemas colapsaram, quatro
facções disputam o que sobrou, e ARIA — a IA que administra o que resta
do planeta — acabou de te acordar. Você é o Terraformador. Por 40 dias,
cada decisão que você tomar empurra o planeta um pouco mais na direção de
um entre **6 destinos completamente diferentes**: um paraíso verde, uma
singularidade tecnológica, um acordo corporativo lucrativo, um colapso
total, uma revelação que muda tudo — ou um equilíbrio imperfeito entre
todos esses caminhos.

Não existe escolha certa. Só consequências.

## 🎮 O jogo

TERRAFORM é 100% **HTML, CSS e JavaScript puro** — sem framework, sem
build step, sem biblioteca. Os únicos recursos externos são as fontes do
Google Fonts e os ícones 3D dos personagens (Microsoft Fluent Emoji, via
jsDelivr). Ele roda direto no navegador, local ou publicado, e foi
construído do zero como projeto autoral para o **Concurso CROPE 2026**.

Ao abrir o jogo, a tela de carregamento baixa **todas** as trilhas e
efeitos sonoros de uma vez (com barra de progresso), para que nenhuma
música demore a começar durante a partida.

## 📚 Sumário

- [🕹️ Como jogar](#-como-jogar)
- [🌱 Mecânicas principais](#-mecânicas-principais)
- [🎲 Eventos](#-eventos)
- [🧩 Minigames](#-minigames)
- [🏁 Os 6 finais](#-os-6-finais)
- [🏆 Conquistas](#-conquistas)
- [🔊 Trilha sonora e créditos](#-trilha-sonora-e-créditos)
- [♿ Acessibilidade](#-acessibilidade)
- [📱 Mobile e tela cheia](#-mobile-e-tela-cheia)
- [✅ QA](#-qa)
- [🗂️ Estrutura de arquivos](#-estrutura-de-arquivos)
- [🛠️ Editando conteúdo](#-editando-conteúdo)
- [✍️ Sobre o autor](#-sobre-o-autor)
- [📜 Licença](#-licença)

## 🕹️ Como jogar

**[▶️ Jogue direto no navegador aqui](https://jcsfariabr.github.io/terraform/)** — não
precisa instalar nada.

## 🌱 Mecânicas principais

| Sistema | O que é |
|---|---|
| 🌍 **Índices do planeta** | Biodiversidade, Qualidade do Ar, Pureza da Água e Energia Limpa — a saúde ambiental de Kepler-452b |
| 🏛️ **Facções** | Tecnocratas, Ecologistas, Corporações e Povo, cada uma com reputação de -100 a +100 |
| 💰 **Recursos** | Créditos (rende um pouco sozinho por dia), Energia e Influência |
| 🗓️ **40 dias** | Uma decisão binária por dia, do desembarque ao relatório final |

## 🎲 Eventos

- **15 eventos autorais**, fixos nos pontos de virada da narrativa (dias 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 36, 38 e 40).
- **60 eventos de preenchimento**, sorteados sem repetir até esgotar o pool, cobrindo temas ecológicos, tecnológicos, corporativos, sociais, de mistério e crises.
- **Eventos raros de "quarta parede"**, em que ARIA parece se dirigir a quem está jogando de verdade — pistas para quem estiver de olho no Final Secreto.

Os dados ficam em [`main.js`](main.js) (fonte de verdade), com uma cópia legível em [`events.json`](events.json).

## 🧩 Minigames

7 minigames completos, cada um jogável **uma única vez por partida**. Antes de começar, uma tela explica como jogar e qual é a meta — o tempo só corre depois do **Começar**. Durante o jogo há timer visual, botão **Concluir** (encerra na hora) e botão **Pular**.

| Minigame | Como funciona |
|---|---|
| 🌲 Reflorestamento Rápido | Plantar as 30 árvores em 20 segundos |
| 🚰 Água Limpa | No estilo *Pipe Dream*: colocar os canos da fila na grade antes que a água saia da estação, e levá-la pelo maior caminho possível sem vazar (botão **Acelerar** solta a água mais rápido) |
| ⚡ Rede de Energia | Ligar usinas a cidades até cobrir a demanda, que sobe com o tempo |
| 🌪️ Filtro de Carbono | Tocar nas partículas de CO2 que caem, evitando o O2 |
| 🧬 Restauração Genética | Jogo da memória com os pares do DNA (A–T, G–C) |
| 🔥 Contenção de Incêndio | O fogo começa em 2 ou 3 focos e se espalha — apagar antes que queime a floresta |
| 🤝 Cúpula das Facções | Manter a satisfação das 4 facções alta enquanto ela cai a cada segundo |

Para testar os minigames sem jogar a campanha, abra [`test-minigames.html`](test-minigames.html).

## 🏁 Os 6 finais

| Final | Nome | Condição resumida |
|---|---|---|
| 🕵️ Secreto | A Simulação | Investigar o suficiente + confrontar ARIA no Dia 34 |
| ☠️ Apocalíptico | O Colapso | Biodiversidade, Ar e Água todos abaixo de 28% — ou as 4 facções hostis ao mesmo tempo |
| 🌱 Verde | O Novo Éden | Biodiversidade alta, Ecologistas fortes, Corporações fracas |
| 💰 Corporativo | O Ouro Verde | Corporações, Créditos, Povo e Biodiversidade todos acima da meta ao mesmo tempo |
| 🤖 Tecnológico | A Singularidade | Energia Limpa alta e Tecnocratas dominantes |
| ⚖️ Equilibrado | O Meio Termo | O final padrão, quando nenhuma das condições acima bate |

Cada final tem sua própria tela de encerramento, trilha musical, badge e mensagem temática. Caminhos testados (com taxa de sucesso real de cada estratégia) estão em **[GUIA-DOS-FINAIS.md](GUIA-DOS-FINAIS.md)**.

## 🏆 Conquistas

20 conquistas persistidas entre partidas — de uma por final a metas como
Speedrunner, Energy Master, Diplomata Nato ou a meta-conquista "Lenda de
Kepler-452b". Ao desbloquear uma, um toast estilo Steam aparece no canto
superior esquerdo. A lista completa — com **mistério** nas ainda não
desbloqueadas — fica no popup 🏆 **Conquistas** do menu.

## 🔊 Trilha sonora e créditos

Todo o código, narrativa e design são autorais. As faixas e efeitos abaixo são de terceiros, livres de direitos autorais para este uso — o crédito de cada uma vai para seu respectivo autor (também listado no popup "ℹ️ Sobre" do jogo):

| 🎵 Uso no jogo | Faixa | Autor |
|---|---|---|
| Clique de UI | SciTech Game - Pop Up Menu Click | Ni Sound |
| Sucesso | Delightful Animation - Win, Level up Chime | DeanKR |
| Falha | Electric Fuss - Electricity Short Single Buzz | Rick Allen |
| Avanço de dia | Medieval Adventure - Old Book Page Turn | DT Sound |
| Alarme de crise | Bright UI - Echoing Tap, Negative Alert | SoundCrib |
| Notificação | Casual UI - Pop Notification | SoundCrib |
| Transição de ato | Time to Meditate - Unleash The Treasure, Percussive Chime, Bright, Success | Jesse Gillis |
| Revelação (Dia 25) | Epic Tales - Breaking News | Gerald Clark Audio |
| 🌱 Final Verde | Circle of Life | Letra |
| 🤖 Final Tecnológico | Wake to Wonder | Sean Williams |
| 💰 Final Corporativo | Killer Instinct | Rhythm Scott |
| ⚖️ Final Equilibrado | La Boca Fiesta | Maya Belsitzman & Matan Ephrat |
| ☠️ Final Apocalíptico | Embracing | Ziv Moran |
| 🕵️ Final Secreto | Spiral Limbus | Yehezkel Raz |
| 🌲 Minigame Reflorestamento | Ice and Snow - Shoveling Snow | Daruma Audio |
| 🚰 Minigame Água Limpa | Faraway Land - Splashing Water Out Of Bucket | Vadi Sound |
| ⚡ Minigame Rede de Energia | Analog Glitches - High Voltage Electric Sparks | Dauzkobza |
| 🌪️ Minigame Filtro de Carbono | Yabby Pumping - Air Suction | Alexander Gastrell |
| 🧬 Minigame Restauração Genética | Organic UI Sounds - Lips Pop, High | Sound Ex Machina |
| 🔥 Minigame Contenção de Incêndio | Medieval Life - Extinguishing Fire, Pouring Water, Sizzling | Soundtrack Creation |
| 🤝 Minigame Cúpula das Facções | AXE DRAW, draw | BOOM Library |
| 🌌 Ambiente (loop de fundo) | Ivy | Nitzan Rom |

## ♿ Acessibilidade

- Contraste de cores verificado (WCAG AA+ em todos os pares de texto do jogo).
- Navegação por teclado nos popups e no minigame — **Esc** fecha, ou equivale a Pular/Continuar.
- Foco movido automaticamente para o título a cada troca de tela.
- `aria-live` nos pontos que mudam sozinhos (descrição do evento, status do minigame, toasts de conquista).
- Suporte a `prefers-reduced-motion`: desliga animações decorativas e a revelação progressiva de texto para quem ativou essa preferência no sistema.

## 📱 Mobile e tela cheia

- O layout foi desenhado para **paisagem**. Em telas pequenas em retrato, um aviso pede para girar o aparelho antes de liberar o jogo.
- No celular, o painel do jogo vira um **HUD de páginas deslizáveis** (Menu, Principal, Índices, Facções e Recursos) — arraste para os lados para trocar de página. O jogo sempre começa na página Principal.
- Os minigames se adaptam à tela: as grades aparecem **inteiras**, encolhendo se for preciso, sem rolagem.
- **Tela cheia obrigatória**: o jogo entra em tela cheia ao clicar em Novo Jogo ou Continuar; se sair dela, um aviso pede um toque para voltar.
- **iPhone**: o Safari não permite tela cheia em sites. O menu mostra como contornar isso — *Compartilhar → Adicionar à Tela de Início* — e, aberto pelo ícone, o jogo roda como um app, sem as barras do navegador. O conteúdo respeita o notch e a barra de gestos.
- O zoom de dois toques é desativado, para que toques rápidos nos minigames não deem zoom na tela.

## ✅ QA

Antes desta versão: sintaxe de todos os arquivos validada; os 15 eventos
autorais + 60 de preenchimento + 8 de quarta parede batendo 1:1 entre
`main.js` e `events.json`; todos os IDs usados pelo código existem no HTML,
sem funções, constantes ou estilos sem uso; os 22 arquivos de áudio
referenciados existem, são pré-carregados e tocam; os 7 minigames testados
no computador e em tela de celular; um fluxo completo (menu → tutorial →
decisão → minigame → final → conquistas) sem nenhum erro no console;
bloqueio de paisagem e navegação por teclado testados manualmente. Os 6
finais foram validados por simulação automatizada — taxas de sucesso reais
de cada estratégia em [GUIA-DOS-FINAIS.md](GUIA-DOS-FINAIS.md).

## 🗂️ Estrutura de arquivos

```
.
├── index.html           # Telas: loading, menu, tutorial, gameplay, ending, popups, modal de minigame
├── style.css             # Paleta, glow, gradientes, layout, mobile, acessibilidade
├── main.js               # GameState, motor de eventos, minigames, finais, conquistas, som
├── events.json           # Cópia legível dos dados de eventos (editar junto com main.js)
├── manifest.json         # Faz o jogo abrir como app (tela cheia) quando adicionado à tela inicial
├── test-minigames.html   # Página de teste: abre cada minigame direto, sem jogar a campanha
├── assets/               # Trilhas e efeitos sonoros (.aac)
├── GUIA-DOS-FINAIS.md    # Caminho testado, dia a dia, para cada um dos 6 finais
├── README.md             # Este arquivo
└── LICENSE               # Direitos do código e dos créditos de áudio
```

## 🛠️ Editando conteúdo

Os eventos vivem em `main.js`, nas constantes `AUTHORED_EVENTS` (dia
fixo), `FILLER_EVENTS` (pool sorteado) e `META_EVENTS` (quarta parede,
raro). `events.json` é a cópia legível para referência — ao alterar
consequências ou adicionar eventos, edite os dois juntos.

Os 6 finais e suas condições estão em `ENDINGS` e
`GameState.determineEnding()`, ambos em `main.js` (ordem de precedência:
secreto > apocalíptico > verde > corporativo > tecnológico > equilibrado
— a primeira condição que bater vence).

As conquistas estão em `ACHIEVEMENTS`; os créditos de áudio em
`MUSIC_CREDITS`; os arquivos em `AUDIO_FILES` — todos em `main.js`.

## ✍️ Sobre o autor

Criado por **Julio Cesar Siqueira Faria** para o Concurso CROPE 2026.
Código, narrativa, eventos e design de jogo são 100% autorais — os
créditos da trilha sonora de terceiros estão na seção acima e no popup
"ℹ️ Sobre" do próprio jogo.

## 📜 Licença

Todos os direitos reservados sobre o código-fonte — ver [LICENSE](LICENSE)
para os termos completos, incluindo a situação específica dos arquivos de
áudio de terceiros em `assets/`.
