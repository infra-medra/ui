# Catálogo de tokens de design — MedraUi

> Este documento descreve **categorias e cobertura funcional** de tokens, em linguagem própria,
> para servir de checklist de paridade ao desenhar o design system da MedraUi em Tailwind.
> Não é uma cópia do código-fonte original — nomes/estrutura exata serão redesenhados do zero.

## Camada 1 — Primitivos (cores, radius)
- Paleta de cores: ~20 matizes × 11 tons (50-950). **Confirmado: são os valores padrão do Tailwind CSS**
  (ex.: emerald-500 = #10b981 é idêntico ao Tailwind). Conclusão: **não precisa reconstruir essa camada**,
  basta usar a paleta nativa do Tailwind (ou estender, se quisermos cores de marca próprias).
- Escala de `border-radius`: none/xs/sm/md/lg/xl — Tailwind já cobre com sua própria escala (`rounded-none/sm/md/lg/xl`).

## Camada 2 — Semântica (o que realmente precisa ser desenhado)
Tokens abstratos que dão significado à paleta crua, com suporte a **light/dark mode** cada um:

- **Cor de marca ("primary")**: uma cor-base + variações computadas (hover, active), com contraste de texto.
- **Escala de superfície ("surface")**: neutra (cinza), usada como base de fundo/borda/texto em todo o sistema —
  pode mudar de matiz entre light (slate) e dark (zinc).
- **Foco global**: espessura, estilo, cor e offset do anel de foco (acessibilidade de teclado).
- **Opacidade de desabilitado**: valor único aplicado a qualquer elemento `disabled`.
- **Campos de formulário (base compartilhada)**: padding (com variantes sm/lg), border-radius, borda em 4 estados
  (default/hover/focus/inválido), fundo em 4 estados (default/hover-preenchido/focus-preenchido/desabilitado),
  cor de texto em 3 estados (default/desabilitado/placeholder + placeholder inválido), cor de float-label em
  4 estados (default/focus/ativo/inválido), cor de ícone.
- **Listas/menus (base compartilhada)**: padding de container, gap entre itens, padding de opção/grupo/cabeçalho,
  estado de opção em 4 variações (hover, selecionado, selecionado+hover, foco).
- **Navegação (base compartilhada)**: padding de item, estados hover/ativo, ícone em 3 estados.
- **Overlays (select/popover/modal/navigation)**: border-radius, padding e shadow próprios por tipo de camada flutuante.
- **Highlight/seleção**: cor de fundo e texto para item selecionado, com variação em foco.
- **Máscara de fundo (overlay backdrop)**: cor e duração de transição — muda entre light/dark.

## Camada 3 — Por componente (exemplo: Button)
Estrutura de tokens por componente, dividida em:
- **`root` (estrutural, independente de cor)**: border-radius, variante "pill", gap interno, padding (com
  variantes sm/lg), largura quando só-ícone, peso de fonte do label, shadow de elevação ("raised"), anel de
  foco, tamanho de badge, duração de transição.
- **`colorScheme.light/dark` × severidade × estado**: cada componente interativo cobre **8 severidades**
  (primary, secondary, info, success, warn, help, danger, contrast) × **3 estados de interação**
  (default/hover/active) × cor de fundo/borda/texto/anel-de-foco — replicado para light e dark.
- Variantes de estilo visual (implícitas na API do componente, não só no token file): preenchido (default),
  outlined, text/ghost, link — cada uma precisa da própria matriz de cores.

## Resumo da matriz de cobertura da MedraUi
Para cada componente interativo: **8 severidades × ~4 variantes de estilo × 3 estados de interação × 2 tamanhos
(sm/lg, além do default) × 2 color schemes (light/dark)** — é o nível de cobertura a manter no design system Tailwind (não precisa ser essa
mesma matriz exata).

## Implicação prática para o `tailwind.config` da MedraUi
- Não precisamos portar a paleta primitiva (é o Tailwind default).
- Precisamos desenhar **nossa própria camada semântica** (nomes e hierarquia próprios) cobrindo: cor de marca
  computada em estados, escala de superfície neutra, tokens de campo de formulário, tokens de lista/navegação,
  tokens de overlay, tokens de foco/desabilitado — tudo com variante light/dark.
- Precisamos de uma convenção própria de **variantes de componente** (severidade × estilo × tamanho) — isso
  alimenta diretamente a decisão pendente de "estratégia de variantes" (CVA ou solução própria).
