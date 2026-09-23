# Guia dos Finais — TERRAFORM

Este guia mostra, para cada um dos 6 finais, uma sequência sugerida para
os 40 dias do jogo. Os dias com nome de evento são os 15 dias fixos (que
sempre acontecem, na mesma ordem, em qualquer partida); os dias marcados
como "Evento aleatório" são preenchidos por sorteio e trazem uma regra
geral (o que priorizar) em vez de uma escolha exata — não dá pra saber de
antemão qual evento vai cair ali.

**Esta versão foi testada de verdade**: cada estratégia abaixo foi rodada
20-30 vezes de forma automatizada (simulando as escolhas exatas da tabela
+ a regra dos dias aleatórios) e a taxa de sucesso citada em cada seção é
o resultado real dessas rodadas, não uma estimativa. Isso corrigiu alguns
erros da versão anterior deste guia (o Dia 1 do caminho Apocalíptico
estava errado, e o Corporativo era bem mais fácil do que o documentado).

Lembrete das condições atuais (`determineEnding()` em `main.js`), checadas
nesta ordem — a primeira que bater vence:

1. **Secreto**: `mysteryLevel >= 30` e `ariaQuestioned >= 1`
2. **Apocalíptico**: biodiversidade, ar e água todos `< 28`, OU as 4 facções `< -35`
3. **Verde**: biodiversidade `> 60`, ecologistas `> 25`, corporações `< 40`
4. **Corporativo**: corporações `> 35`, créditos `> 68`, povo `> 15`, biodiversidade `> 30`
5. **Tecnológico**: energia limpa `> 55`, tecnocratas `> 30`
6. **Meio Termo**: nenhuma das condições acima (final padrão)

> Importante: o Dia 34 ("A Confrontação") é o **único** evento do jogo que
> concede `ariaQuestioned`. Se você não quer o Final Secreto, escolha
> sempre a opção B nesse dia — não importa qual outro final você esteja
> perseguindo.

---

## 🌱 O Novo Éden (Verde) — 100% nos testes (12/12)

| Dia | Evento | Escolha | Por quê |
|---|---|---|---|
| 1 | Chegada a Kepler-452b | **B** | Biodiversidade +10, Ecologistas +15 |
| 2 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 3 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 4 | Mutirão de Reflorestamento (minigame 🌲) | **A** | Biodiversidade +8, Ecologistas +8 — jogue bem o minigame |
| 5 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 6 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 7 | O Primeiro Grande Dilema | **B** | Vetar a usina: Biodiversidade +15, Ecologistas +20 |
| 8 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 9 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 10 | Relatório de Progresso | **A** | Consolida o rumo (Ecologistas devem estar na liderança) |
| 11 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 12 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 13 | Crise da Água (minigame 💧) | **A** | Evita fortalecer Corporações |
| 14 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 15 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 16 | Projeto de Clonagem Genética (minigame 🧬) | **A** | Ecologistas +10 |
| 17 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 18 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 19 | Sobrecarga na Rede Elétrica (minigame ⚡) | **B** | Evita inflar Tecnocratas |
| 20 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 21 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 22 | Alerta Atmosférico (minigame 🌪️) | **A** | Neutro, mantém o Povo satisfeito |
| 23 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 24 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 25 | Uma Revelação Perturbadora | **A** | Ecologistas +5 |
| 26 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 27 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 28 | Incêndio Fora de Controle (minigame 🔥) | **A** | Biodiversidade +5 — jogue bem o minigame |
| 29 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 30 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 31 | Cúpula das Facções (minigame 🤝) | **A** | Neutro |
| 32 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 33 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 34 | A Confrontação | **B** | **Obrigatório** — evita o Final Secreto |
| 35 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 36 | A Véspera do Julgamento | **A** | Neutro |
| 37 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 38 | Ponto de Não-Retorno | **B** | Ecologistas +20, Biodiversidade +15, Tecnocratas -20 — decisivo |
| 39 | 🌱 Evento aleatório | — | Favoreça Biodiversidade/Ecologistas; evite Corporações |
| 40 | O Confronto Final | **B** ou A | Não afeta o final |

