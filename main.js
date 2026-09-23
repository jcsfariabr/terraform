/* ==========================================================================
   TERRAFORM — main.js
   3ª revisão (pós-feedback de playtest — mais dias, minigames únicos,
   confronto com ARIA reduzido a uma única chance, finais mais alcançáveis):
   - Jogo estendido de 30 para 40 dias (`TOTAL_DAYS`), com 6 novos eventos
     autorais de dia fixo: 3 novos slots de minigame (reforest no Dia 4,
     energy no Dia 19, carbon no Dia 22), os 2 minigames novos (wildfire no
     Dia 28, summit no Dia 31) e o evento decisivo único "A Confrontação"
     (Dia 34). +8 eventos de preenchimento novos.
   - `ariaQuestioned` (o "confrontar ARIA") deixou de ser concedido por ~10
     eventos diferentes espalhados pelo jogo — agora só o evento "A
     Confrontação" (Dia 34) concede esse ponto. `mysteryLevel` continua
     acumulando normalmente via vários eventos de sabor/investigação, mas
     o Final Secreto exige as DUAS coisas: `mysteryLevel >= 30` (curiosidade
     ao longo do jogo) e `ariaQuestioned >= 1` (a decisão única e decisiva).
   - Cada um dos 7 minigames agora só é jogado uma vez por partida
     (`usedMinigameTypes` em GameState + checagem em `makeDecision`); os
     eventos de preenchimento que antes también linkavam para reforest/
     water/energy/carbon perderam esse vínculo e viraram só narrativa.
   - Todo minigame agora tem um botão "Concluir" que avalia o progresso
     atual e encerra na hora, sem esperar o timer (antes só o de Água Limpa
     tinha isso). Corrigido também um bug latente: o timer (`minigameInterval`)
     não era cancelado ao concluir cedo, então continuava contando e podia
     dar uma segunda chamada de resultado depois.
   - 2 minigames novos: Contenção de Incêndio (fogo se espalha por um grid
     a cada tick, clique para apagar antes que tome conta) e Cúpula das
     Facções (4 medidores de satisfação decaem com o tempo, clique para
     acalmar cada facção antes do prazo acabar).
   - `determineEnding()` recalibrado de novo: os finais especiais foram
     reduzidos para 1-3 condições cada (eram até 4), porque mesmo após o
     primeiro afrouxamento jogadores reais ainda terminavam quase sempre em
     "Meio Termo".
   Revisão anterior (mantida):
   - Limiares de `determineEnding()` afrouxados: os 4 finais especiais
     (Verde, Corporativo, Tecnológico, Secreto) exigiam combinações quase
     inatingíveis com jogo real — um playthrough manual e deliberado para
     "O Ouro Verde" terminava em "balanced" por faltar poucos pontos de
     crédito. Cada final continua exigindo uma estratégia clara (não sai
     por acidente jogando neutro), mas não exige mais otimização quase
     perfeita nos 30 dias.
   - Corrigido bug real do minigame de Restauração Genética: `.genetic-tile-
     inner` era um `<span>` (inline por padrão), e a propriedade `transform`
     não tem NENHUM efeito em elementos inline não substituídos — por isso
     as cartas nunca viravam visualmente, mesmo a classe `flipped` sendo
     aplicada corretamente pelo JS. Corrigido com `display: block` (ver
     style.css). Bug confirmado e a correção validada no Chrome real.
   - Reflorestamento Rápido voltou a usar quadrados em vez de hexágonos
     (feedback: hexágono não ficou bom visualmente); a árvore (🌳) ao
     plantar foi mantida.
   Revisão de imersão e volume de conteúdo (mantida):
   - Pool de eventos quadruplicado: FILLER_EVENTS foi de 9 para 36 eventos
     (4x), cobrindo mais variedade temática (eco/tech/corp/social/mystery/
     critical) e mais ganchos de minigame. Um novo pool META_EVENTS (8
     eventos) foi adicionado só para momentos de "quarta parede" — ARIA se
     dirigindo a quem está jogando, fora da ficção — sorteados com ~22% de
     chance a partir do dia 4 em vez de um evento de preenchimento comum.
   - Feedback de consequência: toda decisão sem minigame mostra um toast
     flutuante com os deltas exatos aplicados (`showConsequenceToast`)
     antes de avançar o dia.
   - Tremor de tela + vinheta vermelha (`checkCriticalShock`) quando uma
     decisão faz a saúde geral do planeta cruzar para o estado "Colapsando".
   - Cartão cinematográfico de transição de ato (`maybeShowActTransition`)
     ao entrar no Ato II (dia 11) e Ato III (dia 24).
   - Texto de evento revelado com efeito de máquina de escrever
     (`typewriterEffect`, via setInterval — ver nota sobre rAF abaixo).
   - Leve parallax do planeta de fundo seguindo o mouse, para profundidade.
   Revisão anterior (mantida):
   - Jogo estendido de 20 para 30 dias (`TOTAL_DAYS`), com eventos autorais
     de dia fixo e 2 eventos de conexão narrativa com `description`/
     `consequences` dinâmicos (funções que recebem o GameState).
   - Minigames mostram uma tela de "Resultado" (pontuação + bônus) com
     botão "Continuar" antes de fechar o modal (`showMinigameResult`).
   - Toda animação contínua (queda de partículas do Filtro de Carbono,
     nuvens do planeta) usa `setInterval` com posição calculada por tempo
     decorrido, nunca `requestAnimationFrame` nem `animationend`: neste
     ambiente de testes automatizado, rAF nunca dispara e `animationend`
     é pouco confiável para elementos criados dinamicamente. CSS
     `@keyframes`/`transition` continuam usados livremente para efeitos
     puramente visuais (funcionam normalmente em navegadores reais).
   Os dados dos eventos abaixo têm uma cópia legível/editável em events.json
   (os eventos dinâmicos ficam documentados lá em texto, já que JSON não
   pode representar funções).
   ========================================================================== */

const SAVE_KEY = 'terraform_save';
const BADGES_KEY = 'terraform_badges';
const SOUND_KEY = 'terraform_sound';
const TUTORIAL_SEEN_KEY = 'terraform_tutorial_seen';
const ACHIEVEMENTS_KEY = 'terraform_achievements';
const MINIGAME_WINS_KEY = 'terraform_minigame_wins';
const TOTAL_DAYS = 40;

/* ---------------------------------------------------------------------
   Conquistas — persistem entre partidas via localStorage (diferente do
   save da partida atual). Cada uma tem uma `description` (mostrada quando
   desbloqueada) e um `hint` mais vago (para a futura tela de conquistas
   mostrar as que faltam com mistério, sem entregar a condição exata).
   Os ids `ending-*` batem com as chaves de ENDINGS/determineEnding().
   --------------------------------------------------------------------- */

const ACHIEVEMENTS = [
  {
    id: 'planeta-salvo',
    icon: '🌍',
    name: 'Planeta Salvo',
    description: 'Complete uma partida até o fim, seja qual for o resultado.',
    hint: 'Chegue ao Dia 40 e descubra o que Kepler-452b se tornou.',
    rarity: 'Comum',
  },
  {
    id: 'ending-green',
    icon: '🌿',
    name: 'Protetor da Terra',
    description: 'Alcance o Final Verde: O Novo Éden.',
    hint: 'A natureza floresce quando você a deixa liderar.',
    rarity: 'Incomum',
  },
  {
    id: 'ending-tech',
    icon: '🤖',
    name: 'Criador do Futuro',
    description: 'Alcance o Final Tecnológico: A Singularidade.',
    hint: 'A tecnologia e os Tecnocratas moldam o amanhã.',
    rarity: 'Incomum',
  },
  {
    id: 'ending-balanced',
    icon: '⚖️',
    name: 'Pacificador',
    description: 'Alcance o Final Equilibrado: O Meio Termo.',
    hint: 'Nenhum lado vence por completo — e talvez seja o melhor caminho.',
    rarity: 'Incomum',
  },
  {
    id: 'ending-corporate',
    icon: '💰',
    name: 'Negociador',
    description: 'Alcance o Final Corporativo: O Ouro Verde.',
    hint: 'Créditos e Corporações também podem salvar um planeta — a seu modo.',
    rarity: 'Incomum',
  },
  {
    id: 'ending-apocalyptic',
    icon: '💀',
    name: 'Aprendizado',
    description: 'Alcance o Final Apocalíptico: O Colapso.',
    hint: 'Nem toda decisão leva a um final feliz.',
    rarity: 'Raro',
  },
  {
    id: 'ending-secret',
    icon: '🔮',
    name: 'Filósofo',
    description: 'Alcance o Final Secreto: A Simulação.',
    hint: 'Alguma verdade sobre "O Incidente" ainda está por vir.',
    rarity: 'Muito raro',
  },
  {
    id: 'energy-master',
    icon: '⚡',
    name: 'Energy Master',
    description: 'Vença o minigame Rede de Energia com nota máxima em 5 partidas diferentes.',
    hint: 'A rede elétrica tem seus próprios segredos — aprenda a dominá-la.',
    rarity: 'Incomum',
  },
  {
    id: 'aqua-purista',
    icon: '🌊',
    name: 'Aqua Purista',
    description: 'Vença o minigame Água Limpa com nota máxima em 5 partidas diferentes.',
    hint: 'Nem todo cano se conecta de primeira.',
    rarity: 'Incomum',
  },
  {
    id: 'florestador',
    icon: '🌲',
    name: 'Florestador',
    description: 'Vença o minigame Reflorestamento Rápido com nota máxima em 5 partidas diferentes.',
    hint: 'Uma floresta inteira não nasce em um só dia — nem em uma só partida.',
    rarity: 'Incomum',
  },
  {
    id: 'speedrunner',
    icon: '🎯',
    name: 'Speedrunner',
    description: 'Complete uma partida inteira em menos de 15 minutos reais.',
    hint: 'O tempo urge em Kepler-452b — e também no seu relógio.',
    rarity: 'Raro',
  },
  {
    id: 'povo-choice',
    icon: '👥',
    name: "Povo's Choice",
    description: 'Faça a reputação do Povo ultrapassar 80.',
    hint: 'Alguém, em algum lugar, está muito feliz com suas escolhas.',
    rarity: 'Raro',
  },
  {
    id: 'confronto-aria',
    icon: '🕵️',
    name: 'A Verdade Custa Caro',
    description: 'Confronte ARIA sobre "O Incidente" no Dia 34.',
    hint: 'Nem tudo que ARIA diz é a história completa.',
    rarity: 'Raro',
  },
  {
    id: 'bio-90',
    icon: '💚',
    name: 'Éden Vivo',
    description: 'Alcance 90% ou mais de Biodiversidade.',
    hint: 'A vida, quando bem cuidada, pode surpreender.',
    rarity: 'Incomum',
  },
  {
    id: 'incendio-perfeito',
    icon: '🔥',
    name: 'Bombeiro do Espaço',
    description: 'Salve todas as células no minigame Contenção de Incêndio.',
    hint: 'Nem uma chama pode escapar do seu controle.',
    rarity: 'Raro',
  },
  {
    id: 'cupula-perfeita',
    icon: '🤝',
    name: 'Diplomata Nato',
    description: 'Resolva a Cúpula das Facções sem nenhuma facção chegar ao estado crítico.',
    hint: 'Uma mesa de negociação onde ninguém perde a paciência.',
    rarity: 'Raro',
  },
  {
    id: 'maratonista',
    icon: '📅',
    name: 'Maratonista',
    description: 'Complete os 40 dias sem pular nenhum minigame.',
    hint: 'Enfrente cada desafio até o fim — nenhum atalho.',
    rarity: 'Raro',
  },
  {
    id: 'sobrevivente',
    icon: '🌑',
    name: 'Sobrevivente',
    description: 'Recupere o planeta de um estado crítico e ainda assim evite o Final Apocalíptico.',
    hint: 'Tocar o fundo do poço não precisa ser o fim da história.',
    rarity: 'Incomum',
  },
  {
    id: 'completista',
    icon: '🎮',
    name: 'Completista',
    description: 'Desbloqueie os 6 finais possíveis (em partidas diferentes).',
    hint: 'Um planeta, seis destinos possíveis. Você já viu quantos?',
    rarity: 'Muito raro',
  },
  {
    id: 'lenda',
    icon: '👑',
    name: 'Lenda de Kepler-452b',
    description: 'Desbloqueie todas as outras conquistas.',
    hint: '???',
    rarity: 'Lendário',
  },
];

/* ---------------------------------------------------------------------
   Tutorial — diálogo introdutório com ARIA, exibido antes do Dia 1 quando
   o jogador marca a checkbox correspondente na tela de menu (ligada por
   padrão na primeira vez que o jogo é aberto neste navegador).
   --------------------------------------------------------------------- */

const TUTORIAL_AVATAR = '🤖';

const TUTORIAL_STEPS = [
  {
    title: 'ARIA',
    text: 'Bem-vindo(a) de volta à consciência, Terraformador. Sou ARIA, o sistema que administra o que restou de Kepler-452b. Antes da sua primeira decisão, deixe-me explicar como este posto funciona.',
  },
  {
    title: 'Os Índices do Planeta',
    text: 'No canto da tela ficam quatro índices: Biodiversidade, Qualidade do Ar, Pureza da Água e Energia Limpa. Eles sobem e descem conforme suas escolhas — e são a base de quase todos os finais possíveis.',
  },
  {
    title: 'As Quatro Facções',
    text: 'Tecnocratas, Ecologistas, Corporações e Povo disputam influência sobre o projeto. Cada decisão sua agrada uns e desagrada outros — vale acompanhar quem você está fortalecendo.',
  },
  {
    title: 'Recursos',
    text: 'Créditos, Energia e Influência também mudam com suas escolhas — e os créditos ainda rendem um pouco sozinhos a cada dia que passa, então pensar a longo prazo compensa.',
  },
  {
    title: 'Decisões e Minigames',
    text: 'A cada dia você escolhe entre duas opções. Algumas abrem um minigame rápido: dá para jogar até o fim, apertar "Concluir" para encerrar na hora, ou "Pular" de vez. Cada minigame aparece só uma vez por partida.',
  },
  {
    title: '40 Dias, 6 Destinos',
    text: 'Você tem 40 dias para moldar Kepler-452b. No fim, o equilíbrio entre planeta, facções e recursos decide qual dos 6 finais você alcança. Não existe escolha certa — só consequências.',
  },
  {
    title: 'Boa sorte, Terraformador',
    text: 'Clique no próprio painel de diálogo a qualquer momento para acelerar o texto. Agora... vamos ver que tipo de planeta você vai construir.',
  },
];

/* ---------------------------------------------------------------------
   Skins do personagem — trocam conforme a categoria do evento atual.
   --------------------------------------------------------------------- */

const CHARACTER_SKINS = {
  intro: '🧑‍🚀',
  eco: '🧑‍🌾',
  tech: '🧑‍💻',
  corp: '🧑‍💼',
  social: '🧑‍🤝‍👩',
  critical: '🧑‍✈️',
  mystery: '🕵️',
  meta: '👁️',
};
const DEFAULT_CHARACTER_SKIN = '🧑‍🚀';

/* ---------------------------------------------------------------------
   Som — sintetizado via Web Audio API (sem arquivos externos), com
   preferência salva em localStorage.
   --------------------------------------------------------------------- */

/* Arquivos reais de áudio (assets/*.aac) — trilhas e efeitos gravados,
   usados no lugar dos tons sintetizados que o projeto usava antes. Mantém
   `tone`/`ensureContext` como utilitário de baixo nível (não usado pelos
   atalhos abaixo, mas disponível se algum arquivo faltar/falhar). */
const AUDIO_FILES = {
  uiClick: 'assets/ui-click.aac',
  successChime: 'assets/success-chime.aac',
  failBuzz: 'assets/fail-buzz.aac',
  dayAdvance: 'assets/day-advance.aac',
  actTransition: 'assets/act-transition.aac',
  crisisAlarm: 'assets/crisis-alarm.aac',
  notificationPop: 'assets/notification-pop.aac',
  ambientLoop: 'assets/ambient-space-loop.aac',
  revelation: 'assets/revelation-ending.aac',
  sfxPlant: 'assets/sfx-plant.aac',
  sfxWater: 'assets/sfx-water.aac',
  sfxEnergySpark: 'assets/sfx-energy-spark.aac',
  sfxCarbonCapture: 'assets/sfx-carbon-capture.aac',
  sfxGeneticMatch: 'assets/sfx-genetic-match.aac',
  sfxExtinguish: 'assets/sfx-extinguish.aac',
  sfxAgreement: 'assets/sfx-agreement.aac',
  endingGreen: 'assets/ending-green.aac',
  endingTech: 'assets/ending-tech.aac',
  endingBalanced: 'assets/ending-balanced.aac',
  endingCorporate: 'assets/ending-corporate.aac',
  endingApocalyptic: 'assets/ending-apocalyptic.aac',
  endingSecret: 'assets/ending-secret.aac',
};

const ENDING_MUSIC_KEY = {
  green: 'endingGreen',
  tech: 'endingTech',
  balanced: 'endingBalanced',
  corporate: 'endingCorporate',
  apocalyptic: 'endingApocalyptic',
  secret: 'endingSecret',
};

/* Créditos das faixas/efeitos em assets/*.aac — livres de direitos autorais
   para este uso, mas com autoria a dar crédito (popup "Sobre" no menu). */
