# Roadmap de execução — MedraUi

Baseado em todas as decisões de `decisoes-produto.md`. Organizado por trilhas paralelas
(não puramente sequencial), já que várias frentes podem andar ao mesmo tempo com pessoas
diferentes. Datas são relativas ao início do trabalho, não fixas em calendário.

## Trilha 1 — Fundação técnica (bloqueante para tudo o resto)
1. Setup do monorepo Angular (workspace + `ng-packagr` com secondary entry points).
2. Setup Tailwind v4 (`tailwind-theme-medraui.css` já rascunhado — falta cor de marca
   oficial se a Teal escolhida mudar após identidade visual completa).
3. Setup Jest + Playwright Component Testing.
4. Setup CVA + helper `mergeClasses()` (tailwind-merge).
5. Pipeline de build: Tailwind CLI separado do ng-packagr, conforme decidido.

## Trilha 2 — Primitivos compartilhados (bloqueia todos os componentes)
1. Wrapper Angular fino pra Heroicons.
2. Ícone próprio de grip/drag handle (lacuna identificada na Fase 1).
3. Base class/composable de customização (`@Input('class')` + tailwind-merge).
4. Serviço compartilhado de Overlay/Popover (com atenção ao bug de conflito CDK 22/Top
   Layer já mapeado).
5. Diretiva Ripple.

## Trilha 3 — Componentes piloto (depende da Trilha 2) — ✅ Completa em 2026-07-03
1. ✅ Button → Checkbox → InputText → Dialog → Message/Toast, nessa ordem.
2. ✅ Aplicado `checklist-padrao-componente.md` em cada um.
3. ✅ Teste de regressão do bug de binário `false`.
4. ✅ Ressalva pendente em todos: teste
   com leitor de tela real (NVDA/VoiceOver) não foi executado (sem AT no ambiente de
   desenvolvimento), fica pra verificação manual antes do lançamento.

## Trilhas 4 e 5 — Licenciamento e painel interno — descontinuadas em 2026-11-19
A MedraUi passou a ser pública e MIT (ver `decisoes-produto.md`): o sistema de
licenciamento, o `license-server` e o painel do cliente foram removidos do repositório.

## Trilha 6 — Documentação e site público (paralela, própria equipe/foco) — ✅ Completa em 2026-09-07
1. ✅ Site em Analog (`projects/site`), Node 22, SSR/SSG real (prerendering com conteúdo
   de verdade, não só um shell client-side) — pensado pra hospedagem estática no
   Cloudflare Pages. Reaproveita os tokens de design do próprio `@medra.dev/ui`
   (`tailwind-theme-medraui.css`) em vez de duplicar a paleta; tipografia de marca
   (Space Grotesk/IBM Plex Sans) usada pela primeira vez aqui — antes só documentada,
   nunca aplicada em nenhum app.
2. ✅ Os 5 componentes piloto documentados (`/docs/components/*`) — prosa e exemplos
   100% originais, exemplos interativos ao vivo com o `@medra.dev/ui` de verdade, e
   referência de API gerada via TypeScript Compiler API a partir do TSDoc do próprio
   código-fonte (`tools/generate-api-docs.mts`), não regex nem cópia de doc de
   terceiro. Dialog/Toast (serviços `@Injectable`, sem inputs de sinal) extraem métodos
   públicos em vez de inputs/outputs — extração despachada pelo decorator da classe.
3. ✅ Landing page (`/`) com a mensagem de biblioteca livre sob MIT, a nota de reescrita
   signal-first e os 3 pilares. Título/meta description próprios por página (`routeMeta`), gap que vinha do
   shell placeholder da Fase A.

**Achados durante a Trilha 6, corrigidos de verdade em 2026-09-08** (inicialmente só
contornados via `isPlatformBrowser` no site, depois revisitados e corrigidos na origem):
três gaps de SSR, dois no próprio `@medra.dev/ui`, um na configuração de build do site —
(1) `IconComponent` usava `[innerHTML]` num `<svg>`, e o Domino (shim de DOM do
`@angular/platform-server`) só implementa o setter de `innerHTML` em `HTMLElement`, não em
`SVGElement` (herda o `nyi` da base `Element`, que lança incondicionalmente). Corrigido
atribuindo o markup via `afterRenderEffect` (garantidamente client-only) em vez de um
binding de template — sem binding de `[innerHTML]` durante SSR, sem exceção; o ícone
continua em branco no HTML gerado no servidor até a hidratação preencher (mesmo
comportamento visual de antes), só que agora sem lançar erro. (2) `Overlay` do CDK
(`NG0203` em `ScrollStrategyOptions`) e `CdkVirtualScrollViewport`
(`TypeError: Cannot read properties of null (reading 'firstCreatePass')`) eram, na
prática, a mesma causa raiz: um bug de dual-instância de módulo — o bundle de SSR do
Vite não estava inlinando `@angular/cdk`, então o estado interno de "injector atual" do
Angular ficava dessincronizado entre a cópia de `@angular/core` usada pelo app e a usada
pelo CDK. Corrigido com uma linha em `projects/site/vite.config.ts`:
`ssr: { noExternal: ['@angular/cdk'] }` — nenhuma mudança de código foi necessária no
`@medra.dev/ui` pra esse (uma tentativa de `runInInjectionContext` em `OverlayService` foi
testada e descartada por não ser a causa real). Com os três corrigidos, os ~30 guards
`isPlatformBrowser` espalhados pelas páginas de doc (Dialog/Toast/Select/Menu-família/
Checkbox indeterminate/etc.) foram todos removidos — as demos agora renderizam conteúdo
real no HTML gerado no servidor, não um placeholder client-only.

## Marco: primeira publicação no npm
Critério de pronto (não é "100% dos 89 componentes"):
- Trilhas 1-2 completas
- 5 componentes piloto completos e testados (Trilha 3)
- Site com docs dos pilotos + landing page (Trilha 6)

## Depois do lançamento — rollout contínuo
- Seguir os componentes restantes por frequência de uso real em apps Angular, sempre
  passando pelo checklist padrão por componente (`checklist-padrao-componente.md`).
- Cada componente concluído vira conteúdo de changelog público.
- Reavaliar expansão multi-framework (Vue/React) só depois de consolidar a biblioteca em
  Angular — arquitetura já deixa tokens/CVA prontos pra isso sem retrabalho.