**Eventos aleatórios**: priorize sempre a opção que aumenta Biodiversidade
ou Ecologistas (reflorestamento, proteção de espécies, recusar resorts/
lobbies corporativos). Evite qualquer opção que aumente Corporações acima
de 40.

---

## 🤖 A Singularidade (Tecnológico) — 100% nos testes (12/12)

| Dia | Evento | Escolha | Por quê |
|---|---|---|---|
| 1 | Chegada a Kepler-452b | **A** | Energia Limpa +10, Tecnocratas +15 |
| 2 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 3 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 4 | Mutirão de Reflorestamento (minigame 🌲) | B | Não afeta o final; economiza créditos |
| 5 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 6 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 7 | O Primeiro Grande Dilema | **A** | Aprovar a usina: Energia Limpa +20, Tecnocratas +20 |
| 8 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 9 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 10 | Relatório de Progresso | A | Consolida o rumo (Tecnocratas devem liderar) |
| 11 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 12 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 13 | Crise da Água (minigame 💧) | A | Neutro para este final |
| 14 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 15 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 16 | Projeto de Clonagem Genética (minigame 🧬) | B | Créditos +10, evita fortalecer Ecologistas |
| 17 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 18 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 19 | Sobrecarga na Rede Elétrica (minigame ⚡) | **A** | Tecnocratas +8, Energia Limpa +5 — direto no alvo |
| 20 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 21 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 22 | Alerta Atmosférico (minigame 🌪️) | A | Neutro |
| 23 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 24 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 25 | Uma Revelação Perturbadora | B | Evita fortalecer Ecologistas |
| 26 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 27 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 28 | Incêndio Fora de Controle (minigame 🔥) | B | Economiza créditos, não afeta o final |
| 29 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 30 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 31 | Cúpula das Facções (minigame 🤝) | A | Neutro |
| 32 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 33 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 34 | A Confrontação | **B** | **Obrigatório** — evita o Final Secreto |
| 35 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 36 | A Véspera do Julgamento | A | Neutro |
| 37 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 38 | Ponto de Não-Retorno | **A** | Tecnocratas +20 — decisivo |
| 39 | 🤖 Evento aleatório | — | Favoreça Energia Limpa/Tecnocratas |
| 40 | O Confronto Final | A | Neutro |

**Eventos aleatórios**: priorize opções que aumentem Energia Limpa ou
Tecnocratas (pesquisa pública de energia, upgrades de ARIA, automação).
Não precisa se preocupar com Biodiversidade — este final não exige nada
dela.

---

## 💰 O Ouro Verde (Corporativo) — 75% nos testes (30/40)

Precisa de **4 condições ao mesmo tempo**: Corporações > 35, Créditos > 68,
Povo > 15 e Biodiversidade > 30. Testei a tabela fixa sozinha, a regra de
ouro sozinha (aplicada aos 40 dias) e a combinação das duas — a
**combinação é de longe a melhor**: 75% de sucesso, contra 50% só com a
regra de ouro solta em tudo. Ou seja, a tabela abaixo *importa*, não é só
um ponto de partida qualquer.