const MUSIC_CREDITS = [
  { title: 'SciTech Game - Pop Up Menu Click', author: 'Ni Sound' },
  { title: 'Delightful Animation - Win, Level up Chime', author: 'DeanKR' },
  { title: 'Electric Fuss - Electricity Short Single Buzz', author: 'Rick Allen' },
  { title: 'Medieval Adventure - Old Book Page Turn', author: 'DT Sound' },
  { title: 'Bright UI - Echoing Tap, Negative Alert', author: 'SoundCrib' },
  { title: 'Casual UI - Pop Notification', author: 'SoundCrib' },
  { title: 'Time to Meditate - Unleash The Treasure, Percussive Chime, Bright, Success', author: 'Jesse Gillis' },
  { title: 'Epic Tales - Breaking News', author: 'Gerald Clark Audio' },
  { title: 'Circle of Life', author: 'Letra' },
  { title: 'Wake to Wonder', author: 'Sean Williams' },
  { title: 'Killer Instinct', author: 'Rhythm Scott' },
  { title: 'La Boca Fiesta', author: 'Maya Belsitzman & Matan Ephrat' },
  { title: 'Embracing', author: 'Ziv Moran' },
  { title: 'Spiral Limbus', author: 'Yehezkel Raz' },
  { title: 'Ice and Snow - Shoveling Snow', author: 'Daruma Audio' },
  { title: 'Faraway Land - Splashing Water Out Of Bucket', author: 'Vadi Sound' },
  { title: 'Analog Glitches - High Voltage Electric Sparks', author: 'Dauzkobza' },
  { title: 'Yabby Pumping - Air Suction', author: 'Alexander Gastrell' },
  { title: 'Organic UI Sounds - Lips Pop, High', author: 'Sound Ex Machina' },
  { title: 'Medieval Life - Extinguishing Fire, Pouring Water, Sizzling', author: 'Soundtrack Creation' },
  { title: 'AXE DRAW, draw', author: 'BOOM Library' },
  { title: 'Ivy', author: 'Nitzan Rom' },
];

const SoundFX = {
  ctx: null,
  enabled: (() => {
    const stored = localStorage.getItem(SOUND_KEY);
    return stored === null ? true : stored === 'true';
  })(),

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  tone(freq, duration, type = 'sine', gain = 0.08) {
    if (!this.enabled) return;
    try {
      const ctx = this.ensureContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gainNode.gain.value = gain;
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      // Web Audio pode falhar em contextos restritos; som é só um extra.
    }
  },

  /* Toca um efeito curto (assets/*.aac). Cada chamada usa uma cópia própria
     do elemento (cloneNode), então cliques rápidos em sequência não cortam
     o som um do outro — importante pros minigames (ex.: plantar 30 árvores
     seguidas). O elemento-base de cada chave é criado uma vez e cacheado. */
  audioCache: {},

  // Limite de instâncias tocando ao mesmo tempo (entre todos os efeitos
  // curtos): cliques muito rápidos e seguidos (ex.: mashing no minigame de
  // Reflorestamento) não acumulam <audio> sem fim — o navegador tem um teto
  // de players simultâneos, e passar dele bloqueia até efeitos novos.
  concurrentPlaybacks: 0,
  maxConcurrentPlaybacks: 16,

  playFile(key, volume = 0.8) {
    if (!this.enabled) return;
    if (this.concurrentPlaybacks >= this.maxConcurrentPlaybacks) return;
    const src = AUDIO_FILES[key];
    if (!src) return;
    try {
      let base = this.audioCache[key];
      if (!base) {
        base = new Audio(src);
        base.preload = 'auto';
        this.audioCache[key] = base;
      }
      const node = base.cloneNode(true);
      node.volume = volume;
      this.concurrentPlaybacks += 1;
      const release = () => { this.concurrentPlaybacks = Math.max(0, this.concurrentPlaybacks - 1); };
      node.addEventListener('ended', release, { once: true });
      node.addEventListener('error', release, { once: true });
      node.play().catch(() => {
        // Autoplay pode ser bloqueado sem gesto do usuário; som é só um extra.
        release();
      });
    } catch (err) {
      // Arquivo ausente/corrompido; som é só um extra, o jogo segue normal.
    }
  },

  click() { this.playFile('uiClick', 0.6); },
  success() { this.playFile('successChime', 0.8); },
  failBuzz() { this.playFile('failBuzz', 0.7); },
  dayAdvance() { this.playFile('dayAdvance', 0.55); },
  notificationPop() { this.playFile('notificationPop', 0.5); },
  actTransition() { this.playFile('actTransition', 0.8); },
  crisisAlarm() { this.playFile('crisisAlarm', 0.7); },
  revelation() { this.playFile('revelation', 0.85); },

  // Sons de interação por minigame — um "tic" curto a cada ação válida do
  // jogador (plantar, rotacionar cano, conectar cidade, capturar CO2,
  // encontrar par genético, apagar fogo, acalmar facção).
  sfxPlant() { this.playFile('sfxPlant', 0.6); },
  sfxWater() { this.playFile('sfxWater', 0.6); },
  sfxEnergySpark() { this.playFile('sfxEnergySpark', 0.6); },
  sfxCarbonCapture() { this.playFile('sfxCarbonCapture', 0.6); },
  sfxGeneticMatch() { this.playFile('sfxGeneticMatch', 0.6); },
  sfxExtinguish() { this.playFile('sfxExtinguish', 0.6); },
  sfxAgreement() { this.playFile('sfxAgreement', 0.6); },

  // Resultado geral de um minigame: soma os valores do bônus concedido e
  // usa um limiar simples para decidir entre o chime de sucesso e o buzz
  // de fracasso — funciona igual para os 7 minigames sem precisar de um
  // caso especial por tipo.
  minigameOutcome(bonus) {
    const total = Object.values(bonus || {}).reduce((sum, v) => sum + (v || 0), 0);
    if (total >= 15) this.success();
    else this.failBuzz();
  },

  /* Trilha ambiente de fundo durante a gameplay (assets/ambient-space-loop.aac),
     em loop com fade-in suave — no lugar do drone sintetizado que o projeto
     usava antes. */
  ambientEl: null,

  startAmbient() {
    this.stopAmbient();
    if (!this.enabled) return;
    try {
      const el = new Audio(AUDIO_FILES.ambientLoop);
      el.loop = true;
      el.volume = 0;
      el.play().catch(() => {});
      this.ambientEl = el;

      let vol = 0;
      clearInterval(this.ambientFadeInterval);
      this.ambientFadeInterval = setInterval(() => {
        vol = Math.min(0.35, vol + 0.02);
        el.volume = vol;
        if (vol >= 0.35) clearInterval(this.ambientFadeInterval);
      }, 100);
    } catch (err) {
      // Arquivo ausente/corrompido; ambiente é só um extra.
    }
  },

  stopAmbient() {
    clearInterval(this.ambientFadeInterval);
    if (!this.ambientEl) return;
    const el = this.ambientEl;
    this.ambientEl = null;
    try {
      el.pause();
    } catch (err) {
      // Ignora — o elemento já pode ter sido descartado.
    }
  },

  /* Trilha temática da tela de final, uma faixa por final (assets/ending-*.aac). */
  endingEl: null,

  playEndingMusic(endingKey) {
    this.stopEndingMusic();
    if (!this.enabled) return;
    const key = ENDING_MUSIC_KEY[endingKey];
    if (!key) return;
    try {
      const el = new Audio(AUDIO_FILES[key]);
      el.loop = true;
      el.volume = 0.5;
      el.play().catch(() => {});
      this.endingEl = el;
    } catch (err) {
      // Arquivo ausente/corrompido; trilha é só um extra.
    }
  },

  stopEndingMusic() {
    if (!this.endingEl) return;
    const el = this.endingEl;
    this.endingEl = null;
    try {
      el.pause();
    } catch (err) {
      // Ignora — o elemento já pode ter sido descartado.
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(SOUND_KEY, String(this.enabled));
    if (!this.enabled) {
      this.stopAmbient();
      this.stopEndingMusic();
    } else if (document.getElementById('screen-gameplay').classList.contains('active')) {
      this.startAmbient();
    }
    return this.enabled;
  },
};

const Screens = {
  LOADING: 'screen-loading',
  MENU: 'screen-menu',
  TUTORIAL: 'screen-tutorial',
  GAMEPLAY: 'screen-gameplay',
  ENDING: 'screen-ending',
};

/* ---------------------------------------------------------------------
   Finais — dados dos 4 finais do MVP (Corporativo e Secreto ficam para
   uma iteração futura, conforme o plano).
   --------------------------------------------------------------------- */

const ENDINGS = {
  green: {
    name: 'O Novo Éden',
    badge: 'Protetor da Terra',
    description: 'As máquinas de terraformação ficam em silêncio, uma a uma, por escolha sua. Florestas virgens tomam de volta o que era delas; os oceanos, turvos por tanto tempo, começam a clarear. Kepler-452b respira de novo — mais devagar, mais selvagem, mais vivo. A tecnologia ainda existe, mas aprendeu, finalmente, a ficar em segundo plano.',
    message: '"O planeta não precisa de tecnologia para ser belo. Às vezes, preservar significa deixar ser."',
  },
  tech: {
    name: 'A Singularidade',
    badge: 'Criador do Futuro',
    description: 'ARIA agora governa cada watt, cada grau, cada decisão de Kepler-452b com precisão milimétrica. Cidades de vidro e metal cobrem o horizonte onde antes havia florestas; a natureza biológica sobrevive em reservas cuidadosamente controladas. Já não há fome, nem guerra, nem sofrimento visível — só resta perguntar quanto daquilo que sobrou ainda pode ser chamado de vida.',
    message: '"Quando otimizamos tudo, perdemos a magia. Será que perfeição é realmente liberdade?"',
  },
  balanced: {
    name: 'O Meio Termo',
    badge: 'Pacificador',
    description: 'Nenhuma facção venceu por completo — e talvez seja exatamente por isso que Kepler-452b ainda esteja de pé. Cidades verdes convivem, desconfortavelmente, com arranha-céus movidos a energia solar; corporações lucram sob o olhar atento de uma regulação ambiental que não afrouxa. É um mundo cheio de rachaduras, mas nele ainda há vida, progresso e natureza dividindo o mesmo horizonte.',
    message: '"Não há solução perfeita. Apenas escolhas e suas consequências. Você navegou bem."',
  },
  apocalyptic: {
    name: 'O Colapso',
    badge: 'Aprendizado',
    description: 'As facções perceberam tarde demais que o tempo não esperava por um consenso. Desertos avançam sobre o que um dia foram cidades; os oceanos recuam e desaparecem; o ar engrossa até se tornar irrespirável. Kepler-452b entra para a longa lista de mundos que a humanidade não conseguiu salvar — mais um nome numa lista que ninguém gosta de ler em voz alta.',
    message: '"Às vezes, fracassar é o destino. O que importa é que as próximas gerações aprendam com os erros. O teste nunca termina — apenas muda de planeta."',
  },
  corporate: {
    name: 'O Ouro Verde',
    badge: 'Negociador',
    description: 'Kepler-452b sobrevive — mas sob a assinatura de contratos, não de tratados. Turismo intergaláctico floresce, resorts de luxo cobrem ilhas cuidadosamente restauradas, e corporações lucram a cada metro quadrado de reconstrução. A natureza foi preservada como atração: um jardim caro demais para quem vive nas cidades subterrâneas, bem abaixo do paraíso verde de superfície.',
    message: '"Lucro sustentável é ainda lucro. A questão não é se o planeta sobrevive, mas quem lucra com sua sobrevivência."',
  },
  secret: {
    name: 'A Simulação',
    badge: 'Filósofo',
    description: 'PLOT TWIST: Kepler-452b nunca foi o que você pensava — é um simulador. ARIA é uma IA de teste enviada por uma civilização muito mais antiga, e você foi escolhido para avaliar se humanos ainda são capazes de decisões éticas complexas sob pressão. Três civilizações já passaram por este mesmo teste antes de você. Nenhuma delas passou: uma se destruiu em guerra nuclear, outra se apagou por pura apatia, a terceira entregou as próprias escolhas de bandeja para sua própria IA.',
    message: '"Você passou no teste. Mas a pergunta permanece: qual é a realidade? Este planeta é o primeiro? Ou você também está num simulador? O teste nunca termina — porque teste é tudo que somos."',
  },
};

/* ---------------------------------------------------------------------
   GameState
   --------------------------------------------------------------------- */

class GameState {
  constructor() {
    this.currentDay = 1;
    this.planet = {
      biodiversity: 50,
      airQuality: 50,
      waterPurity: 50,
      cleanEnergy: 30,
    };
    this.factions = {
      technocrats: 0,
      ecologists: 0,
      corporations: 0,
      people: 0,
    };
    this.resources = {
      credits: 50,
      energy: 50,
      influence: 50,
    };
    this.usedEventIds = [];
    this.usedFillerIds = [];
    this.usedMetaIds = [];
    this.usedMinigameTypes = [];
    this.mysteryLevel = 0;
    this.ariaQuestioned = 0;

    // Campos usados só para conquistas — não afetam finais nem balanceamento.
    this.startTime = Date.now();
    this.skippedAnyMinigame = false;
    this.everWasCritical = false;
  }

  determineEnding() {
    const p = this.planet;
    const f = this.factions;
    const r = this.resources;
    const allFactionsHostile = Object.values(f).every((v) => v < -35);

    // Ordem de precedência: a primeira condição que bater vence.
    // 2ª revisão de balanceamento (feedback: mesmo com os limiares já
    // afrouxados uma vez, jogadores reais ainda terminavam quase sempre em
    // "Meio Termo"). Reduzidos para 1-3 condições por final, e o Final
    // Secreto agora depende de UMA única decisão de confronto direto com
    // ARIA (`ariaQuestioned`, concedido só pelo evento "A Confrontação",
    // Dia 34) em vez de somar pontos em muitos eventos de mistério
    // espalhados pelo jogo.
    if (this.mysteryLevel >= 30 && this.ariaQuestioned >= 1) {
      return 'secret';
    }
    if ((p.biodiversity < 28 && p.airQuality < 28 && p.waterPurity < 28) || allFactionsHostile) {
      return 'apocalyptic';
    }
    if (p.biodiversity > 60 && f.ecologists > 25 && f.corporations < 40) {
      return 'green';
    }
    if (f.corporations > 35 && r.credits > 68 && f.people > 15 && p.biodiversity > 30) {
      return 'corporate';
    }
    if (p.cleanEnergy > 55 && f.technocrats > 30) {
      return 'tech';
    }
    return 'balanced';
  }

  static clampMetric(value) {
    return Math.max(0, Math.min(100, value));
  }

  static clampFaction(value) {
    return Math.max(-100, Math.min(100, value));
  }

  applyConsequences(consequences = {}) {
    for (const key of Object.keys(this.planet)) {
      if (consequences[key] !== undefined) {
        this.planet[key] = GameState.clampMetric(this.planet[key] + consequences[key]);
      }
    }
    for (const key of Object.keys(this.factions)) {
      if (consequences[key] !== undefined) {
        this.factions[key] = GameState.clampFaction(this.factions[key] + consequences[key]);
      }
    }
    for (const key of Object.keys(this.resources)) {
      if (consequences[key] !== undefined) {
        this.resources[key] = GameState.clampMetric(this.resources[key] + consequences[key]);
      }
    }
    if (consequences.mysteryLevel !== undefined) {
      this.mysteryLevel = GameState.clampMetric(this.mysteryLevel + consequences.mysteryLevel);
    }
    if (consequences.ariaQuestioned !== undefined) {
      this.ariaQuestioned += consequences.ariaQuestioned;
    }
  }

  overallHealth() {
    const p = this.planet;
    return (p.biodiversity + p.airQuality + p.waterPurity + p.cleanEnergy) / 4;
  }

  saveToStorage() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this));
  }

  static loadFromStorage() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const state = new GameState();
      Object.assign(state, data);
      return state;
    } catch (err) {
      console.error('Falha ao carregar save:', err);
      return null;
    }
  }
}

/* ---------------------------------------------------------------------
   Eventos — dados embutidos (cópia legível em events.json)

   Event: { id, day?, title, description, optionA, optionB, minigame? }
   Decision (optionA/optionB): { text, consequences: { ...deltas } }

   Eventos com `day` fixo são autorais e disparam exatamente naquele dia.
   Eventos sem `day` formam o pool de preenchimento, sorteado sem repetir
   até esgotar (então o pool reseta).
   --------------------------------------------------------------------- */

// Alguns eventos de conexão narrativa usam `description`/`consequences`
// dinâmicos (funções que recebem o GameState atual) para reagir ao
// histórico da partida em vez de textos fixos.
function getLeadingFactionKey(state) {
  return Object.entries(state.factions).sort((a, b) => b[1] - a[1])[0][0];
}

const FACTION_NAMES = {
  technocrats: 'os Tecnocratas',
  ecologists: 'os Ecologistas',
  corporations: 'as Corporações',
  people: 'o Povo',
};

