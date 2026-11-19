# Checklist padrão por componente — MedraUi

> Aplicar a cada componente. Só considerar concluído depois de todo item aplicável
> abaixo estar concluído.
> Consolida as decisões das Fases 1 e 2.

## Sempre aplicável

- [ ] **Lógica reescrita do zero** — nenhum trecho copiado de terceiros; abordagem signal-first.
- [ ] **Angular moderno**: standalone (sem NgModule), APIs de signals
  (`input()`/`output()`/`model()`/`viewChild()`), zoneless-ready (sem depender de zone.js
  pra disparar change detection).
- [ ] **Estilo via tokens da MedraUi** (`tailwind-theme-medraui.css`), sem estilos
  hardcoded de terceiros.
- [ ] **Variantes via CVA** aplicáveis ao componente (severidade × variante de estilo ×
  tamanho, conforme fizer sentido pro tipo de componente).
- [ ] **Escape hatch de customização**: `@Input('class')` implementado via helper
  compartilhado `mergeClasses()` (tailwind-merge), não `[ngClass]`/`[class.x]` nativo.
- [ ] **Dark mode testado**: comportamento correto sob classe `dark` no root, sem flicker
  de transição ao trocar de página/rota (ver bug #19273 do original).
- [ ] **Ícones via wrapper Heroicons** (ou ícone próprio, só nos casos já identificados de
  lacuna — ex. grip handle); nunca referência a Font Awesome no design.
- [ ] **Acessibilidade (WCAG 2.1 AA como alvo)**: atributos ARIA corretos pro papel do
  componente, navegável 100% por teclado (incluindo ordem de tab lógica), anel de foco
  visível usando o token de foco definido no tema, contraste de cor testado nas variantes
  de severidade/estado (inclusive dark mode), testado com pelo menos um leitor de tela
  (NVDA ou VoiceOver) para os componentes interativos.
- [ ] **Responsividade**: componente testado nos breakpoints padrão do Tailwind (mobile,
  `sm`, `md`, `lg`, `xl`) — layout não quebra em nenhum deles. Alvo de toque em elementos
  interativos com tamanho adequado em mobile (mínimo ~44x44px). Componentes de overlay
  (dialog, drawer, popover) devem ter comportamento mobile explicitamente definido na
  especificação (ex.: tela cheia em mobile vs. centralizado em desktop), não só herdar o
  comportamento desktop.
- [ ] **Teste unitário (Jest)**: cobre lógica/estado/eventos do componente.
- [ ] **Teste visual (Playwright Component Testing)**: screenshot cobrindo os principais
  estados (default, hover, foco, desabilitado, dark mode) **em pelo menos dois viewports**
  (mobile e desktop), não só desktop.
- [ ] **Bugs conhecidos**: se o componente tiver bug conhecido registrado, escrever um
  teste de regressão específico pra cada um antes de considerar concluído.
- [ ] **Conteúdo fornecido pelo consumidor é sanitizado**: se o componente aceita
  HTML/templates arbitrários do consumidor (ex.: conteúdo de tooltip, mensagem, célula
  de tabela), garantir que não haja vetor de XSS — nunca usar bypass de sanitização do
  Angular (`bypassSecurityTrustHtml`) sem necessidade justificada e documentada.

## Só se o componente tiver texto próprio de UI (label de botão interno, aria-label, mensagem padrão, etc.)

- [ ] **Sem serviço de tradução próprio da MedraUi** (decidido em 2026-07-03, Fase 2 —
  "Suporte a i18n"): cada texto interno vira um `@Input()` com default em inglês; o app
  consumidor resolve a tradução como quiser (hardcode, ngx-translate, Angular i18n nativo).
- [ ] Para API imperativa via serviço injetável (padrão do Toast): o texto é um campo
  opcional no objeto de opções da chamada (ex.: `closeLabel`), com default em inglês se
  omitido — não criar um provider de "defaults globais" por componente.

## Só se for componente de formulário (aceita valor/input do usuário)

- [ ] Implementa `ControlValueAccessor` (Reactive Forms clássico, conforme decidido na
  Fase 2).
- [ ] Trata corretamente valores falsy (`false`, `0`, string vazia) vs. `null`/`undefined`
  — o Checkbox com valor binário `false` é o caso de referência.
- [ ] Estados de campo cobertos: default, hover, foco, desabilitado, **inválido** (usando
  os tokens de campo de formulário do tema).
- [ ] Tamanhos sm/default/lg cobertos via CVA.

## Só se for componente de overlay (dialog, popover, drawer, tooltip, menu flutuante)

- [ ] Usa o serviço compartilhado de Overlay/Popover (não implementação própria isolada).
- [ ] Focus trap implementado corretamente (foco não escapa do overlay enquanto aberto).
- [ ] Estratégia de camadas/z-index testada em conjunto com Angular CDK — ver bug de
  conflito de Top Layer com CDK 22 (#19503) como caso de atenção.
- [ ] Fecha corretamente com tecla Esc e clique fora, devolve foco ao elemento que abriu.

## Só se for componente de exibição de dados/lista (table, list, tree, etc.)

- [ ] Testado com dataset vazio, com um item, e com dataset grande (performance).
- [ ] Se suporta reorder (drag), usa o ícone de grip próprio (não Heroicons, que não
  cobre esse caso).

## Ao concluir

- [ ] Registrar a conclusão no changelog (changeset).