| Dia | Evento | Escolha | Por quê |
|---|---|---|---|
| 1 | Chegada a Kepler-452b | **B** | Cria colchão de Biodiversidade (+10) para gastar depois |
| 2 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 3 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 4 | Mutirão de Reflorestamento (minigame 🌲) | B | Mantém créditos; ainda soma um pouco de biodiversidade |
| 5 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 6 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 7 | O Primeiro Grande Dilema | **B** | Mais colchão de Biodiversidade (+15), sem custo de créditos |
| 8 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 9 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 10 | Relatório de Progresso | A | Créditos +5 |
| 11 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 12 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 13 | Crise da Água (minigame 💧) | **B** | Corporações +15 — grande empurrão necessário |
| 14 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 15 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 16 | Projeto de Clonagem Genética (minigame 🧬) | **B** | Créditos +10 |
| 17 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 18 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 19 | Sobrecarga na Rede Elétrica (minigame ⚡) | A | Neutro, evita ganhar mistério à toa |
| 20 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 21 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 22 | Alerta Atmosférico (minigame 🌪️) | **A** | Povo +5 — recupera o Povo perdido no Dia 13 |
| 23 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 24 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 25 | Uma Revelação Perturbadora | **A** | Povo +10 |
| 26 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 27 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 28 | Incêndio Fora de Controle (minigame 🔥) | B | Economiza créditos (ainda sobra colchão de biodiversidade) |
| 29 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 30 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 31 | Cúpula das Facções (minigame 🤝) | A | Jogue bem o minigame: acima de 65% de satisfação dá +10 créditos de bônus |
| 32 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 33 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 34 | A Confrontação | **B** | **Obrigatório** — evita o Final Secreto |
| 35 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 36 | A Véspera do Julgamento | A | Neutro |
| 37 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 38 | Ponto de Não-Retorno | **A** | Corporações +10 — ainda sobra biodiversidade do colchão |
| 39 | 💰 Evento aleatório | — | Regra de ouro (veja abaixo) |
| 40 | O Confronto Final | **B** | Povo +10 — garante passar de 15 |