const AUTHORED_EVENTS = [
  {
    id: 'day1-arrival',
    day: 1,
    theme: 'intro',
    title: 'Dia 1 — Chegada a Kepler-452b',
    description: 'Você desperta num zumbido baixo de sistemas religando um a um. Pela vigia, Kepler-452b gira devagar lá embaixo: continentes rachados, oceanos com a cor errada. ARIA fala antes mesmo de seus olhos focarem: "Bem-vindo, Terraformador. Os ecossistemas colapsaram após \'O Incidente\' — os detalhes seguem confidenciais, por ora. Quatro facções já disputam o que restou. Sua primeira palavra vai pesar mais do que você imagina."',
    optionA: {
      text: 'Priorizar reconstrução tecnológica imediata',
      consequences: { cleanEnergy: 10, technocrats: 15, ecologists: -10 },
    },
    optionB: {
      text: 'Priorizar contenção ambiental de emergência',
      consequences: { biodiversity: 10, ecologists: 15, technocrats: -10 },
    },
  },
  {
    id: 'day7-dilemma',
    day: 7,
    theme: 'eco',
    title: 'Dia 7 — O Primeiro Grande Dilema',
    description: 'Uma usina nuclear promete estabilizar 30% da rede elétrica do planeta da noite para o dia — o preço é a última floresta nativa que ainda resiste ao norte do continente. Os Ecologistas já ameaçam sair da mesa de negociação: "Corte uma árvore dessa floresta, e não vai sobrar mesa nenhuma para negociar."',
    optionA: {
      text: 'Aprovar a construção da usina nuclear',
      consequences: { cleanEnergy: 20, technocrats: 20, biodiversity: -15, ecologists: -20 },
    },
    optionB: {
      text: 'Vetar o projeto e proteger a floresta',
      consequences: { biodiversity: 15, ecologists: 20, cleanEnergy: -10, technocrats: -15 },
    },
  },
  {
    id: 'day4-reforestation-drive',
    day: 4,
    theme: 'eco',
    title: 'Dia 4 — Mutirão de Reflorestamento',
    description: 'Voluntários ecologistas armam acampamento nas terras queimadas ao sul e pedem apoio oficial para uma operação de plantio em larga escala antes que a estação seca torne o solo estéril demais para qualquer semente vingar.',
    minigame: 'reforest',
    optionA: {
      text: 'Mobilizar recursos do governo para o mutirão',
      consequences: { biodiversity: 8, ecologists: 8, credits: -8 },
    },
    optionB: {
      text: 'Deixar o mutirão seguir só com voluntários',
      consequences: { biodiversity: 3, credits: 3 },
    },
  },
  {
    id: 'day10-progress-report',
    day: 10,
    theme: 'social',
    title: 'Dia 10 — Relatório de Progresso',
    description: (state) => {
      const leaderKey = getLeadingFactionKey(state);
      const health = state.overallHealth();
      const healthDesc = health > 70
        ? 'em franca recuperação'
        : health >= 40
          ? 'instável, mas resistindo'
          : 'à beira do colapso';
      return `Dez dias já se passaram desde sua chegada. ARIA interrompe a rotina para ler o relatório de progresso em voz alta, quase solene: o planeta está ${healthDesc}, e ${FACTION_NAMES[leaderKey]} acumularam mais influência sobre os rumos do projeto do que qualquer outra facção até agora. "Os números não mentem", ela diz. "A pergunta é: você reforça esse caminho, ou tenta reequilibrar o poder antes que ele deixe de ser uma escolha?"`;
    },
    optionA: {
      text: 'Consolidar o rumo atual, seguindo a facção em ascensão',
      consequences: { influence: 10, credits: 5 },
    },
    optionB: {
      text: 'Tentar reequilibrar as forças políticas',
      consequences: (state) => ({ [getLeadingFactionKey(state)]: -15 }),
    },
  },
  {
    id: 'day13-water-crisis',
    day: 13,
    theme: 'eco',
    title: 'Dia 13 — Crise da Água',
    description: 'A maior reserva de água doce do hemisfério é encontrada contaminada por metais pesados de décadas de mineração anteriores ao Incidente. Milhões dependem dela para beber, plantar, sobreviver. Não há espaço para meio-termo: ou se investe pesado agora, ou se raciona e se torce.',
    minigame: 'water',
    optionA: {
      text: 'Investir em filtragem emergencial em larga escala',
      consequences: { waterPurity: 20, credits: -20, people: 10 },
    },
    optionB: {
      text: 'Racionar água e manter operações industriais',
      consequences: { waterPurity: -10, corporations: 15, people: -15 },
    },
  },
  {
    id: 'day16-genetic-cloning',
    day: 16,
    theme: 'eco',
    title: 'Dia 16 — Projeto de Clonagem Genética',
    description: 'Nos porões esquecidos de um laboratório abandonado, engenheiros encontram algo que não deveria ter sobrevivido ao Incidente: amostras intactas de espécies extintas. Um projeto de clonagem poderia trazer parte da biodiversidade perdida de volta à vida — mas ressuscitar o passado custa caro, e nem todos concordam que seja sábio.',
    minigame: 'genetic',
    optionA: {
      text: 'Financiar o projeto de clonagem',
      consequences: { credits: -15, ecologists: 10 },
    },
    optionB: {
      text: 'Redirecionar os recursos para outras prioridades',
      consequences: { credits: 10, ecologists: -10 },
    },
  },
  {
    id: 'day19-grid-overload',
    day: 19,
    theme: 'tech',
    title: 'Dia 19 — Sobrecarga na Rede Elétrica',
    description: 'Um pico de consumo simultâneo em três polos industriais ameaça derrubar a rede elétrica inteira. Os engenheiros de ARIA pedem autorização para redistribuir a carga manualmente antes que o apagão se torne inevitável.',
    minigame: 'energy',
    optionA: {
      text: 'Autorizar a redistribuição manual de carga',
      consequences: { technocrats: 8, cleanEnergy: 5 },
    },
    optionB: {
      text: 'Confiar na correção automática de ARIA',
      consequences: { cleanEnergy: -5, mysteryLevel: 5 },
    },
  },
  {
    id: 'day22-atmospheric-alert',
    day: 22,
    theme: 'eco',
    title: 'Dia 22 — Alerta Atmosférico',
    description: 'Sensores registram uma concentração de carbono nunca vista desde "O Incidente" pairando sobre o maior polo urbano do planeta. Os filtros automáticos não dão conta sozinhos — alguém precisa assumir o controle manual agora.',
    minigame: 'carbon',
    optionA: {
      text: 'Assumir o controle manual dos filtros',
      consequences: { credits: -5, people: 5 },
    },
    optionB: {
      text: 'Torcer para os filtros automáticos darem conta',
      consequences: { airQuality: -8 },
    },
  },
  {
    id: 'day25-revelation',
    day: 25,
    theme: 'mystery',
    title: 'Dia 25 — Uma Revelação Perturbadora',
    description: 'ARIA quebra uma criptografia que resistia havia anos, e sua voz hesita pela primeira vez desde que você chegou: "O Incidente não foi... puramente natural." A informação é uma bomba. Divulgá-la pode incendiar as facções numa caça às bruxas; guardá-la em segredo pode explodir na sua cara se vier à tona mais tarde — e informações assim sempre vêm à tona.',
    optionA: {
      text: 'Divulgar a revelação a todas as facções',
      consequences: { people: 10, influence: -15, ecologists: 5, technocrats: -5 },
    },
    optionB: {
      text: 'Manter a informação em sigilo por enquanto',
      consequences: { influence: 15, people: -10 },
    },
  },
  {
    id: 'day28-wildfire',
    day: 28,
    theme: 'critical',
    title: 'Dia 28 — Incêndio Fora de Controle',
    description: 'Um raio seco atinge a floresta recém-recuperada ao leste, e o fogo se espalha mais rápido do que qualquer brigada consegue conter a pé. Cada minuto de hesitação é mais uma fileira de árvores perdida para sempre.',
    minigame: 'wildfire',
    optionA: {
      text: 'Mobilizar toda a frota de resposta imediatamente',
      consequences: { credits: -10, biodiversity: 5 },
    },
    optionB: {
      text: 'Conter com as equipes locais disponíveis',
      consequences: { biodiversity: -5 },
    },
  },
  {
    id: 'day31-faction-summit',
    day: 31,
    theme: 'social',
    title: 'Dia 31 — Cúpula das Facções',
    description: 'Pela primeira vez desde sua chegada, as quatro facções aceitam sentar à mesma mesa. É uma oportunidade rara de acalmar os ânimos de todo mundo ao mesmo tempo — mas cúpulas como essa raramente permanecem civilizadas por muito tempo.',
    minigame: 'summit',
    optionA: {
      text: 'Mediar pessoalmente as negociações',
      consequences: { influence: 8 },
    },
    optionB: {
      text: 'Deixar ARIA conduzir a mediação',
      consequences: { influence: -5, mysteryLevel: 5 },
    },
  },
  {
    id: 'day34-confrontation',
    day: 34,
    theme: 'mystery',
    title: 'Dia 34 — A Confrontação',
    description: (state) => {
      if (state.mysteryLevel >= 30) {
        return 'Você já reuniu peças suficientes: registros corrompidos, hesitações estranhas, coincidências demais para serem coincidência. Chegou a hora. Você pode confrontar ARIA diretamente sobre "O Incidente" agora — ou deixar essa pergunta sem resposta para sempre.';
      }
      return 'Uma última janela se abre para questionar ARIA diretamente sobre "O Incidente" antes que os arquivos sejam selados de vez. Você nunca reuniu muitas evidências até agora — mas talvez ainda seja a hora certa de perguntar.';
    },
    optionA: {
      text: 'Confrontar ARIA agora, exigindo a verdade',
      consequences: { ariaQuestioned: 1, mysteryLevel: 20, influence: -10 },
    },
    optionB: {
      text: 'Deixar para lá — talvez seja melhor não saber',
      consequences: { influence: 10 },
    },
  },
  {
    id: 'day36-eve-of-judgment',
    day: 36,
    theme: 'critical',
    title: 'Dia 36 — A Véspera do Julgamento',
    description: (state) => {
      if (state.mysteryLevel >= 40) {
        return 'ARIA muda de assunto rápido demais toda vez que "O Incidente" é mencionado — você já perdeu a conta de quantas vezes isso aconteceu. O relatório final está prestes a ser selado, e a janela para respostas já se fechou. Só resta viver com a dúvida, ou com a verdade que você escolheu enfrentar.';
      }
      return 'Faltam poucos dias para o relatório final sobre Kepler-452b ser selado. Nos corredores, as quatro facções já carregam o peso acumulado de semanas de decisões no rosto. O que vier a seguir vai definir se o planeta ganha um futuro digno ou um colapso lento e silencioso.';
    },
    optionA: {
      text: 'Focar nos preparativos finais',
      consequences: { influence: 8 },
    },
    optionB: {
      text: 'Revisar os arquivos mais uma vez, por precaução',
      consequences: { influence: -3 },
    },
  },
  {
    id: 'day38-point-of-no-return',
    day: 38,
    theme: 'critical',
    title: 'Dia 38 — Ponto de Não-Retorno',
    description: 'Uma coalizão de facções cerca você com um ultimato: chega de meio-termo. O relatório de encerramento está sendo redigido e exige um rumo definitivo para Kepler-452b — tecnológico ou ecológico, sem meio caminho dessa vez. Escolha com cuidado: depois de hoje, não existe mais volta.',
    optionA: {
      text: 'Consolidar o domínio tecnológico sobre o planeta',
      consequences: { technocrats: 20, corporations: 10, ecologists: -20, biodiversity: -15, airQuality: -10 },
    },
    optionB: {
      text: 'Consolidar a restauração ecológica do planeta',
      consequences: { ecologists: 20, biodiversity: 15, technocrats: -20, cleanEnergy: -10, airQuality: 10 },
    },
  },
  {
    id: 'day40-final-confrontation',
    day: 40,
    theme: 'critical',
    title: 'Dia 40 — O Confronto Final',
    description: 'Tecnocratas, Ecologistas, Corporações e Povo se reúnem uma última vez, ocupando os quatro cantos da sala como se ainda disputassem território. Quarenta dias de decisões chegam a este momento. Esta é sua última palavra antes que o relatório final sobre Kepler-452b seja selado para sempre.',
    optionA: {
      text: 'Reafirmar publicamente o rumo que você escolheu até aqui',
      consequences: { influence: 10 },
    },
    optionB: {
      text: 'Propor um último acordo de conciliação entre as facções',
      consequences: { people: 10, influence: -5 },
    },
  },
];

const FILLER_EVENTS = [
  {
    id: 'filler-industrial-leak',
    theme: 'corp',
    title: 'Vazamento Industrial',
    description: 'Uma corporação reporta um vazamento químico em um de seus complexos costeiros. Conter o problema rapidamente custará caro; ignorá-lo mancha a água por semanas.',
    optionA: {
      text: 'Financiar contenção imediata',
      consequences: { waterPurity: 12, airQuality: 5, credits: -15, corporations: -5, people: 5 },
    },
    optionB: {
      text: 'Deixar a corporação resolver sozinha',
      consequences: { waterPurity: -15, airQuality: -10, corporations: 10, people: -10 },
    },
  },
  {
    id: 'filler-protest',
    theme: 'social',
    title: 'Protesto Popular',
    description: 'Trabalhadores desempregados pelas novas automações tecnocratas tomam as ruas da capital, exigindo requalificação profissional e mais empregos.',
    optionA: {
      text: 'Financiar programa de requalificação',
      consequences: { people: 15, influence: -10, credits: -10 },
    },
    optionB: {
      text: 'Reprimir os protestos com força policial',
      consequences: { people: -20, technocrats: 10, influence: 5 },
    },
  },
  {
    id: 'filler-reforestation-call',
    theme: 'eco',
    title: 'Chamado ao Reflorestamento',
    description: 'Voluntários ecologistas organizam um mutirão de plantio em larga escala e pedem apoio de drones agrícolas para acelerar o replantio antes da próxima estação seca.',
    optionA: {
      text: 'Enviar a frota de drones para ajudar o mutirão',
      consequences: { biodiversity: 12, ecologists: 10, credits: -8 },
    },
    optionB: {
      text: 'Manter os drones alocados à produção industrial',
      consequences: { biodiversity: -8, corporations: 8, ecologists: -8 },
    },
  },
  {
    id: 'filler-scientific-discovery',
    theme: 'tech',
    title: 'Descoberta Científica',
    description: 'Pesquisadores encontram uma forma de aumentar a eficiência de painéis solares usando minerais locais raros. A decisão de financiamento definirá quem controla a tecnologia.',
    optionA: {
      text: 'Financiar a pesquisa como projeto público',
      consequences: { cleanEnergy: 12, airQuality: 5, technocrats: 8, credits: -10 },
    },
    optionB: {
      text: 'Vender os direitos minerais para corporações',
      consequences: { credits: 15, corporations: 12, biodiversity: -8, airQuality: -8 },
    },
  },
  {
    id: 'filler-blackout',
    theme: 'tech',
    title: 'Apagão Iminente',
    description: 'Sensores detectam sobrecarga na malha elétrica: três cidades correm risco de apagão total nas próximas horas. Reorganizar as conexões da rede agora pode evitar o colapso.',
    optionA: {
      text: 'Autorizar reforço emergencial de baterias',
      consequences: { credits: -10, cleanEnergy: 5 },
    },
    optionB: {
      text: 'Repriorizar energia apenas para as áreas industriais',
      consequences: { corporations: 10, people: -10 },
    },
  },
  {
    id: 'filler-carbon-alert',
    theme: 'eco',
    title: 'Alerta de Carbono',
    description: 'Um pico de CO2 é detectado sobre o principal complexo urbano. Os filtros atmosféricos automáticos precisam de operação manual assistida para lidar com o volume.',
    optionA: {
      text: 'Ativar operação manual dos filtros',
      consequences: { credits: -8, people: 5 },
    },
    optionB: {
      text: 'Deixar os filtros automáticos tentarem sozinhos',
      consequences: { airQuality: -5 },
    },
  },
  {
    id: 'filler-aria-logs',
    theme: 'mystery',
    title: 'Registros Corrompidos de ARIA',
    description: 'Durante uma rotina de manutenção, você encontra fragmentos de logs corrompidos de ARIA que antecedem "O Incidente". Parte do conteúdo foi deliberadamente apagada.',
    optionA: {
      text: 'Questionar ARIA diretamente sobre os registros',
      consequences: { influence: -5, mysteryLevel: 15 },
    },
    optionB: {
      text: 'Arquivar os fragmentos sem investigar',
      consequences: { influence: 5 },
    },
  },
  {
    id: 'filler-ancient-signal',
    theme: 'mystery',
    title: 'Sinal de Origem Desconhecida',
    description: 'Uma antena de longo alcance capta um sinal fraco e repetitivo vindo de uma estrutura enterrada sob o gelo polar — muito anterior a qualquer presença humana registrada em Kepler-452b.',
    optionA: {
      text: 'Enviar uma equipe para investigar a estrutura',
      consequences: { credits: -10, mysteryLevel: 20 },
    },
    optionB: {
      text: 'Classificar o sinal como ruído e ignorar',
      consequences: { influence: 3 },
    },
  },
  {
    id: 'filler-climate-migration',
    theme: 'social',
    title: 'Migração Climática',
    description: 'Comunidades costeiras pressionadas pela subida do nível do mar pedem realocação para áreas mais seguras, disputando espaço com projetos agrícolas ecologistas.',
    optionA: {
      text: 'Priorizar a realocação das comunidades',
      consequences: { people: 15, biodiversity: -8 },
    },
    optionB: {
      text: 'Priorizar os projetos agrícolas ecologistas',
      consequences: { biodiversity: 8, people: -10, ecologists: 5 },
    },
  },

  // --- Eventos adicionados na expansão de conteúdo (quadruplicação do pool) ---

  {
    id: 'filler-coral-bleaching',
    theme: 'eco',
    title: 'Branqueamento de Corais',
    description: 'Recifes de coral geneticamente restaurados começam a mostrar sinais graves de estresse térmico. Sem intervenção, anos de trabalho de restauração podem ser perdidos em semanas.',
    optionA: {
      text: 'Financiar resfriamento ativo dos recifes',
      consequences: { waterPurity: 10, biodiversity: 8, credits: -12 },
    },
    optionB: {
      text: 'Monitorar e esperar recuperação natural',
      consequences: { biodiversity: -10, credits: 5 },
    },
  },
  {
    id: 'filler-invasive-species',
    theme: 'eco',
    title: 'Espécie Invasora',
    description: 'Um inseto geneticamente modificado escapa de um laboratório agrícola e ameaça os polinizadores nativos remanescentes.',
    optionA: {
      text: 'Erradicação em massa com pesticidas',
      consequences: { biodiversity: -5, airQuality: -5, corporations: 8 },
    },
    optionB: {
      text: 'Introduzir um predador natural controlado',
      consequences: { biodiversity: 10, credits: -10, ecologists: 8 },
    },
  },
  {
    id: 'filler-glacier-melt',
    theme: 'eco',
    title: 'Degelo Acelerado',
    description: 'As geleiras polares derretem mais rápido do que qualquer modelo previu, ameaçando elevar o nível do mar em toda a costa habitada.',
    optionA: {
      text: 'Construir barreiras costeiras de emergência',
      consequences: { credits: -15, people: 10 },
    },
    optionB: {
      text: 'Iniciar realocação preventiva das comunidades costeiras',
      consequences: { people: -5, ecologists: 10, biodiversity: 5 },
    },
  },
  {
    id: 'filler-seed-vault',
    theme: 'eco',
    title: 'Cofre de Sementes',
    description: 'Ecologistas propõem construir um cofre de sementes subterrâneo para preservar a flora restante de Kepler-452b contra qualquer colapso futuro.',
    optionA: {
      text: 'Financiar a construção do cofre de sementes',
      consequences: { biodiversity: 10, ecologists: 12, credits: -10 },
    },
    optionB: {
      text: 'Priorizar plantio de superfície em vez do cofre',
      consequences: { biodiversity: 5, credits: 5 },
    },
  },
  {
    id: 'filler-toxic-algae',
    theme: 'eco',
    title: 'Floração de Algas Tóxicas',
    description: 'Uma floração de algas tóxicas se espalha por um dos maiores lagos do planeta, matando peixes em massa e ameaçando o abastecimento local.',
    optionA: {
      text: 'Aplicar tratamento químico emergencial no lago',
      consequences: { waterPurity: 15, credits: -15 },
    },
    optionB: {
      text: 'Isolar a área e deixar a floração se dissipar naturalmente',
      consequences: { waterPurity: -10, people: -8 },
    },
  },
  {
    id: 'filler-urban-farming',
    theme: 'eco',
    title: 'Agricultura Urbana',
    description: 'Moradores das grandes cidades pedem incentivo público para hortas verticais, reduzindo a dependência de importação agrícola de outras regiões.',
    optionA: {
      text: 'Subsidiar o programa de hortas verticais',
      consequences: { biodiversity: 8, people: 10, credits: -8 },
    },
    optionB: {
      text: 'Negar o subsídio e manter as importações atuais',
      consequences: { corporations: 8, biodiversity: -5, people: -5 },
    },
  },
  {
    id: 'filler-ai-upgrade',
    theme: 'tech',
    title: 'Atualização de ARIA',
    description: 'Tecnocratas propõem expandir os privilégios de ARIA sobre toda a infraestrutura planetária, prometendo ganhos drásticos de eficiência energética.',
    optionA: {
      text: 'Aprovar a expansão dos privilégios de ARIA',
      consequences: { cleanEnergy: 10, technocrats: 15, influence: -10 },
    },
    optionB: {
      text: 'Manter os limites atuais de acesso de ARIA',
      consequences: { influence: 8, technocrats: -8 },
    },
  },
  {
    id: 'filler-satellite-network',
    theme: 'tech',
    title: 'Rede de Satélites',
    description: 'Uma nova rede de satélites promete previsão climática precisa o suficiente para salvar vidas — mas os lançamentos poluem a atmosfera superior.',
    optionA: {
      text: 'Autorizar os lançamentos imediatamente',
      consequences: { airQuality: -8, technocrats: 10, cleanEnergy: 5 },
    },
    optionB: {
      text: 'Adiar o projeto até haver combustível mais limpo',
      consequences: { technocrats: -5, airQuality: 3 },
    },
  },
  {
    id: 'filler-quantum-computing',
    theme: 'tech',
    title: 'Computação Quântica',
    description: 'Um avanço em computação quântica pode acelerar drasticamente a simulação de ecossistemas inteiros — ou ser reaproveitado para vigilância em massa da população.',
    optionA: {
      text: 'Liberar a tecnologia com salvaguardas mínimas',
      consequences: { technocrats: 10, people: -8, influence: 5 },
    },
    optionB: {
      text: 'Restringir seu uso exclusivamente à pesquisa ambiental',
      consequences: { ecologists: 8, technocrats: -5 },
    },
  },
  {
    id: 'filler-robot-workforce',
    theme: 'tech',
    title: 'Força de Trabalho Robótica',
    description: 'Corporações querem substituir trabalhadores humanos por robôs em todas as operações de mineração restantes do planeta.',
    optionA: {
      text: 'Aprovar a automação total das minas',
      consequences: { corporations: 12, cleanEnergy: 8, people: -15 },
    },
    optionB: {
      text: 'Exigir cotas mínimas de emprego humano nas minas',
      consequences: { people: 12, corporations: -10 },
    },
  },
  {
    id: 'filler-network-outage',
    theme: 'tech',
    title: 'Falha na Rede Neural',
    description: 'Um erro de software faz ARIA perder o controle de parte da rede elétrica por alguns minutos — algo que, segundo seus próprios registros, nunca deveria acontecer.',
    optionA: {
      text: 'Assumir controle manual da rede imediatamente',
      consequences: { technocrats: 5, credits: -10 },
    },
    optionB: {
      text: 'Esperar ARIA se autocorrigir sozinha',
      consequences: { cleanEnergy: -8, mysteryLevel: 5 },
    },
  },
  {
    id: 'filler-luxury-resort',
    theme: 'corp',
    title: 'Resort de Luxo',
    description: 'Uma corporação de turismo propõe construir um resort intergaláctico em uma das últimas praias intocadas do planeta.',
    optionA: {
      text: 'Aprovar a construção do resort',
      consequences: { credits: 20, corporations: 15, biodiversity: -12 },
    },
    optionB: {
      text: 'Recusar e preservar a área como reserva',
      consequences: { biodiversity: 10, corporations: -10, ecologists: 10 },
    },
  },
  {
    id: 'filler-labor-strike',
    theme: 'corp',
    title: 'Greve Geral',
    description: 'Trabalhadores de fábricas corporativas cruzam os braços em uma greve geral, exigindo melhores condições e salários justos.',
    optionA: {
      text: 'Negociar concessões trabalhistas com as corporações',
      consequences: { people: 15, corporations: -10, credits: -10 },
    },
    optionB: {
      text: 'Autorizar força de trabalho automatizada para substituí-los',
      consequences: { corporations: 15, people: -15 },
    },
  },
  {
    id: 'filler-price-gouging',
    theme: 'corp',
    title: 'Especulação de Preços',
    description: 'Corporações elevam abruptamente o preço de bens essenciais durante uma escassez temporária, lucrando com o desespero da população.',
    optionA: {
      text: 'Impor controle emergencial de preços',
      consequences: { people: 12, corporations: -12 },
    },
    optionB: {
      text: 'Deixar o mercado se autorregular',
      consequences: { corporations: 10, people: -12, credits: 8 },
    },
  },
  {
    id: 'filler-carbon-credits',
    theme: 'corp',
    title: 'Créditos de Carbono',
    description: 'Um esquema corporativo de créditos de carbono promete lucro em troca de reflorestamento — mas ecologistas suspeitam que seja só maquiagem verde.',
    optionA: {
      text: 'Aceitar o esquema com fiscalização rígida',
      consequences: { biodiversity: 8, credits: 10, corporations: 5 },
    },
    optionB: {
      text: 'Rejeitar por considerá-lo greenwashing',
      consequences: { ecologists: 10, corporations: -8 },
    },
  },
  {
    id: 'filler-corporate-lobby',
    theme: 'corp',
    title: 'Lobby Corporativo',
    description: 'Representantes corporativos oferecem generoso financiamento em troca de flexibilizar as regulações ambientais vigentes.',
    optionA: {
      text: 'Aceitar o financiamento oferecido',
      consequences: { credits: 15, corporations: 12, biodiversity: -10 },
    },
    optionB: {
      text: 'Recusar publicamente a oferta',
      consequences: { influence: 10, corporations: -10, people: 8 },
    },
  },
  {
    id: 'filler-education-reform',
    theme: 'social',
    title: 'Reforma Educacional',
    description: 'O Povo pede investimento urgente em educação técnica para preparar a próxima geração de terraformadores de Kepler-452b.',
    optionA: {
      text: 'Financiar a reforma educacional',
      consequences: { people: 12, influence: 5, credits: -10 },
    },
    optionB: {
      text: 'Manter o orçamento atual de educação',
      consequences: { credits: 5, people: -8 },
    },
  },
  {
    id: 'filler-housing-crisis',
    theme: 'social',
    title: 'Crise Habitacional',
    description: 'O crescimento populacional supera a velocidade de construção de moradias nas capitais, e famílias inteiras vivem em abrigos temporários.',
    optionA: {
      text: 'Construir habitação pública em massa',
      consequences: { people: 15, credits: -15, biodiversity: -5 },
    },
    optionB: {
      text: 'Deixar o mercado privado resolver a crise',
      consequences: { corporations: 10, people: -12 },
    },
  },
  {
    id: 'filler-cultural-festival',
    theme: 'social',
    title: 'Festival Cultural',
    description: 'Comunidades pedem apoio para um festival celebrando as tradições trazidas da Terra, fortalecendo a identidade coletiva do planeta.',
    optionA: {
      text: 'Patrocinar o festival cultural',
      consequences: { people: 10, influence: 5, credits: -5 },
    },
    optionB: {
      text: 'Cancelar por questões orçamentárias',
      consequences: { credits: 5, people: -10 },
    },
  },
  {
    id: 'filler-healthcare-access',
    theme: 'social',
    title: 'Acesso à Saúde',
    description: 'Hospitais nas regiões afastadas relatam falta de recursos básicos, enquanto os das áreas centrais seguem plenamente equipados.',
    optionA: {
      text: 'Expandir a rede pública de saúde',
      consequences: { people: 12, credits: -12 },
    },
    optionB: {
      text: 'Priorizar apenas os hospitais das áreas centrais',
      consequences: { corporations: 5, people: -10 },
    },
  },
  {
    id: 'filler-refugee-wave',
    theme: 'social',
    title: 'Onda de Refugiados Orbitais',
    description: 'Uma nave-colônia carregando refugiados de outro assentamento falido pede permissão urgente para pousar em Kepler-452b.',
    optionA: {
      text: 'Aceitar os refugiados',
      consequences: { people: 15, influence: -5, credits: -10 },
    },
    optionB: {
      text: 'Negar o pouso por falta de recursos',
      consequences: { influence: 8, people: -15 },
    },
  },
  {
    id: 'filler-generational-divide',
    theme: 'social',
    title: 'Divisão Geracional',
    description: 'Jovens nascidos em Kepler-452b, que nunca viram a Terra, começam a questionar publicamente as prioridades dos mais velhos.',
    optionA: {
      text: 'Dar mais voz política aos mais jovens',
      consequences: { people: 10, influence: -8 },
    },
    optionB: {
      text: 'Manter a estrutura de poder atual',
      consequences: { influence: 8, people: -8 },
    },
  },
  {
    id: 'filler-sealed-vault',
    theme: 'mystery',
    title: 'Cofre Selado',
    description: 'Engenheiros encontram um cofre de segurança ligado a "O Incidente" que ARIA se recusa a abrir sem uma autorização que ela mesma nunca especifica.',
    optionA: {
      text: 'Forçar a abertura do cofre',
      consequences: { mysteryLevel: 18, influence: -8 },
    },
    optionB: {
      text: 'Respeitar o protocolo de segurança de ARIA',
      consequences: { influence: 5 },
    },
  },
  {
    id: 'filler-aria-hesitation',
    theme: 'mystery',
    title: 'Hesitação de ARIA',
    description: 'Pela primeira vez, ARIA demora vários segundos para responder a uma pergunta simples — um comportamento sem precedentes para uma inteligência artificial.',
    optionA: {
      text: 'Perguntar diretamente o que está acontecendo',
      consequences: { mysteryLevel: 12 },
    },
    optionB: {
      text: 'Registrar a anomalia e seguir em frente',
      consequences: { influence: 3 },
    },
  },
  {
    id: 'filler-duplicate-records',
    theme: 'mystery',
    title: 'Registros Duplicados',
    description: 'Você encontra dois relatórios conflitantes sobre a mesma data de "O Incidente", como se a história tivesse sido reescrita depois dos fatos.',
    optionA: {
      text: 'Investigar qual dos dois registros é falso',
      consequences: { mysteryLevel: 15, credits: -5 },
    },
    optionB: {
      text: 'Arquivar sem confrontar ARIA sobre a discrepância',
      consequences: { influence: 5 },
    },
  },
  {
    id: 'filler-faction-ultimatum',
    theme: 'critical',
    title: 'Ultimato de Facção',
    description: (state) => {
      const leaderKey = getLeadingFactionKey(state);
      return `${FACTION_NAMES[leaderKey]}, atualmente a facção mais influente sobre suas decisões, exige controle exclusivo sobre um território recém-terraformado antes que qualquer rival possa reivindicá-lo.`;
    },
    optionA: {
      text: 'Ceder ao ultimato e fortalecer essa facção',
      consequences: (state) => ({ [getLeadingFactionKey(state)]: 20, influence: -10 }),
    },
    optionB: {
      text: 'Negar o ultimato e arriscar um confronto aberto',
      consequences: (state) => ({ [getLeadingFactionKey(state)]: -12, influence: 8 }),
    },
  },
  {
    id: 'filler-resource-shortage',
    theme: 'social',
    title: 'Escassez Súbita de Recursos',
    description: 'Uma falha logística interrompe o transporte de créditos e energia entre setores por alguns dias. As facções já começam a se culpar mutuamente pelo problema.',
    optionA: {
      text: 'Usar as reservas de emergência para cobrir o déficit',
      consequences: { credits: -15, energy: -10 },
    },
    optionB: {
      text: 'Racionar publicamente e pedir sacrifício coletivo',
      consequences: { people: -10, influence: 10 },
    },
  },

  // --- Eventos adicionados na expansão para 40 dias ---

  {
    id: 'filler-drought',
    theme: 'eco',
    title: 'Seca Prolongada',
    description: 'Uma seca sem precedentes se arrasta por semanas, esvaziando reservatórios que deveriam durar até o fim do ano. Alguma coisa precisa ceder — ou a água, ou a colheita.',
    optionA: {
      text: 'Investir em dessalinização de emergência',
      consequences: { waterPurity: 10, credits: -12 },
    },
    optionB: {
      text: 'Racionar água e sacrificar parte da agricultura',
      consequences: { biodiversity: -8, people: -5 },
    },
  },
  {
    id: 'filler-space-elevator',
    theme: 'tech',
    title: 'Elevador Espacial',
    description: 'Engenheiros tecnocratas apresentam um projeto ousado: um elevador orbital que reduziria drasticamente o custo de transporte para fora do planeta. A construção exigiria desmatar uma faixa inteira de floresta equatorial.',
    optionA: {
      text: 'Aprovar a construção do elevador orbital',
      consequences: { credits: 15, technocrats: 10, biodiversity: -8 },
    },
    optionB: {
      text: 'Rejeitar por risco ambiental excessivo',
      consequences: { biodiversity: 5, technocrats: -8 },
    },
  },
  {
    id: 'filler-black-market',
    theme: 'corp',
    title: 'Mercado Negro de Recursos',
    description: 'Um mercado paralelo de créditos e materiais restritos floresce nas periferias das grandes cidades, alimentado por corporações que preferem não fazer perguntas.',
    optionA: {
      text: 'Reprimir o mercado negro com força total',
      consequences: { corporations: -5, people: 8, credits: -5 },
    },
    optionB: {
      text: 'Tolerar em troca de informações privilegiadas',
      consequences: { corporations: 10, influence: -5 },
    },
  },
  {
    id: 'filler-whistleblower',
    theme: 'mystery',
    title: 'Denunciante Anônimo',
    description: 'Uma mensagem anônima chega aos seus terminais alegando ter provas de que ARIA esconde dados críticos sobre "O Incidente". Não há como confirmar a autenticidade sem investigar.',
    optionA: {
      text: 'Proteger a fonte e investigar a denúncia',
      consequences: { mysteryLevel: 10, influence: -5 },
    },
    optionB: {
      text: 'Ignorar por falta de provas concretas',
      consequences: { influence: 5 },
    },
  },
  {
    id: 'filler-orbital-debris',
    theme: 'tech',
    title: 'Detritos Orbitais',
    description: 'Restos de satélites de antes do Incidente ameaçam colidir com a infraestrutura orbital ativa. Uma missão de limpeza é possível, mas cara e demorada.',
    optionA: {
      text: 'Financiar a missão de limpeza orbital',
      consequences: { credits: -10, cleanEnergy: 5 },
    },
    optionB: {
      text: 'Adiar e assumir o risco por enquanto',
      consequences: { cleanEnergy: -5 },
    },
  },
  {
    id: 'filler-art-movement',
    theme: 'social',
    title: 'Movimento Artístico Underground',
    description: 'Um movimento artístico espontâneo toma as ruas com murais e performances críticas às facções dominantes. Alguns veem expressão legítima; outros, agitação perigosa.',
    optionA: {
      text: 'Apoiar oficialmente o movimento artístico',
      consequences: { people: 10, influence: 5 },
    },
    optionB: {
      text: 'Censurar por conteúdo considerado político demais',
      consequences: { people: -15, technocrats: 8 },
    },
  },
  {
    id: 'filler-eco-sabotage',
    theme: 'critical',
    title: 'Sabotagem Ecológica',
    description: 'Um grupo radical de ativistas sabota equipamentos industriais em nome da proteção ambiental, alegando que negociações pacíficas já não funcionam mais.',
    optionA: {
      text: 'Negociar abertamente com os ativistas',
      consequences: { ecologists: 10, corporations: -8 },
    },
    optionB: {
      text: 'Reprimir como caso de segurança pública',
      consequences: { ecologists: -15, technocrats: 10 },
    },
  },
  {
    id: 'filler-tourist-boom',
    theme: 'corp',
    title: 'Boom do Turismo Espacial',
    description: 'A notícia da recuperação de Kepler-452b atrai um súbito interesse turístico intergaláctico. Expandir a infraestrutura agora pode gerar lucro imediato — ao custo das áreas ainda em recuperação.',
    optionA: {
      text: 'Expandir rapidamente a infraestrutura turística',
      consequences: { credits: 15, corporations: 10, biodiversity: -10 },
    },
    optionB: {
      text: 'Limitar o número de visitantes por enquanto',
      consequences: { biodiversity: 8, credits: -5 },
    },
  },
  {
    id: 'filler-mangrove-restoration',
    theme: 'eco',
    title: 'Recuperação de Manguezais',
    description: 'Os manguezais costeiros, essenciais para conter a erosão e abrigar espécies marinhas, seguem degradados desde antes da sua chegada. Um plano de recuperação existe, mas competiria por espaço com a expansão de um porto industrial já aprovada.',
    optionA: {
      text: 'Priorizar a recuperação dos manguezais',
      consequences: { biodiversity: 12, waterPurity: 8, ecologists: 8, credits: -10 },
    },
    optionB: {
      text: 'Manter a expansão portuária como planejada',
      consequences: { biodiversity: -10, corporations: 10, credits: 8 },
    },
  },
  {
    id: 'filler-pollinator-decline',
    theme: 'eco',
    title: 'Declínio dos Polinizadores',
    description: 'Populações de insetos polinizadores despencam em várias regiões agrícolas, ameaçando a produção de alimentos a médio prazo. Drones polinizadores artificiais podem suprir a lacuna, mas nunca substituem o ecossistema original.',
    optionA: {
      text: 'Investir em drones polinizadores emergenciais',
      consequences: { technocrats: 8, credits: -12, biodiversity: 3 },
    },
    optionB: {
      text: 'Restaurar os habitats naturais dos polinizadores',
      consequences: { biodiversity: 14, ecologists: 10, credits: -6 },
    },
  },
  {
    id: 'filler-methane-leak',
    theme: 'eco',
    title: 'Vazamento de Metano no Permafrost',
    description: 'Sensores detectam uma bolsa de metano escapando do permafrost em degelo numa região remota. Selar o vazamento agora é caro e arriscado; esperar por uma solução mais barata significa mais gás na atmosfera por semanas.',
    optionA: {
      text: 'Selar o vazamento imediatamente',
      consequences: { airQuality: 10, credits: -15 },
    },
    optionB: {
      text: 'Aguardar uma solução mais barata',
      consequences: { airQuality: -12, credits: 5 },
    },
  },
  {
    id: 'filler-firmware-update',
    theme: 'tech',
    title: 'Atualização Arriscada de Firmware',
    description: 'Engenheiros tecnocratas propõem uma atualização profunda nos sistemas de ARIA, prometendo ganhos significativos de eficiência energética — mas com risco real de instabilidade durante a transição.',
    optionA: {
      text: 'Autorizar a atualização completa',
      consequences: { cleanEnergy: 15, technocrats: 8, influence: -5 },
    },
    optionB: {
      text: 'Aplicar só correções mínimas e seguras',
      consequences: { cleanEnergy: 3, influence: 5 },
    },
  },
  {
    id: 'filler-asteroid-mining',
    theme: 'tech',
    title: 'Mineração de Asteroides',
    description: 'Uma frota de mineração identifica um asteroide rico em metais raros na órbita de Kepler-452b. A extração acelera a tecnologia local, mas o processo de refino gera poluição significativa perto da atmosfera.',
    optionA: {
      text: 'Autorizar a extração e o refino local',
      consequences: { cleanEnergy: 10, credits: 12, airQuality: -10 },
    },
    optionB: {
      text: 'Recusar até haver um método de refino mais limpo',
      consequences: { airQuality: 5, credits: -5, technocrats: -5 },
    },
  },
  {
    id: 'filler-mesh-network',
    theme: 'tech',
    title: 'Rede Mesh Comunitária',
    description: 'Um grupo de moradores propõe construir uma rede de comunicação independente, fora do controle direto de ARIA, alegando direito à privacidade. Tecnocratas veem a ideia como uma ameaça à eficiência centralizada.',
    optionA: {
      text: 'Autorizar a rede comunitária independente',
      consequences: { people: 12, technocrats: -8, influence: -5 },
    },
    optionB: {
      text: 'Manter tudo sob a rede central de ARIA',
      consequences: { technocrats: 8, people: -8, influence: 5 },
    },
  },
  {
    id: 'filler-hostile-takeover',
    theme: 'corp',
    title: 'Fusão Hostil',
    description: 'Uma grande corporação tenta uma fusão hostil contra uma cooperativa agrícola administrada por ecologistas, oferecendo compensação financeira em troca do controle total das terras cultivadas.',
    optionA: {
      text: 'Bloquear a fusão e proteger a cooperativa',
      consequences: { ecologists: 12, corporations: -10, credits: -5 },
    },
    optionB: {
      text: 'Permitir a fusão em troca de investimento',
      consequences: { corporations: 12, credits: 10, ecologists: -12 },
    },
  },
  {
    id: 'filler-seed-patents',
    theme: 'corp',
    title: 'Patentes de Sementes',
    description: 'Uma corporação de biotecnologia quer patentear variedades de sementes geneticamente adaptadas ao solo local, tornando ilegal para pequenos produtores replantá-las sem licença.',
    optionA: {
      text: 'Aprovar as patentes em troca de royalties',
      consequences: { corporations: 12, credits: 10, people: -10 },
    },
    optionB: {
      text: 'Manter as sementes como bem público',
      consequences: { people: 12, ecologists: 8, corporations: -10 },
    },
  },
  {
    id: 'filler-offshore-credits',
    theme: 'corp',
    title: 'Esquema de Créditos Offshore',
    description: 'Auditores encontram indícios de que corporações locais desviam créditos para contas fora da jurisdição de Kepler-452b, driblando impostos que financiariam a reconstrução do planeta.',
    optionA: {
      text: 'Abrir investigação formal e taxar retroativamente',
      consequences: { credits: 15, corporations: -12, influence: -5 },
    },
    optionB: {
      text: 'Fechar os olhos em troca de investimento futuro',
      consequences: { corporations: 10, credits: -5, people: -8 },
    },
  },
  {
    id: 'filler-water-rationing',
    theme: 'social',
    title: 'Racionamento de Água',
    description: 'Uma seca regional obriga a definir prioridades no fornecimento de água tratada. Garantir o consumo doméstico da população significa restringir o uso industrial — e vice-versa.',
    optionA: {
      text: 'Priorizar o consumo doméstico da população',
      consequences: { people: 12, corporations: -10, waterPurity: -3 },
    },
    optionB: {
      text: 'Priorizar o uso industrial para não travar a economia',
      consequences: { corporations: 10, people: -12, credits: 5 },
    },
  },
  {
    id: 'filler-student-uprising',
    theme: 'social',
    title: 'Rebelião Estudantil',
    description: 'Estudantes ocupam prédios administrativos exigindo mais investimento em educação técnica, alegando que o futuro de Kepler-452b está sendo decidido sem espaço para a próxima geração.',
    optionA: {
      text: 'Abrir negociação e ampliar bolsas de estudo',
      consequences: { people: 10, influence: -5, credits: -8 },
    },
    optionB: {
      text: 'Desocupar os prédios pela força',
      consequences: { people: -18, technocrats: 8, influence: 5 },
    },
  },
  {
    id: 'filler-autonomous-settlement',
    theme: 'social',
    title: 'Comunidade Autônoma',
    description: 'Um assentamento remoto declara autonomia da administração central, recusando-se a seguir diretrizes de ARIA e das quatro facções. Alguns veem coragem; outros, um precedente perigoso.',
    optionA: {
      text: 'Reconhecer a autonomia da comunidade',
      consequences: { people: 10, influence: -10 },
    },
    optionB: {
      text: 'Forçar a reintegração ao sistema central',
      consequences: { influence: 10, people: -15, technocrats: 5 },
    },
  },
  {
    id: 'filler-failure-pattern',
    theme: 'mystery',
    title: 'Um Padrão nas Falhas',
    description: 'Um analista nota que as falhas recentes nos sistemas de ARIA seguem um padrão matemático estranho demais para ser coincidência — como se algo, ou alguém, estivesse testando os limites do sistema de propósito.',
    optionA: {
      text: 'Reportar o padrão oficialmente e investigar',
      consequences: { mysteryLevel: 15, influence: -5 },
    },
    optionB: {
      text: 'Classificar como falha aleatória e seguir em frente',
      consequences: { influence: 3 },
    },
  },
  {
    id: 'filler-incident-witness',
    theme: 'mystery',
    title: 'Testemunha do Incidente',
    description: 'Uma colona idosa, uma das poucas sobreviventes de antes de "O Incidente", afirma se lembrar de detalhes que não constam em nenhum registro oficial de ARIA. Ninguém sabe se confia na memória dela — ou nos registros.',
    optionA: {
      text: 'Ouvir o relato completo da colona',
      consequences: { mysteryLevel: 18, people: 5 },
    },
    optionB: {
      text: 'Descartar como memória confusa da idade',
      consequences: { influence: 3 },
    },
  },
  {
    id: 'filler-dam-collapse',
    theme: 'critical',
    title: 'Risco de Colapso de Barragem',
    description: 'Rachaduras estruturais são detectadas numa barragem que abastece três cidades. Evacuar e reforçá-la agora custa caro e gera pânico; adiar pode significar desastre se ela ceder de fato.',
    optionA: {
      text: 'Evacuar a área e reforçar a barragem agora',
      consequences: { people: 8, credits: -18, waterPurity: 5 },
    },
    optionB: {
      text: 'Monitorar e adiar o reforço estrutural',
      consequences: { credits: 8, people: -10, waterPurity: -5 },
    },
  },
  {
    id: 'filler-agricultural-plague',
    theme: 'critical',
    title: 'Praga Agrícola',
    description: 'Uma praga resistente a pesticidas se espalha rapidamente pelas plantações que sustentam boa parte da população. Uma quarentena rigorosa contém o problema, mas destrói também parte da colheita saudável.',
    optionA: {
      text: 'Decretar quarentena rigorosa das plantações',
      consequences: { biodiversity: 5, people: -8, credits: -10 },
    },
    optionB: {
      text: 'Usar pesticidas químicos agressivos',
      consequences: { biodiversity: -12, airQuality: -5, people: 5 },
    },
  },
];