**Regra de ouro (versão exata, testada)**: pense nas suas 4 metas como
**Corporações → 40, Créditos → 75, Povo → 25, Biodiversidade → 40** (um
pouco acima do mínimo de cada condição, de folga). A cada evento
aleatório, calcule a distância até a meta em cada um dos 4 indicadores
(`meta − valor atual`) e escolha a opção que **mais aumenta o indicador
com a maior distância** — mesmo que a opção pareça "sem graça" no
momento. Na prática:
- Se Créditos ou Corporações estão longe da meta: aceite lobbies e
  financiamentos corporativos ("aceitar o esquema com fiscalização",
  "aceitar o financiamento oferecido", "deixar o mercado se
  autorregular").
- Se o Povo está longe da meta: escolha festival cultural, reforma
  educacional, greve negociada, mesmo que custe créditos.
- Se a Biodiversidade está longe da meta: proteja florestas em vez de
  aprovar resorts/usinas, mesmo que custe créditos.
- Jogue os minigames de Água, Reflorestamento e Incêndio bem (e clique
  bastante na Cúpula das Facções) — eles dão bônus que ajudam a sustentar
  os 4 indicadores ao mesmo tempo.

Esse final tolera ir e voltar entre prioridades — o que ele **não** tolera
é perseguir só 1-2 indicadores e ignorar os outros até o fim. Nos testes,
as partidas que falharam quase sempre erraram por pouco em só 1 dos 4
indicadores — vale a pena tentar de novo se isso acontecer.

---

## ☠️ O Colapso (Apocalíptico) — ~35% nos testes (23/65)

| Dia | Evento | Escolha | Por quê |
|---|---|---|---|
| 1 | Chegada a Kepler-452b | **B** | ⚠️ Não escolha A: dá Tecnocratas +15, o que empurra sem querer para o Final Tecnológico mais tarde |
| 2 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 3 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 4 | Mutirão de Reflorestamento (minigame 🌲) | B | Menor ganho de biodiversidade possível; **não plante nenhuma árvore** no minigame |
| 5 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 6 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 7 | O Primeiro Grande Dilema | **A** | Biodiversidade -15 — dano direto (o ganho de Tecnocratas aqui é aceitável, é só neste dia) |
| 8 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 9 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 10 | Relatório de Progresso | A | Neutro |
| 11 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 12 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 13 | Crise da Água (minigame 💧) | **B** | Água -10; **não gire nenhum tubo** no minigame |
| 14 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 15 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 16 | Projeto de Clonagem Genética (minigame 🧬) | B | **Não vire nenhuma carta** no minigame |
| 17 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 18 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 19 | Sobrecarga na Rede Elétrica (minigame ⚡) | B | Energia Limpa -5 — também ajuda a evitar o Final Tecnológico |
| 20 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 21 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 22 | Alerta Atmosférico (minigame 🌪️) | **B** | Ar -8; **não capture CO2** no minigame |
| 23 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 24 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 25 | Uma Revelação Perturbadora | B | Neutro |
| 26 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 27 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 28 | Incêndio Fora de Controle (minigame 🔥) | **B** | Biodiversidade -5; **não apague o fogo** no minigame |
| 29 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 30 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 31 | Cúpula das Facções (minigame 🤝) | B | Neutro |
| 32 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 33 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 34 | A Confrontação | **B** | **Obrigatório** — evita o Final Secreto |
| 35 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 36 | A Véspera do Julgamento | A | Neutro |
| 37 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 38 | Ponto de Não-Retorno | **A** | Biodiversidade -15 **e** Ar -10 — dano duplo, decisivo (mantenha mesmo dando Tecnocratas +20: testei a alternativa B e ela é pior) |
| 39 | ☠️ Evento aleatório | — | Priorize dano à Água; senão, Bio/Ar. Evite aumentar Tecnocratas/Energia Limpa |
| 40 | O Confronto Final | A | Neutro |

**Eventos aleatórios**: escolha sempre a opção mais destrutiva ao meio
ambiente ("deixar a corporação resolver sozinha", "erradicação em massa
com pesticidas", "deixar os filtros automáticos tentarem sozinhos") **e
que não aumente Tecnocratas nem Energia Limpa** — nos testes, esse foi o
jeito mais comum de escorregar sem querer para o Final Tecnológico em vez
do Apocalíptico. Em **todos** os minigames, use o botão **Pular** sem
jogar de verdade — qualquer progresso real (plantar, capturar, apagar
fogo) trabalha contra você aqui.

⚠️ **A Água continua sendo o gargalo real**: nos testes, Biodiversidade e
Ar quase sempre despencam a zero sem esforço extra, mas a Água raramente
cai o suficiente sozinha. Os eventos que mais ajudam, se aparecerem:
- **Vazamento Industrial** → "deixar a corporação resolver sozinha" (Água -15)
- **Floração de Algas Tóxicas** → "isolar e deixar dissipar" (Água -10)
- **Risco de Colapso de Barragem** → "monitorar e adiar o reforço" (Água -5)
- **Seca Prolongada** → não invista em dessalinização
- **Racionamento de Água** → priorize o consumo doméstico (Água -3)

Mesmo fazendo tudo certo, este é o final mais dependente de sorte: nos
testes automatizados, ele saiu em **cerca de 1 a cada 3 partidas** — as
outras foram parar no Meio Termo (Água não caiu a tempo). Se não bater na
primeira vez, jogue de novo — a estratégia é a mesma, só depende de quais
eventos aleatórios aparecem.

---

## 🕵️ A Simulação (Secreto) — 100% nos testes (30/30)

O único requisito é o **Dia 34, opção A**. Testei inclusive jogando os
outros 39 dias inteiramente ao acaso (sem nenhum cuidado especial com
mistério) e o Final Secreto ainda saiu em 100% das vezes — o
`mysteryLevel` sobe sozinho como "ruído de fundo" de tantos eventos com
tema de mistério espalhados pelo jogo, então não é preciso caçar esses
eventos de propósito.

| Dia | Evento | Escolha | Por quê |
|---|---|---|---|
| 1 a 33 | (todos) | livre | Nenhuma dessas escolhas afeta este final |
| 34 | A Confrontação | **A** | **A única decisão que importa**: `ariaQuestioned +1`, mistério +20 |
| 35 a 40 | (todos) | livre | O final já está garantido a partir daqui |

Se você quiser reforçar o mistério mesmo assim (não é necessário, mas não
atrapalha), escolha "investigar/questionar" em eventos como "Registros
Corrompidos de ARIA", "Sinal de Origem Desconhecida", "Denunciante
Anônimo" ou qualquer evento de "quarta parede" — e opção B nos Dias 19 e
31. O resto das suas escolhas (Biodiversidade, Corporações etc.) não
importa para este final: o Secreto tem prioridade sobre todos os outros
assim que as duas condições batem.

---

## ⚖️ O Meio Termo (Equilibrado) — ~60% jogando com moderação (9/15)

É o final padrão — mas "não fazer nada de propósito" não é a estratégia
mais confiável. Testei três abordagens para os dias aleatórios:

| Abordagem | Resultado no teste |
|---|---|
| Escolha 100% aleatória em cada evento | 33% Meio Termo, 47% escorregou pro Verde, 20% pro Tecnológico |
| Sempre a opção de **menor impacto total** (soma dos valores absolutos) | **60% Meio Termo**, o resto foi pro Verde |
| Suprimir deliberadamente Biodiversidade/Ecologistas | Piorou — escorregou quase tudo pro Tecnológico |

A conclusão: **prefira sempre a opção com efeito mais discreto/moderado**,
em vez de escolher ao acaso — isso já dobra sua chance de ficar no Meio
Termo. E o maior risco de escorregar sem querer é para o **Final Verde**
(biodiversidade e ecologistas dominando), não para o Tecnológico.

| Dia | Evento | Escolha | Por quê |
|---|---|---|---|
| 1 | Chegada a Kepler-452b | livre | Prefira a opção de efeito mais discreto |
| 2 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 3 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 4 | Mutirão de Reflorestamento (minigame 🌲) | livre | Não precisa jogar bem nem mal |
| 5 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 6 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 7 | O Primeiro Grande Dilema | livre | Prefira a opção de efeito mais discreto |
| 8 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 9 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 10 | Relatório de Progresso | livre | Prefira a opção de efeito mais discreto |
| 11 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 12 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 13 | Crise da Água (minigame 💧) | livre | Prefira a opção de efeito mais discreto |
| 14 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 15 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 16 | Projeto de Clonagem Genética (minigame 🧬) | livre | Prefira a opção de efeito mais discreto |
| 17 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 18 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 19 | Sobrecarga na Rede Elétrica (minigame ⚡) | livre | Prefira a opção de efeito mais discreto |
| 20 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 21 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 22 | Alerta Atmosférico (minigame 🌪️) | livre | Prefira a opção de efeito mais discreto |
| 23 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 24 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 25 | Uma Revelação Perturbadora | livre | Prefira a opção de efeito mais discreto |
| 26 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 27 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 28 | Incêndio Fora de Controle (minigame 🔥) | livre | Prefira a opção de efeito mais discreto |
| 29 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 30 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 31 | Cúpula das Facções (minigame 🤝) | livre | Prefira a opção de efeito mais discreto |
| 32 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 33 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 34 | A Confrontação | **B** | **Obrigatório** — não confronte ARIA, senão vira Secreto |
| 35 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 36 | A Véspera do Julgamento | livre | Prefira a opção de efeito mais discreto |
| 37 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 38 | Ponto de Não-Retorno | livre | Qualquer lado — os dois são igualmente decisivos, escolha o que fugir menos do que já vinha fazendo |
| 39 | ⚖️ Evento aleatório | livre | Prefira a opção de efeito mais discreto |
| 40 | O Confronto Final | livre | Não afeta o final |

**Dica prática**: de vez em quando, dê uma olhada nas Facções no HUD. Se
Ecologistas estiver muito à frente de tudo o mais (e Corporações muito
baixo), você está escorregando pro Verde — escolha a próxima opção
tecnocrata/corporativa disponível para reequilibrar, mesmo que pareça
contra a mão.