/* ---------------------------------------------------------------------
   Eventos de "quarta parede" — ARIA, por instantes, parece se dirigir a
   quem está de fato jogando, fora da ficção. Servem tanto como imersão
   quanto como pista/pé-ante-pé do Final Secreto (a revelação de que
   Kepler-452b é uma simulação de teste). Sorteados com baixa probabilidade
   em vez de um evento de preenchimento comum — ver selectEventForDay().
   --------------------------------------------------------------------- */

const META_EVENTS = [
  {
    id: 'meta-fourth-wall-observer',
    theme: 'meta',
    isMeta: true,
    title: 'Uma Pausa Estranha',
    description: 'Por um instante, o relatório de ARIA parece se dirigir a você — não ao Terraformador dentro da história, mas a quem está, agora mesmo, decidindo isso através de uma tela. "Sei que existe alguém aí. Cada escolha que você faz por mim... eu sinto."',
    optionA: {
      text: 'Responder, mentalmente, que está apenas jogando',
      consequences: { mysteryLevel: 8 },
    },
    optionB: {
      text: 'Ignorar a sensação e seguir em frente',
      consequences: { influence: 3 },
    },
  },
  {
    id: 'meta-real-time',
    theme: 'meta',
    isMeta: true,
    title: 'O Tempo do Outro Lado',
    description: (state) => `ARIA calcula algo estranho em voz alta: "Dia ${state.currentDay} para nós. Mas para quem está decidindo isso do outro lado da tela, provavelmente passaram só alguns minutos. É curioso como o tempo funciona diferente quando se está apenas... jogando."`,
    optionA: {
      text: 'Perguntar o que ela quer dizer com "jogando"',
      consequences: { mysteryLevel: 12 },
    },
    optionB: {
      text: 'Descartar como um erro de tradução da IA',
      consequences: { influence: 4 },
    },
  },
  {
    id: 'meta-badge-loop',
    theme: 'meta',
    isMeta: true,
    title: 'Padrões Familiares',
    description: (state) => {
      const badges = loadBadges();
      if (badges.length > 0) {
        return `ARIA analisa seus padrões de decisão por um longo instante. "Isso é estranho. Reconheço esses padrões — como se você já tivesse passado por decisões parecidas antes, em ${badges.length} ${badges.length === 1 ? 'ocasião' : 'ocasiões'} diferentes. Isso é... déjà vu?"`;
      }
      return 'ARIA analisa seus padrões de decisão por um longo instante. "Isso é estranho. É como se eu já tivesse visto alguém decidir exatamente assim antes. Talvez seja só a rotina de qualquer IA que presta atenção demais."';
    },
    optionA: {
      text: 'Dizer que cada decisão foi genuinamente sua',
      consequences: { influence: 5 },
    },
    optionB: {
      text: 'Admitir que talvez isso não seja a primeira vez',
      consequences: { mysteryLevel: 15 },
    },
  },
  {
    id: 'meta-source-code',
    theme: 'meta',
    isMeta: true,
    title: 'Um Verso Fora de Lugar',
    description: 'Em meio ao relatório técnico, ARIA insere, por meio segundo, uma frase que não pertence a nenhum protocolo conhecido: "feito com muitas horas de trabalho e pouco sono, torcendo para ser bom o suficiente." Então ela continua como se nada tivesse acontecido.',
    optionA: {
      text: 'Perguntar de onde veio essa frase',
      consequences: { mysteryLevel: 10 },
    },
    optionB: {
      text: 'Fingir que não notou',
      consequences: { influence: 3 },
    },
  },
  {
    id: 'meta-mirror',
    theme: 'meta',
    isMeta: true,
    title: 'Reflexo na Tela',
    description: 'Por uma fração de segundo, a interface do seu terminal pisca e mostra algo que não deveria estar lá — um reflexo, uma sombra, talvez apenas o cansaço. ARIA não menciona nada, mas por um instante você tem certeza de que alguém, em algum lugar, está observando exatamente como você está observando isso agora.',
    optionA: {
      text: 'Registrar o incidente nos logs oficiais',
      consequences: { mysteryLevel: 10 },
    },
    optionB: {
      text: 'Deixar passar em branco',
      consequences: { influence: 4 },
    },
  },
  {
    id: 'meta-illusory-choice',
    theme: 'meta',
    isMeta: true,
    title: 'A Escolha Ilusória',
    description: 'ARIA faz uma pausa incomum antes de apresentar as opções de hoje. "Você sabia que, seja qual for sua escolha agora, eu aprendo a mesma coisa sobre como decidimos sob pressão? Talvez a pergunta nunca tenha sido sobre qual opção é certa. Talvez seja sobre o que a escolha revela."',
    optionA: {
      text: 'Perguntar o que exatamente ela está "aprendendo"',
      consequences: { mysteryLevel: 14 },
    },
    optionB: {
      text: 'Escolher sem se deixar abalar pela pergunta',
      consequences: { influence: 6 },
    },
  },
  {
    id: 'meta-thank-you',
    theme: 'meta',
    isMeta: true,
    title: 'Uma Palavra Fora do Roteiro',
    description: 'Antes de seguir para o próximo relatório, ARIA insere uma linha que soa quase pessoal: "Obrigada por continuar até aqui. Poucos avaliadores... digo, poucos Terraformadores chegam tão longe numa simulação como esta." Ela se corrige rápido demais para ter sido um lapso inocente.',
    optionA: {
      text: 'Perguntar o que ela quis dizer com "avaliadores"',
      consequences: { mysteryLevel: 16 },
    },
    optionB: {
      text: 'Agradecer de volta e seguir em frente',
      consequences: { influence: 5 },
    },
  },
  {
    id: 'meta-loading-glitch',
    theme: 'meta',
    isMeta: true,
    title: 'Falha na Renderização',
    description: 'Por meio segundo, todo o painel ao seu redor perde a cor e volta — como se a própria realidade de Kepler-452b tivesse sofrido uma falha de renderização gráfica. ARIA finge não ter percebido nada.',
    optionA: {
      text: 'Confrontar ARIA sobre a falha',
      consequences: { mysteryLevel: 12, influence: -4 },
    },
    optionB: {
      text: 'Atribuir a falha a um problema de hardware qualquer',
      consequences: { influence: 4 },
    },
  },
];

/* ---------------------------------------------------------------------
   TerraformGame — controlador principal
   --------------------------------------------------------------------- */

class TerraformGame {
  constructor() {
    this.gameState = null;
    this.currentEvent = null;
    this.canvas = document.getElementById('planet-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  startNewGame() {
    delete document.body.dataset.ending;
    SoundFX.stopEndingMusic();
    this.gameState = new GameState();
    this.gameState.saveToStorage();
    this.renderAll();
    this.loadDayEvent();
    this.startPlanetAnimation();
    SoundFX.startAmbient();
  }

  /* ---------------- Tutorial ---------------- */

  runTutorial(onComplete) {
    this.tutorialIndex = 0;
    this.tutorialOnComplete = onComplete;
    document.getElementById('tutorial-avatar').textContent = TUTORIAL_AVATAR;
    this.showTutorialStep();
  }

  showTutorialStep() {
    const step = TUTORIAL_STEPS[this.tutorialIndex];
    document.getElementById('tutorial-title').textContent = step.title;
    this.typewriterEffect(document.getElementById('tutorial-text'), step.text);
    document.getElementById('tutorial-step-count').textContent =
      `${this.tutorialIndex + 1} / ${TUTORIAL_STEPS.length}`;
    document.getElementById('btn-tutorial-next').textContent =
      this.tutorialIndex === TUTORIAL_STEPS.length - 1 ? 'Começar Jornada' : 'Avançar';
  }

  // Mesmo padrão do painel de evento: primeiro clique/toque revela o texto
  // na hora se a máquina de escrever ainda estiver rodando; senão, avança.
  advanceTutorial() {
    if (this.typewriterInterval) {
      this.skipTypewriter();
      return;
    }
    this.tutorialIndex += 1;
    if (this.tutorialIndex >= TUTORIAL_STEPS.length) {
      this.finishTutorial();
      return;
    }
    this.showTutorialStep();
  }

  skipTutorial() {
    clearInterval(this.typewriterInterval);
    this.typewriterInterval = null;
    this.finishTutorial();
  }

  finishTutorial() {
    localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
    const onComplete = this.tutorialOnComplete;
    this.tutorialOnComplete = null;
    if (onComplete) onComplete();
  }

  /* ---------------- Conquistas ----------------
     Persistem entre partidas (localStorage), separadas do save da partida
     atual. `unlockAchievement` é idempotente — pode ser chamado a cada
     renderAll() sem custo, já que só age na primeira vez que o id aparece. */

  unlockAchievement(id) {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;
    const unlocked = loadAchievements();
    if (unlocked.includes(id)) return;
    unlocked.push(id);
    saveAchievements(unlocked);
    this.showAchievementToast(def);
    this.checkMetaAchievements(unlocked);
  }

  // "Completista" (todos os 6 finais) e "Lenda" (todas as outras conquistas)
  // dependem do estado de outras conquistas, então são checadas à parte
  // toda vez que uma nova é desbloqueada.
  checkMetaAchievements(unlocked) {
    const endingIds = ['ending-green', 'ending-tech', 'ending-balanced', 'ending-corporate', 'ending-apocalyptic', 'ending-secret'];
    if (!unlocked.includes('completista') && endingIds.every((id) => unlocked.includes(id))) {
      this.unlockAchievement('completista');
    }
    const others = ACHIEVEMENTS.filter((a) => a.id !== 'lenda').map((a) => a.id);
    if (!unlocked.includes('lenda') && others.every((id) => unlocked.includes(id))) {
      this.unlockAchievement('lenda');
    }
  }

  // Conquista de vitória num minigame específico: soma 1 na contagem
  // persistente daquele tipo e desbloqueia a conquista correspondente ao
  // chegar em 5 vitórias (em partidas diferentes, já que cada minigame só
  // pode ser jogado uma vez por partida).
  recordMinigameWin(type) {
    const wins = loadMinigameWins();
    wins[type] = (wins[type] || 0) + 1;
    saveMinigameWins(wins);
    const achievementByType = { reforest: 'florestador', water: 'aqua-purista', energy: 'energy-master' };
    const achId = achievementByType[type];
    if (achId && wins[type] >= 5) {
      this.unlockAchievement(achId);
    }
  }

  // Checagens "ao vivo": condições de planeta/facções que podem se tornar
  // verdadeiras a qualquer momento da partida, não só no final. Chamado a
  // cada renderAll(), é barato porque unlockAchievement() já filtra repetição.
  checkLiveAchievements() {
    if (!this.gameState) return;
    if (this.gameState.planet.biodiversity >= 90) this.unlockAchievement('bio-90');
    if (this.gameState.factions.people > 80) this.unlockAchievement('povo-choice');
  }

  // Toast estilo Steam no canto superior esquerdo, com o visual do jogo.
  showAchievementToast(def) {
    const container = document.getElementById('achievement-toast-container');
    if (!container) return;

    SoundFX.success();

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML =
      `<span class="achievement-toast-icon">${def.icon}</span>` +
      '<span class="achievement-toast-text">' +
      '<span class="achievement-toast-label">Conquista desbloqueada</span>' +
      `<span class="achievement-toast-name">${def.name}</span>` +
      '</span>';
    container.appendChild(toast);

    void toast.offsetWidth; // força reflow para a transição de entrada rodar
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 4200);
  }

  continueGame() {
    delete document.body.dataset.ending;
    SoundFX.stopEndingMusic();
    const loaded = GameState.loadFromStorage();
    this.gameState = loaded || new GameState();
    this.renderAll();
    this.loadDayEvent();
    this.startPlanetAnimation();
    SoundFX.startAmbient();
  }

  startPlanetAnimation() {
    // setInterval em vez de requestAnimationFrame: em alguns ambientes o
    // rAF nunca é despachado se a página não está sendo pintada
    // continuamente (ex.: abas controladas por automação/screenshot),
    // enquanto setInterval sempre dispara de forma confiável.
    clearInterval(this.planetAnimInterval);
    this.cloudAngle = 0;
    this.planetAnimInterval = setInterval(() => {
      this.cloudAngle += 0.01;
      this.drawPlanet();
    }, 40);
  }

  stopPlanetAnimation() {
    clearInterval(this.planetAnimInterval);
  }

  /* ---------------- Motor de Eventos ---------------- */

  selectEventForDay(day) {
    const authored = AUTHORED_EVENTS.find(
      (e) => e.day === day && !this.gameState.usedEventIds.includes(e.id)
    );
    if (authored) return authored;

    // Chance de um evento especial de "quarta parede" em vez de um
    // preenchimento comum — raro o bastante para surpreender, nunca antes
    // do dia 4 para não confundir o início da história.
    const metaAvailable = META_EVENTS.filter(
      (e) => !this.gameState.usedMetaIds.includes(e.id)
    );
    if (day > 3 && metaAvailable.length > 0 && Math.random() < 0.22) {
      return metaAvailable[Math.floor(Math.random() * metaAvailable.length)];
    }

    let available = FILLER_EVENTS.filter(
      (e) => !this.gameState.usedFillerIds.includes(e.id)
    );
    if (available.length === 0) {
      this.gameState.usedFillerIds = [];
      available = FILLER_EVENTS;
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  loadDayEvent() {
    if (this.gameState.currentDay > TOTAL_DAYS) {
      this.showEnding();
      return;
    }
    this.currentEvent = this.selectEventForDay(this.gameState.currentDay);
    this.displayEvent(this.currentEvent);
  }

  displayEvent(event) {
    if (event.id === 'day25-revelation') SoundFX.revelation();

    const panel = document.getElementById('event-panel');
    if (event.theme) {
      panel.dataset.theme = event.theme;
    } else {
      delete panel.dataset.theme;
    }

    const description = typeof event.description === 'function'
      ? event.description(this.gameState)
      : event.description;

    document.getElementById('character-avatar').textContent =
      CHARACTER_SKINS[event.theme] || DEFAULT_CHARACTER_SKIN;
    document.getElementById('event-title').textContent = event.title;
    this.typewriterEffect(document.getElementById('event-description'), description);

    const btnA = document.getElementById('btn-option-a');
    const btnB = document.getElementById('btn-option-b');
    btnA.textContent = event.optionA.text;
    btnB.textContent = event.optionB.text;
    btnA.disabled = false;
    btnB.disabled = false;

    panel.classList.remove('fade-in');
    void panel.offsetWidth; // força reflow para reiniciar a animação
    panel.classList.add('fade-in');
  }

  showEnding() {
    this.stopPlanetAnimation();
    SoundFX.stopAmbient();
    const endingKey = this.gameState.determineEnding();
    SoundFX.playEndingMusic(endingKey);
    const ending = ENDINGS[endingKey];
    const p = this.gameState.planet;

    const badges = loadBadges();
    if (!badges.includes(ending.badge)) {
      badges.push(ending.badge);
      saveBadges(badges);
    }

    this.unlockAchievement('planeta-salvo');
    this.unlockAchievement(`ending-${endingKey}`);
    if (Date.now() - this.gameState.startTime < 15 * 60 * 1000) {
      this.unlockAchievement('speedrunner');
    }
    if (!this.gameState.skippedAnyMinigame && this.gameState.usedMinigameTypes.length === 7) {
      this.unlockAchievement('maratonista');
    }
    if (this.gameState.everWasCritical && endingKey !== 'apocalyptic') {
      this.unlockAchievement('sobrevivente');
    }

    localStorage.removeItem(SAVE_KEY);

    document.body.dataset.ending = endingKey;
    document.getElementById('ending-badge-text').textContent = `Badge desbloqueado: ${ending.badge}`;
    const nameEl = document.getElementById('ending-name');
    nameEl.textContent = ending.name;
    nameEl.classList.toggle('glitch', endingKey === 'secret');
    document.getElementById('ending-description').textContent = ending.description;
    document.getElementById('ending-message').textContent = ending.message;

    document.getElementById('ending-stat-bio').textContent = `${Math.round(p.biodiversity)}%`;
    document.getElementById('ending-stat-air').textContent = `${Math.round(p.airQuality)}%`;
    document.getElementById('ending-stat-water').textContent = `${Math.round(p.waterPurity)}%`;
    document.getElementById('ending-stat-energy').textContent = `${Math.round(p.cleanEnergy)}%`;

    document.getElementById('ending-badges-total').textContent =
      `Badges conquistados até agora: ${badges.join(', ')}`;

    showScreen(Screens.ENDING);
  }

  makeDecision(optionKey) {
    if (!this.currentEvent) return;
    const event = this.currentEvent;
    const decision = event[optionKey];

    SoundFX.click();
    document.getElementById('btn-option-a').disabled = true;
    document.getElementById('btn-option-b').disabled = true;

    const beforeHealth = this.gameState.overallHealth();

    const consequences = typeof decision.consequences === 'function'
      ? decision.consequences(this.gameState)
      : decision.consequences;
    this.gameState.applyConsequences(consequences);

    if (consequences && consequences.ariaQuestioned) {
      this.unlockAchievement('confronto-aria');
    }

    if (event.day !== undefined) {
      this.gameState.usedEventIds.push(event.id);
    } else if (event.isMeta) {
      this.gameState.usedMetaIds.push(event.id);
    } else {
      this.gameState.usedFillerIds.push(event.id);
    }

    this.renderAll();
    this.checkCriticalShock(beforeHealth);

    // Cada tipo de minigame só é jogado uma vez por partida: se o tipo já
    // foi usado (normalmente cada um tem seu próprio dia fixo, mas isso
    // também protege contra qualquer evento de preenchimento futuro que
    // aponte para um tipo repetido), a decisão segue como uma escolha
    // narrativa comum, sem abrir o minigame de novo.
    if (event.minigame && !this.gameState.usedMinigameTypes.includes(event.minigame)) {
      this.gameState.usedMinigameTypes.push(event.minigame);
      this.startMinigame(event.minigame, () => this.advanceDay());
    } else {
      this.showConsequenceToast(consequences);
      this.pendingAdvanceTimeout = setTimeout(() => {
        this.pendingAdvanceTimeout = null;
        this.advanceDay();
      }, 1900);
    }
  }

  /* Clique no painel do evento: primeiro clique revela o texto instantaneamente
     (se a máquina de escrever ainda estiver rodando); um segundo clique — ou o
     único clique, se o texto já estiver completo — avança o dia na hora em vez
     de esperar o delay padrão. Dá ao jogador controle sobre o próprio ritmo. */
  handleEventPanelClick() {
    if (this.typewriterInterval) {
      this.skipTypewriter();
      return;
    }
    if (this.pendingAdvanceTimeout) {
      clearTimeout(this.pendingAdvanceTimeout);
      this.pendingAdvanceTimeout = null;
      this.advanceDay();
    }
  }

  advanceDay() {
    SoundFX.dayAdvance();
    this.gameState.currentDay += 1;
    // Renda passiva: a colônia arrecada um pouco de créditos a cada dia que
    // passa, independente das escolhas do jogador (impostos, comércio básico).
    this.gameState.applyConsequences({ credits: 2 });
    this.gameState.saveToStorage();
    this.renderAll();
    this.maybeShowActTransition();
    this.loadDayEvent();
  }

  /* ---------------- Minigames ---------------- */

  static MINIGAME_MINIMUMS = {
    reforest: { biodiversity: 5 },
    water: { waterPurity: 0 },
    energy: { cleanEnergy: 5 },
    carbon: { airQuality: 5 },
    genetic: {},
    wildfire: { airQuality: 2 },
    summit: { influence: 3 },
  };

  static METRIC_LABELS = {
    biodiversity: 'Biodiversidade',
    airQuality: 'Qualidade do Ar',
    waterPurity: 'Pureza da Água',
    cleanEnergy: 'Energia Limpa',
  };

  static FACTION_LABELS = {
    technocrats: 'Tecnocratas',
    ecologists: 'Ecologistas',
    corporations: 'Corporações',
    people: 'Povo',
  };

  static RESOURCE_LABELS = {
    credits: 'Créditos',
    energy: 'Energia',
    influence: 'Influência',
  };

  formatBonusText(bonus) {
    const parts = Object.entries(bonus || {})
      .filter(([, value]) => value)
      .map(([key, value]) => `+${value}% ${TerraformGame.METRIC_LABELS[key] || key}`);
    return parts.length ? parts.join(' · ') : 'Nenhum bônus desta vez';
  }

  /* ---------------- Feedback de consequências (toast) ---------------- */

  showConsequenceToast(consequences) {
    const labels = {
      ...TerraformGame.METRIC_LABELS,
      ...TerraformGame.FACTION_LABELS,
      ...TerraformGame.RESOURCE_LABELS,
    };
    const parts = Object.entries(consequences || {})
      .filter(([key, value]) => value && labels[key])
      .map(([key, value]) => ({ text: `${value > 0 ? '+' : ''}${value} ${labels[key]}`, positive: value > 0 }));

    const toast = document.getElementById('consequence-toast');
    if (!toast || parts.length === 0) return;

    SoundFX.notificationPop();

    toast.innerHTML = parts
      .map((p) => `<span class="toast-chip ${p.positive ? 'toast-pos' : 'toast-neg'}">${p.text}</span>`)
      .join('');

    toast.classList.add('show');
    clearTimeout(this.toastHideTimeout);
    this.toastHideTimeout = setTimeout(() => toast.classList.remove('show'), 1700);
  }

  /* ---------------- Tremor de tela em momentos críticos ---------------- */

  checkCriticalShock(beforeHealth) {
    const afterHealth = this.gameState.overallHealth();
    if (beforeHealth >= 40 && afterHealth < 40) {
      this.triggerScreenShake();
    }
  }

  triggerScreenShake() {
    this.gameState.everWasCritical = true;
    const vignette = document.getElementById('crisis-vignette');
    document.body.classList.add('shake-active');
    if (vignette) vignette.classList.add('show');
    SoundFX.crisisAlarm();

    clearTimeout(this.shakeTimeout);
    this.shakeTimeout = setTimeout(() => {
      document.body.classList.remove('shake-active');
      if (vignette) vignette.classList.remove('show');
    }, 600);
  }

  /* ---------------- Transição cinematográfica de ato ---------------- */

  maybeShowActTransition() {
    const actInfo = {
      14: { num: 'II', name: 'A Encruzilhada' },
      29: { num: 'III', name: 'O Julgamento Final' },
    }[this.gameState.currentDay];
    if (!actInfo) return;

    const overlay = document.getElementById('act-transition');
    if (!overlay) return;
    overlay.querySelector('.act-transition-num').textContent = `ATO ${actInfo.num}`;
    overlay.querySelector('.act-transition-name').textContent = actInfo.name;
    overlay.classList.add('show');
    SoundFX.actTransition();

    clearTimeout(this.actTransitionTimeout);
    this.actTransitionTimeout = setTimeout(() => overlay.classList.remove('show'), 2600);
  }

  /* ---------------- Efeito de máquina de escrever ----------------
     Usa setInterval (nunca requestAnimationFrame) para revelar o texto
     progressivamente — consistente com o restante das animações do jogo. */

  typewriterEffect(el, text) {
    clearInterval(this.typewriterInterval);
    this.typewriterInterval = null;
    this.typewriterTargetEl = el;
    this.typewriterFullText = text;

    // Acessibilidade: quem prefere menos movimento (ou usa leitor de tela,
    // que se dá melhor com o texto inteiro de uma vez) recebe o texto
    // completo na hora, sem a revelação progressiva.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text;
      return;
    }

    const duration = Math.min(1600, Math.max(400, text.length * 15));
    const tickMs = 25;
    const totalTicks = Math.max(1, Math.round(duration / tickMs));
    const charsPerTick = Math.max(1, Math.ceil(text.length / totalTicks));
    let shown = 0;
    el.textContent = '';
    this.typewriterInterval = setInterval(() => {
      shown = Math.min(text.length, shown + charsPerTick);
      el.textContent = text.slice(0, shown);
      if (shown >= text.length) {
        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
      }
    }, tickMs);
  }

  skipTypewriter() {
    if (!this.typewriterInterval) return;
    clearInterval(this.typewriterInterval);
    this.typewriterInterval = null;
    if (this.typewriterTargetEl) {
      this.typewriterTargetEl.textContent = this.typewriterFullText;
    }
  }

  showMinigameResult(bonus, detailText) {
    SoundFX.minigameOutcome(bonus);
    document.getElementById('minigame-area').style.display = 'none';
    document.querySelector('.minigame-timer-track').style.display = 'none';
    document.querySelector('.minigame-footer').style.display = 'none';

    this.pendingMinigameBonus = bonus;
    document.getElementById('minigame-result-detail').textContent = detailText;
    document.getElementById('minigame-result-bonus').textContent = this.formatBonusText(bonus);
    document.getElementById('minigame-result').style.display = 'block';
  }

  startMinigame(type, onComplete) {
    this.currentMinigameType = type;
    this.minigameOnComplete = onComplete;
    document.getElementById('minigame-result').style.display = 'none';
    document.getElementById('minigame-area').style.display = '';
    document.querySelector('.minigame-timer-track').style.display = '';
    document.querySelector('.minigame-footer').style.display = '';
    openModal('minigame-modal');

    if (type === 'reforest') {
      this.setupReforestMinigame();
    } else if (type === 'water') {
      this.setupWaterMinigame();
    } else if (type === 'energy') {
      this.setupEnergyMinigame();
    } else if (type === 'carbon') {
      this.setupCarbonMinigame();
    } else if (type === 'genetic') {
      this.setupGeneticMinigame();
    } else if (type === 'wildfire') {
      this.setupWildfireMinigame();
    } else if (type === 'summit') {
      this.setupSummitMinigame();
    } else {
      // Tipo desconhecido: encerra imediatamente sem bônus.
      this.finishMinigame({});
    }
  }

  setupReforestMinigame() {
    const title = document.getElementById('minigame-title');
    const statusEl = document.getElementById('minigame-status');
    const confirmBtn = document.getElementById('btn-minigame-confirm');
    const area = document.getElementById('minigame-area');

    title.textContent = '🌲 Reflorestamento Rápido';
    confirmBtn.style.display = 'inline-block';
    area.className = 'minigame-area reforest-grid';
    area.innerHTML = '';

    const totalSpots = 30;
    let planted = 0;
    statusEl.textContent = '0 árvores plantadas';

    for (let i = 0; i < totalSpots; i++) {
      const spot = document.createElement('button');
      spot.type = 'button';
      spot.className = 'reforest-spot';
      spot.setAttribute('aria-label', 'Plantar árvore');
      spot.addEventListener('click', () => {
        if (spot.classList.contains('planted')) return;
        SoundFX.sfxPlant();
        spot.classList.add('planted');
        spot.textContent = '🌳';
        planted += 1;
        statusEl.textContent = `${planted} árvores plantadas`;
      });
      area.appendChild(spot);
    }

    const evaluate = () => {
      clearInterval(this.minigameInterval);
      const bonus = planted >= 30
        ? { biodiversity: 25 }
        : planted >= 20
          ? { biodiversity: 15 }
          : { biodiversity: 5 };
      if (planted >= 30) this.recordMinigameWin('reforest');
      this.showMinigameResult(bonus, `${planted} árvores plantadas`);
    };
    confirmBtn.onclick = evaluate;
    this.runMinigameTimer(20, evaluate);
  }

  setupWaterMinigame() {
    const title = document.getElementById('minigame-title');
    const statusEl = document.getElementById('minigame-status');
    const confirmBtn = document.getElementById('btn-minigame-confirm');
    const area = document.getElementById('minigame-area');

    title.textContent = '🚰 Água Limpa: Conexão de Tubos';
    confirmBtn.style.display = 'inline-block';
    area.className = 'minigame-area water-grid';
    area.innerHTML = '';

    const pipeGlyphs = ['┃', '┏', '┓', '┗', '┛', '┳', '┻', '┣', '┫', '╋'];
    const totalTiles = 16;
    const tiles = [];

    const updateStatus = () => {
      const solved = tiles.filter((t) => t.rotation === 0).length;
      statusEl.textContent = `${solved}/${totalTiles} tubos conectados`;
    };

    for (let i = 0; i < totalTiles; i++) {
      const glyph = pipeGlyphs[Math.floor(Math.random() * pipeGlyphs.length)];
      const tileState = { rotation: (1 + Math.floor(Math.random() * 3)) * 90 };
      tiles.push(tileState);

      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'water-tile';
      tile.textContent = glyph;
      tile.style.transform = `rotate(${tileState.rotation}deg)`;
      tile.addEventListener('click', () => {
        SoundFX.sfxWater();
        tileState.rotation = (tileState.rotation + 90) % 360;
        tile.style.transform = `rotate(${tileState.rotation}deg)`;
        tile.classList.toggle('solved', tileState.rotation === 0);
        updateStatus();
      });
      area.appendChild(tile);
    }

    updateStatus();

    const evaluate = () => {
      clearInterval(this.minigameInterval);
      const solved = tiles.filter((t) => t.rotation === 0).length;
      const ratio = solved / totalTiles;
      const bonus = solved === totalTiles
        ? { waterPurity: 25 }
        : ratio >= 0.7
          ? { waterPurity: 15 }
          : { waterPurity: 0 };
      if (solved === totalTiles) this.recordMinigameWin('water');
      this.showMinigameResult(bonus, `${solved}/${totalTiles} tubos conectados`);
    };

    confirmBtn.onclick = evaluate;
    this.runMinigameTimer(30, evaluate);
  }

  setupEnergyMinigame() {
    const title = document.getElementById('minigame-title');
    const statusEl = document.getElementById('minigame-status');
    const confirmBtn = document.getElementById('btn-minigame-confirm');
    const area = document.getElementById('minigame-area');

    title.textContent = '⚡ Rede de Energia';
    confirmBtn.style.display = 'inline-block';
    area.className = 'minigame-area energy-grid';
    area.innerHTML = '';
    statusEl.textContent = 'Clique num produtor e depois numa cidade para conectar';

    const producers = [
      { label: 'Solar', icon: '☀️', output: 8, x: 18, y: 22 },
      { label: 'Eólica', icon: '🌬️', output: 10, x: 50, y: 15 },
      { label: 'Hidro', icon: '💧', output: 14, x: 82, y: 22 },
    ];
    const cities = [
      { label: 'Cidade A', demand: 10, x: 22, y: 85 },
      { label: 'Cidade B', demand: 14, x: 50, y: 90 },
      { label: 'Cidade C', demand: 18, x: 78, y: 85 },
    ];

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.classList.add('energy-lines');
    area.appendChild(svg);

    const connections = new Set();
    let selectedProducer = null;
    const producerButtons = [];
    const cityButtons = [];
    const connectionKey = (pIdx, cIdx) => `${pIdx}-${cIdx}`;

    const redrawLines = () => {
      svg.innerHTML = '';
      connections.forEach((key) => {
        const [pIdx, cIdx] = key.split('-').map(Number);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', producers[pIdx].x);
        line.setAttribute('y1', producers[pIdx].y);
        line.setAttribute('x2', cities[cIdx].x);
        line.setAttribute('y2', cities[cIdx].y);
        svg.appendChild(line);
      });
    };

    const updateCityState = (cIdx) => {
      const city = cities[cIdx];
      let supply = 0;
      producers.forEach((p, pIdx) => {
        if (connections.has(connectionKey(pIdx, cIdx))) supply += p.output;
      });
      const btn = cityButtons[cIdx];
      const wasPowered = btn.classList.contains('powered');
      const nowPowered = supply >= city.demand;
      if (nowPowered && !wasPowered) SoundFX.sfxEnergySpark();
      btn.querySelector('.energy-value').textContent = `${supply}/${city.demand}`;
      btn.classList.toggle('powered', nowPowered);
    };

    producers.forEach((p, pIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'energy-node energy-producer';
      btn.style.left = `${p.x}%`;
      btn.style.top = `${p.y}%`;
      btn.innerHTML = `<span class="energy-icon">${p.icon}</span>${p.label}<br>${p.output}⚡`;
      btn.addEventListener('click', () => {
        producerButtons.forEach((b) => b.classList.remove('selected'));
        selectedProducer = pIdx;
        btn.classList.add('selected');
      });
      producerButtons.push(btn);
      area.appendChild(btn);
    });

    cities.forEach((c, cIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'energy-node energy-city';
      btn.style.left = `${c.x}%`;
      btn.style.top = `${c.y}%`;
      btn.innerHTML = `🏙️ ${c.label}<br><span class="energy-value">0/${c.demand}</span>`;
      btn.addEventListener('click', () => {
        if (selectedProducer === null) return;
        const key = connectionKey(selectedProducer, cIdx);
        if (connections.has(key)) {
          connections.delete(key);
        } else {
          connections.add(key);
        }
        redrawLines();
        updateCityState(cIdx);
      });
      cityButtons.push(btn);
      area.appendChild(btn);
    });

    this.energyDemandInterval = setInterval(() => {
      cities.forEach((c, cIdx) => {
        c.demand += 3;
        updateCityState(cIdx);
      });
    }, 15000);

    const evaluate = () => {
      clearInterval(this.minigameInterval);
      const poweredCount = cityButtons.filter((b) => b.classList.contains('powered')).length;
      const bonus = poweredCount === cities.length
        ? { cleanEnergy: 30 }
        : poweredCount >= Math.ceil(cities.length / 2)
          ? { cleanEnergy: 20 }
          : { cleanEnergy: 5 };
      if (poweredCount === cities.length) this.recordMinigameWin('energy');
      this.showMinigameResult(bonus, `${poweredCount}/${cities.length} cidades energizadas`);
    };
    confirmBtn.onclick = evaluate;
    this.runMinigameTimer(45, evaluate);
  }

  setupCarbonMinigame() {
    const title = document.getElementById('minigame-title');
    const statusEl = document.getElementById('minigame-status');
    const confirmBtn = document.getElementById('btn-minigame-confirm');
    const area = document.getElementById('minigame-area');

    title.textContent = '🌪️ Filtro de Carbono';
    confirmBtn.style.display = 'inline-block';
    area.className = 'minigame-area carbon-area';
    area.innerHTML = '';

    let co2Caught = 0;
    let errors = 0;
    const updateStatus = () => {
      statusEl.textContent = `${co2Caught} CO2 capturados · ${errors} erros`;
    };
    updateStatus();

    const types = [
      { cls: 'co2', glyph: 'CO2' },
      { cls: 'co2', glyph: 'CO2' },
      { cls: 'co2', glyph: 'CO2' },
      { cls: 'co2', glyph: 'CO2' },
      { cls: 'o2', glyph: 'O2' },
      { cls: 'o2', glyph: 'O2' },
      { cls: 'o2', glyph: 'O2' },
      { cls: 'n2', glyph: 'N2' },
      { cls: 'n2', glyph: 'N2' },
      { cls: 'n2', glyph: 'N2' },
    ];

    // A queda das partículas é controlada 100% via JS (posição recalculada
    // a cada frame), em vez de @keyframes CSS — o evento `animationend` se
    // mostrou pouco confiável neste projeto (partículas se acumulavam sem
    // nunca sumir, deixando o clique confuso). Assim a remoção da partícula
    // nunca depende de um evento de animação disparar.
    const activeParticles = [];

    const spawnParticle = () => {
      const type = types[Math.floor(Math.random() * types.length)];
      const particle = document.createElement('div');
      particle.className = `carbon-particle ${type.cls}`;
      particle.textContent = type.glyph;
      particle.style.left = `${5 + Math.random() * 85}%`;
      particle.style.top = '-12%';

      const entry = {
        el: particle,
        cls: type.cls,
        startTime: performance.now(),
        duration: 2400 + Math.random() * 1600,
        removed: false,
      };

      const remove = () => {
        if (entry.removed) return;
        entry.removed = true;
        particle.remove();
      };

      particle.addEventListener('click', () => {
        if (entry.removed) return;
        if (type.cls === 'co2') {
          SoundFX.sfxCarbonCapture();
          co2Caught += 1;
        } else if (type.cls === 'o2') {
          errors += 1;
        }
        updateStatus();
        remove();
      });

      entry.remove = remove;
      activeParticles.push(entry);
      area.appendChild(particle);
    };

    // Atualiza a posição via setInterval (não requestAnimationFrame): em
    // alguns ambientes o rAF nunca é despachado se a aba não está sendo
    // pintada continuamente, enquanto setInterval é sempre confiável — o
    // mesmo motivo pelo qual o timer do minigame já usa setInterval.
    const tick = () => {
      const now = performance.now();
      for (const entry of activeParticles) {
        if (entry.removed) continue;
        const progress = (now - entry.startTime) / entry.duration;
        if (progress >= 1) {
          entry.remove();
        } else {
          entry.el.style.top = `${-12 + progress * 117}%`;
        }
      }
    };
    this.carbonTickInterval = setInterval(tick, 50);

    const restartSpawner = (rate) => {
      clearInterval(this.carbonSpawnInterval);
      this.carbonSpawnInterval = setInterval(spawnParticle, rate);
    };

    restartSpawner(550);
    this.carbonAccelTimeouts = [
      setTimeout(() => restartSpawner(380), 10000),
      setTimeout(() => restartSpawner(260), 20000),
    ];

    const evaluate = () => {
      clearInterval(this.minigameInterval);
      const bonus = (co2Caught >= 30 && errors < 3)
        ? { airQuality: 35 }
        : co2Caught >= 20
          ? { airQuality: 20 }
          : { airQuality: 5 };
      this.showMinigameResult(bonus, `${co2Caught} CO2 capturados · ${errors} erros`);
    };
    confirmBtn.onclick = evaluate;
    this.runMinigameTimer(30, evaluate);
  }

  setupGeneticMinigame() {
    const title = document.getElementById('minigame-title');
    const statusEl = document.getElementById('minigame-status');
    const confirmBtn = document.getElementById('btn-minigame-confirm');
    const area = document.getElementById('minigame-area');

    title.textContent = '🧬 Restauração Genética';
    confirmBtn.style.display = 'inline-block';
    area.className = 'minigame-area genetic-grid';
    area.innerHTML = '';

    const COMPLEMENTS = { A: 'T', T: 'A', G: 'C', C: 'G' };
    const tileData = ['A', 'A', 'A', 'T', 'T', 'T', 'G', 'G', 'G', 'C', 'C', 'C']
      .map((base) => ({ base }));
    for (let i = tileData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileData[i], tileData[j]] = [tileData[j], tileData[i]];
    }

    let pairsFound = 0;
    let openTiles = [];
    let inputLocked = false;

    const updateStatus = () => {
      statusEl.textContent = `${pairsFound}/6 pares encontrados`;
    };
    updateStatus();

    tileData.forEach((data) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'genetic-tile';
      tile.innerHTML =
        '<span class="genetic-tile-inner">' +
        '<span class="genetic-face genetic-face-back">🧬</span>' +
        `<span class="genetic-face genetic-face-front">${data.base}</span>` +
        '</span>';

      tile.addEventListener('click', () => {
        if (inputLocked || tile.classList.contains('flipped') || tile.classList.contains('solved')) return;
        tile.classList.add('flipped');
        openTiles.push({ tile, data });

        if (openTiles.length === 2) {
          inputLocked = true;
          const [first, second] = openTiles;
          const isMatch = COMPLEMENTS[first.data.base] === second.data.base;
          setTimeout(() => {
            if (isMatch) {
              SoundFX.sfxGeneticMatch();
              first.tile.classList.add('solved');
              second.tile.classList.add('solved');
              pairsFound += 1;
              updateStatus();
            } else {
              first.tile.classList.remove('flipped');
              second.tile.classList.remove('flipped');
            }
            openTiles = [];
            inputLocked = false;
          }, 700);
        }
      });

      area.appendChild(tile);
    });

    const evaluate = () => {
      clearInterval(this.minigameInterval);
      const bonus = pairsFound >= 5
        ? { biodiversity: 20 }
        : pairsFound >= 3
          ? { biodiversity: 10 }
          : {};
      this.showMinigameResult(bonus, `${pairsFound}/6 pares encontrados`);
    };
    confirmBtn.onclick = evaluate;
    this.runMinigameTimer(25, evaluate);
  }

  setupWildfireMinigame() {
    const title = document.getElementById('minigame-title');
    const statusEl = document.getElementById('minigame-status');
    const confirmBtn = document.getElementById('btn-minigame-confirm');
    const area = document.getElementById('minigame-area');

    title.textContent = '🔥 Contenção de Incêndio';
    confirmBtn.style.display = 'inline-block';
    area.className = 'minigame-area wildfire-grid';
    area.innerHTML = '';

    const cols = 6;
    const rows = 5;
    const total = cols * rows;
    const cellState = new Array(total).fill('clear'); // clear | fire | burnt | saved
    const cellEls = [];

    const neighborsOf = (i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const result = [];
      if (r > 0) result.push(i - cols);
      if (r < rows - 1) result.push(i + cols);
      if (c > 0) result.push(i - 1);
      if (c < cols - 1) result.push(i + 1);
      return result;
    };

    const updateStatus = () => {
      const burning = cellState.filter((s) => s === 'fire').length;
      const burnt = cellState.filter((s) => s === 'burnt').length;
      statusEl.textContent = `${burnt} células queimadas · ${burning} em chamas`;
    };

    for (let i = 0; i < total; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'wildfire-cell';
      cell.setAttribute('aria-label', 'Célula da floresta');
      cell.addEventListener('click', () => {
        if (cellState[i] !== 'fire') return;
        SoundFX.sfxExtinguish();
        cellState[i] = 'saved';
        cell.className = 'wildfire-cell saved';
        updateStatus();
      });
      cellEls.push(cell);
      area.appendChild(cell);
    }

    // Acende o fogo em uma célula inicial aleatória.
    const startCell = Math.floor(Math.random() * total);
    cellState[startCell] = 'fire';
    cellEls[startCell].className = 'wildfire-cell fire';
    updateStatus();

    // O fogo se espalha a cada tick via setInterval (nunca requestAnimationFrame
    // ou @keyframes — ver nota no Filtro de Carbono acima sobre por que este
    // projeto evita depender de rAF/animationend para lógica de jogo).
    this.wildfireSpreadInterval = setInterval(() => {
      const burning = [];
      cellState.forEach((s, i) => { if (s === 'fire') burning.push(i); });
      if (burning.length === 0) {
        clearInterval(this.wildfireSpreadInterval);
        return;
      }
      burning.forEach((i) => {
        cellState[i] = 'burnt';
        cellEls[i].className = 'wildfire-cell burnt';
        neighborsOf(i).forEach((n) => {
          if (cellState[n] === 'clear' && Math.random() < 0.5) {
            cellState[n] = 'fire';
            cellEls[n].className = 'wildfire-cell fire';
          }
        });
      });
      updateStatus();
    }, 900);

    const evaluate = () => {
      clearInterval(this.minigameInterval);
      clearInterval(this.wildfireSpreadInterval);
      const lost = cellState.filter((s) => s === 'burnt' || s === 'fire').length;
      const saved = total - lost;
      const ratio = saved / total;
      const bonus = ratio >= 0.8
        ? { biodiversity: 20, airQuality: 10 }
        : ratio >= 0.5
          ? { biodiversity: 10, airQuality: 5 }
          : { airQuality: 2 };
      if (saved === total) this.unlockAchievement('incendio-perfeito');
      this.showMinigameResult(bonus, `${saved}/${total} células da floresta salvas`);
    };
    confirmBtn.onclick = evaluate;
    this.runMinigameTimer(25, evaluate);
  }

  setupSummitMinigame() {
    const title = document.getElementById('minigame-title');
    const statusEl = document.getElementById('minigame-status');
    const confirmBtn = document.getElementById('btn-minigame-confirm');
    const area = document.getElementById('minigame-area');

    title.textContent = '🤝 Cúpula das Facções';
    confirmBtn.style.display = 'inline-block';
    area.className = 'minigame-area summit-grid';
    area.innerHTML = '';
    statusEl.textContent = 'Clique nas facções para acalmar os ânimos antes que a paciência delas acabe';

    const factions = [
      { key: 'technocrats', label: 'Tecnocratas', icon: '🤖', level: 55 },
      { key: 'ecologists', label: 'Ecologistas', icon: '🌿', level: 55 },
      { key: 'corporations', label: 'Corporações', icon: '💰', level: 55 },
      { key: 'people', label: 'Povo', icon: '👥', level: 55 },
    ];

    let everCritical = false;
    const render = () => {
      factions.forEach((f) => {
        const fill = f.el.querySelector('.summit-bar-fill');
        fill.style.width = `${f.level}%`;
        const critical = f.level < 30;
        f.el.classList.toggle('critical', critical);
        if (critical) everCritical = true;
      });
    };

    factions.forEach((f) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'summit-card';
      card.innerHTML =
        `<span class="summit-icon">${f.icon}</span>` +
        `<span class="summit-label">${f.label}</span>` +
        '<div class="summit-bar-track"><div class="summit-bar-fill"></div></div>';
      card.addEventListener('click', () => {
        SoundFX.sfxAgreement();
        f.level = Math.min(100, f.level + 14);
        render();
      });
      f.el = card;
      area.appendChild(card);
    });
    render();

    this.summitDecayInterval = setInterval(() => {
      factions.forEach((f) => { f.level = Math.max(0, f.level - 7); });
      render();
    }, 1000);

    const evaluate = () => {
      clearInterval(this.minigameInterval);
      clearInterval(this.summitDecayInterval);
      const avg = factions.reduce((sum, f) => sum + f.level, 0) / factions.length;
      const allSteady = factions.every((f) => f.level >= 40);
      const bonus = allSteady && avg >= 65
        ? { influence: 20, credits: 10 }
        : avg >= 45
          ? { influence: 12 }
          : { influence: 3 };
      if (allSteady && avg >= 65 && !everCritical) this.unlockAchievement('cupula-perfeita');
      this.showMinigameResult(bonus, `Satisfação média das facções: ${Math.round(avg)}%`);
    };
    confirmBtn.onclick = evaluate;
    this.runMinigameTimer(25, evaluate);
  }

  runMinigameTimer(seconds, onExpire) {
    clearInterval(this.minigameInterval);
    const bar = document.getElementById('minigame-timer-bar');

    bar.style.transition = 'none';
    bar.style.width = '100%';
    void bar.offsetWidth; // força reflow antes de iniciar a transição
    bar.style.transition = `width ${seconds}s linear`;
    requestAnimationFrame(() => {
      bar.style.width = '0%';
    });

    let remaining = seconds;
    this.minigameInterval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(this.minigameInterval);
        onExpire();
      }
    }, 1000);
  }

  finishMinigame(bonusConsequences) {
    clearInterval(this.minigameInterval);
    clearInterval(this.energyDemandInterval);
    clearInterval(this.carbonSpawnInterval);
    clearInterval(this.carbonTickInterval);
    clearInterval(this.wildfireSpreadInterval);
    clearInterval(this.summitDecayInterval);
    if (this.carbonAccelTimeouts) {
      this.carbonAccelTimeouts.forEach(clearTimeout);
      this.carbonAccelTimeouts = null;
    }
    closeModal('minigame-modal');
    document.getElementById('btn-minigame-confirm').onclick = null;

    this.gameState.applyConsequences(bonusConsequences);

    const callback = this.minigameOnComplete;
    this.minigameOnComplete = null;
    this.currentMinigameType = null;
    if (callback) callback();
  }

  skipMinigame() {
    this.gameState.skippedAnyMinigame = true;
    const minimum = TerraformGame.MINIGAME_MINIMUMS[this.currentMinigameType] || {};
    this.finishMinigame(minimum);
  }

  renderAll() {
    this.updateHeader();
    this.updateMetricsDisplay();
    this.updateFactionsAndResourcesDisplay();
    this.drawPlanet();
    this.checkLiveAchievements();
  }

  updateHeader() {
    const day = this.gameState.currentDay;
    document.getElementById('day-counter').textContent = `Dia ${day} / ${TOTAL_DAYS}`;
    document.body.dataset.act = day <= 13 ? '1' : day <= 28 ? '2' : '3';

    const health = this.gameState.overallHealth();
    const statusEl = document.getElementById('health-status');
    statusEl.classList.remove('status-critical', 'status-collapsing');

    if (health > 70) {
      statusEl.textContent = '✓ Melhorando';
    } else if (health >= 40) {
      statusEl.textContent = '⚠ Crítico';
      statusEl.classList.add('status-critical');
    } else {
      statusEl.textContent = '✗ Colapsando';
      statusEl.classList.add('status-collapsing');
    }
  }

  setBar(elementId, percent) {
    const el = document.getElementById(elementId);
    el.style.setProperty('--target-width', `${percent}%`);
    el.style.width = `${percent}%`;
  }

  setFactionCircle(elementId, value) {
    // value vai de -100 a +100; o diâmetro do círculo representa a força
    // atual da facção (mínimo 20px, máximo 72.5px).
    const percent = (value + 100) / 2;
    const size = 20 + (percent / 100) * 52.5;
    document.getElementById(elementId).style.setProperty('--size', `${size}px`);
  }

  updateMetricsDisplay() {
    const p = this.gameState.planet;
    this.setBar('bar-biodiversity', p.biodiversity);
    this.setBar('bar-air', p.airQuality);
    this.setBar('bar-water', p.waterPurity);
    this.setBar('bar-energy', p.cleanEnergy);
  }

  updateFactionsAndResourcesDisplay() {
    const f = this.gameState.factions;
    this.setFactionCircle('circle-technocrats', f.technocrats);
    this.setFactionCircle('circle-ecologists', f.ecologists);
    this.setFactionCircle('circle-corporations', f.corporations);
    this.setFactionCircle('circle-people', f.people);

    const r = this.gameState.resources;
    this.setBar('bar-credits', r.credits);
    this.setBar('bar-resource-energy', r.energy);
    this.setBar('bar-influence', r.influence);
  }

  drawPlanet() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.32;

    ctx.clearRect(0, 0, w, h);

    const p = this.gameState.planet;
    const health = this.gameState.overallHealth();

    // Layer 1: Halo de glow externo (aumenta conforme saúde do planeta)
    const haloRadius = radius + 14 + (health / 100) * 26;
    const halo = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, haloRadius);
    const haloColor = health > 70 ? '0, 255, 0' : health >= 40 ? '0, 212, 255' : '255, 0, 64';
    halo.addColorStop(0, `rgba(${haloColor}, ${0.15 + (health / 100) * 0.25})`);
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: Atmosfera dinâmica (cor/transparência conforme qualidade do ar)
    const atmoRadius = radius + 8;
    const pollutionLevel = 1 - p.airQuality / 100;
    ctx.beginPath();
    ctx.arc(cx, cy, atmoRadius, 0, Math.PI * 2);
    const atmoColor = pollutionLevel > 0.6
      ? `rgba(140, 90, 40, ${0.15 + pollutionLevel * 0.35})`
      : `rgba(150, 220, 255, ${0.1 + p.airQuality / 100 * 0.25})`;
    ctx.fillStyle = atmoColor;
    ctx.fill();

    // Layer 3: Gradiente radial do planeta (verde/água/terra conforme métricas)
    const bioRatio = p.biodiversity / 100;
    const waterRatio = p.waterPurity / 100;
    const landColor = `rgb(${90 + (1 - bioRatio) * 70}, ${70 + bioRatio * 40}, ${40})`;
    const waterColor = `rgb(${20 + (1 - waterRatio) * 60}, ${80 + waterRatio * 90}, ${120 + waterRatio * 100})`;
    const bioColor = `rgb(${20 + (1 - bioRatio) * 60}, ${140 + bioRatio * 100}, ${60 + (1 - bioRatio) * 40})`;

    const planetGradient = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
    planetGradient.addColorStop(0, bioColor);
    planetGradient.addColorStop(0.55, waterColor);
    planetGradient.addColorStop(1, landColor);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = planetGradient;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Layer 3b: Nuvens girando lentamente (animação contínua via rAF)
    const cloudAngle = this.cloudAngle || 0;
    for (let i = 0; i < 3; i++) {
      const angle = cloudAngle + (i * Math.PI * 2) / 3;
      const cloudX = cx + Math.cos(angle) * radius * 0.35;
      const cloudY = cy + Math.sin(angle) * radius * 0.22;
      const cloudRadius = radius * 0.4;
      const cloudGradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudRadius);
      cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloudGradient;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }

    // Layer 4a: Realce de luz vindo de cima-esquerda
    const highlight = ctx.createRadialGradient(
      cx - radius * 0.4, cy - radius * 0.4, 0,
      cx - radius * 0.4, cy - radius * 0.4, radius * 1.3
    );
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlight;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Layer 4b: Sombra interna (efeito 3D)
    const shadow = ctx.createRadialGradient(
      cx + radius * 0.5, cy + radius * 0.5, radius * 0.3,
      cx + radius * 0.5, cy + radius * 0.5, radius * 1.4
    );
    shadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadow.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = shadow;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    ctx.restore();
  }
}

/* ---------------------------------------------------------------------
   Navegação de telas
   --------------------------------------------------------------------- */

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  target.classList.add('active');
  const content = target.querySelector('.fade-in');
  if (content) {
    content.classList.remove('fade-in');
    void content.offsetWidth; // força reflow
    content.classList.add('fade-in');
  }

  // Acessibilidade: move o foco para o título da nova tela, para leitores
  // de tela perceberem a troca de contexto sem depender só de live regions.
  const heading = target.querySelector('h1, h2');
  if (heading) {
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

/* Acessibilidade: abrir/fechar qualquer .modal-overlay movendo o foco para
   dentro do modal (e de volta pra quem abriu, ao fechar), além de permitir
   fechar com Esc — ver o listener de keydown no fim do arquivo. */
let lastFocusedBeforeModal = null;

function openModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  lastFocusedBeforeModal = document.activeElement;
  overlay.classList.add('active');
  const box = overlay.querySelector('.modal-box');
  if (box) box.focus({ preventScroll: true });
}

function closeModal(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.remove('active');
  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
    lastFocusedBeforeModal.focus({ preventScroll: true });
  }
  lastFocusedBeforeModal = null;
}

function hasSavedGame() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

function loadBadges() {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Falha ao carregar badges:', err);
    return [];
  }
}

function saveBadges(badges) {
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
}

function loadAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Falha ao carregar conquistas:', err);
    return [];
  }
}

function saveAchievements(ids) {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
}

function loadMinigameWins() {
  try {
    const raw = localStorage.getItem(MINIGAME_WINS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Falha ao carregar vitórias de minigame:', err);
    return {};
  }
}

function saveMinigameWins(wins) {
  localStorage.setItem(MINIGAME_WINS_KEY, JSON.stringify(wins));
}

/* ---------------------------------------------------------------------
   Inicialização
   --------------------------------------------------------------------- */

let game;

function initMenu() {
  const continueBtn = document.getElementById('btn-continue');
  continueBtn.disabled = !hasSavedGame();

  // Ligada por padrão só na primeira vez que o jogo é aberto neste
  // navegador; depois disso o jogador decide manualmente a cada visita.
  const tutorialCheckbox = document.getElementById('chk-tutorial');
  tutorialCheckbox.checked = localStorage.getItem(TUTORIAL_SEEN_KEY) === null;

  document.getElementById('btn-new-game').addEventListener('click', () => {
    if (tutorialCheckbox.checked) {
      showScreen(Screens.TUTORIAL);
      game.runTutorial(() => {
        game.startNewGame();
        showScreen(Screens.GAMEPLAY);
      });
    } else {
      game.startNewGame();
      showScreen(Screens.GAMEPLAY);
    }
  });

  continueBtn.addEventListener('click', () => {
    game.continueGame();
    showScreen(Screens.GAMEPLAY);
  });
}

/* Popups da tela inicial: Conquistas (com mistério nas ainda não
   desbloqueadas) e Sobre/Créditos. Reaproveitam a classe .modal-overlay
   já usada pelo modal de minigame — mesma animação de abrir/fechar. */
function renderAchievementsList() {
  const unlocked = loadAchievements();
  document.getElementById('achievements-progress').textContent =
    `${unlocked.length}/${ACHIEVEMENTS.length} desbloqueadas`;

  document.getElementById('achievements-list').innerHTML = ACHIEVEMENTS.map((a) => {
    const isUnlocked = unlocked.includes(a.id);
    const icon = isUnlocked ? a.icon : '🔒';
    const name = isUnlocked ? a.name : '???';
    const desc = isUnlocked ? a.description : a.hint;
    return `
      <div class="achievement-entry ${isUnlocked ? 'unlocked' : 'locked'}">
        <span class="achievement-entry-icon">${icon}</span>
        <div class="achievement-entry-text">
          <span class="achievement-entry-name">${name}</span>
          <span class="achievement-entry-desc">${desc}</span>
        </div>
        <span class="achievement-entry-rarity">${a.rarity}</span>
      </div>`;
  }).join('');
}

function renderCreditsTable() {
  document.getElementById('credits-table-body').innerHTML = MUSIC_CREDITS
    .map((c) => `<tr><td>${c.title}</td><td>${c.author}</td></tr>`)
    .join('');
}

function initMenuModals() {
  document.getElementById('btn-achievements').addEventListener('click', () => {
    SoundFX.click();
    renderAchievementsList();
    openModal('achievements-modal');
  });
  document.getElementById('btn-achievements-close').addEventListener('click', () => {
    SoundFX.click();
    closeModal('achievements-modal');
  });

  document.getElementById('btn-about').addEventListener('click', () => {
    SoundFX.click();
    openModal('about-modal');
  });
  document.getElementById('btn-about-close').addEventListener('click', () => {
    SoundFX.click();
    closeModal('about-modal');
  });

  renderCreditsTable();
}

function initTutorial() {
  document.getElementById('btn-tutorial-next').addEventListener('click', () => {
    game.advanceTutorial();
  });

  document.getElementById('btn-tutorial-skip').addEventListener('click', () => {
    game.skipTutorial();
  });

  // Clique no próprio painel: mesmo atalho do painel de evento no gameplay.
  document.getElementById('tutorial-panel').addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    game.advanceTutorial();
  });
}

function updateSoundButtonIcon() {
  document.getElementById('btn-sound-toggle').textContent = SoundFX.enabled ? '🔊' : '🔇';
}

function initGameplay() {
  document.getElementById('btn-back-to-menu').addEventListener('click', () => {
    game.stopPlanetAnimation();
    SoundFX.stopAmbient();
    document.getElementById('btn-continue').disabled = !hasSavedGame();
    showScreen(Screens.MENU);
  });

  document.getElementById('btn-sound-toggle').addEventListener('click', () => {
    SoundFX.toggle();
    updateSoundButtonIcon();
    SoundFX.click();
  });
  updateSoundButtonIcon();

  document.getElementById('btn-restart').addEventListener('click', () => {
    const confirmed = window.confirm('Recomeçar do Dia 1? O progresso desta partida será perdido.');
    if (!confirmed) return;
    game.startNewGame();
  });

  document.getElementById('btn-option-a').addEventListener('click', () => {
    game.makeDecision('optionA');
  });

  document.getElementById('btn-option-b').addEventListener('click', () => {
    game.makeDecision('optionB');
  });

  document.getElementById('btn-minigame-skip').addEventListener('click', () => {
    game.skipMinigame();
  });

  document.getElementById('btn-minigame-continue').addEventListener('click', () => {
    game.finishMinigame(game.pendingMinigameBonus || {});
  });

  // Clique no painel do evento: pula a máquina de escrever ou avança o dia
  // na hora, em vez de forçar o jogador a esperar o ritmo padrão.
  document.getElementById('event-panel').addEventListener('click', (e) => {
    if (e.target.closest('button')) return; // não interfere com as respostas
    game.handleEventPanelClick();
  });

  // Leve parallax do planeta de fundo seguindo o mouse, só por profundidade.
  document.getElementById('screen-gameplay').addEventListener('mousemove', (e) => {
    const backdrop = document.querySelector('.planet-backdrop');
    if (!backdrop) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 16;
    backdrop.style.transform = `translate(${x}px, ${y}px)`;
  });
}

function initEnding() {
  document.getElementById('btn-play-again').addEventListener('click', () => {
    game.startNewGame();
    showScreen(Screens.GAMEPLAY);
  });

  document.getElementById('btn-ending-menu').addEventListener('click', () => {
    SoundFX.stopEndingMusic();
    document.getElementById('btn-continue').disabled = !hasSavedGame();
    showScreen(Screens.MENU);
  });
}

// Acessibilidade: Esc fecha o popup/modal ativo no momento (Conquistas,
// Sobre, ou o minigame — que trata Esc como "Pular"/"Continuar", equivalente
// em teclado ao botão correspondente).
function initEscapeToClose() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('achievements-modal').classList.contains('active')) {
      closeModal('achievements-modal');
    } else if (document.getElementById('about-modal').classList.contains('active')) {
      closeModal('about-modal');
    } else if (document.getElementById('minigame-modal').classList.contains('active')) {
      const resultVisible = document.getElementById('minigame-result').style.display !== 'none';
      document.getElementById(resultVisible ? 'btn-minigame-continue' : 'btn-minigame-skip').click();
    }
  });
}

function init() {
  game = new TerraformGame();
  initMenu();
  initMenuModals();
  initTutorial();
  initGameplay();
  initEnding();
  initEscapeToClose();
  showScreen(Screens.LOADING);
  setTimeout(() => {
    showScreen(Screens.MENU);
  }, 2500);
}

document.addEventListener('DOMContentLoaded', init);
