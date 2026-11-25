import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFileRouter, requestContextInterceptor } from '@analogjs/router';
import { withInMemoryScrolling } from '@angular/router';
import { heroMiniIcons, heroOutlineIcons, heroSolidIcons, provideIcons } from '@medra.dev/ui';
import { provideMedraMenuRouterLinks } from '@medra.dev/ui/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Scrolls the window to the top of the new page on every navigation (default Router
    // behavior leaves the scroll position untouched, which reads as "nothing happened" when
    // navigating from partway down a long page) — the docs sidebar has its own independent
    // scroll region (see docs.page.ts) so it isn't affected by this and keeps its own position.
    provideFileRouter(withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    // Router bridge for `MenuItem.routerLink` in the Menu-family demos; must come after the router provider above.
    provideMedraMenuRouterLinks(),
    provideHttpClient(
      withInterceptors([requestContextInterceptor])
    ),
    provideClientHydration(withEventReplay()),
    // Icons used by the documented components' own demos: Checkbox's check/indeterminate
    // marks, Message/Toast/ConfirmDialog/ConfirmPopup's severity icons, SplitButton/SpeedDial's
    // own chevron/plus plus their demo items, Breadcrumb/Paginator/Menu-family's own chevrons
    // and demo item icons (mini), Dock's demo items (outline — IconComponent defaults to the
    // 'outline' variant when a consumer doesn't set one, and Dock never does), IconField's demo
    // icon, FileUpload's dropzone icon, Rating's star (both variants), ToggleButton's on/off
    // icons, InputNumber's horizontal stepper buttons, MultiSelect/Listbox's filter search icon,
    // Editor's own fixed toolbar (bold/italic/underline/list/undo/redo — unconditional, part of
    // EditorComponent's own template, not opt-in per demo), Avatar's own icon-fallback state,
    // Chip/OverlayBadge/MeterGroup's demo icons, Image/ImagePreview's own zoom controls
    // (unconditional whenever `preview` is set, including inside Galleria), Carousel's own
    // autoplay toggle, and OrderList/PickList's own move-all buttons. Onda 7 template/slot
    // customization demos (solid `star` — MegaMenu/Accordion/ConfirmDialog headless; solid
    // `arrowLeftCircle`/`arrowRightCircle` — Carousel `#previousicon`/`#nexticon`; solid
    // `checkCircle` — Toast headless). Onda 5 demo additions (mini `user` — Chip's broken-image
    // fallback icon; mini `envelope`/`bell` — Menu's link/badge demo item icons). Onda 6 batch 9
    // demo addition (outline `creditCard` — Fieldset's rich-legend slot demo).
    provideIcons({
      outline: {
        xMark: heroOutlineIcons.xMark,
        chevronDown: heroOutlineIcons.chevronDown,
        envelope: heroOutlineIcons.envelope,
        calendar: heroOutlineIcons.calendar,
        photo: heroOutlineIcons.photo,
        cog6Tooth: heroOutlineIcons.cog6Tooth,
        eye: heroOutlineIcons.eye,
        cloudArrowUp: heroOutlineIcons.cloudArrowUp,
        star: heroOutlineIcons.star,
        check: heroOutlineIcons.check,
        bell: heroOutlineIcons.bell,
        creditCard: heroOutlineIcons.creditCard,
        arrowsPointingIn: heroOutlineIcons.arrowsPointingIn,
        arrowsPointingOut: heroOutlineIcons.arrowsPointingOut,
      },
      solid: {
        check: heroSolidIcons.check,
        minus: heroSolidIcons.minus,
        informationCircle: heroSolidIcons.informationCircle,
        checkCircle: heroSolidIcons.checkCircle,
        exclamationTriangle: heroSolidIcons.exclamationTriangle,
        xCircle: heroSolidIcons.xCircle,
        star: heroSolidIcons.star,
        funnel: heroSolidIcons.funnel,
        user: heroSolidIcons.user,
        magnifyingGlassPlus: heroSolidIcons.magnifyingGlassPlus,
        arrowLeftCircle: heroSolidIcons.arrowLeftCircle,
        arrowRightCircle: heroSolidIcons.arrowRightCircle,
      },
      mini: {
        check: heroMiniIcons.check,
        xMark: heroMiniIcons.xMark,
        chevronDown: heroMiniIcons.chevronDown,
        chevronUp: heroMiniIcons.chevronUp,
        chevronLeft: heroMiniIcons.chevronLeft,
        chevronRight: heroMiniIcons.chevronRight,
        chevronDoubleUp: heroMiniIcons.chevronDoubleUp,
        chevronDoubleDown: heroMiniIcons.chevronDoubleDown,
        chevronDoubleLeft: heroMiniIcons.chevronDoubleLeft,
        chevronDoubleRight: heroMiniIcons.chevronDoubleRight,
        home: heroMiniIcons.home,
        documentDuplicate: heroMiniIcons.documentDuplicate,
        documentPlus: heroMiniIcons.documentPlus,
        documentText: heroMiniIcons.documentText,
        pencil: heroMiniIcons.pencil,
        arrowDownTray: heroMiniIcons.arrowDownTray,
        arrowUpTray: heroMiniIcons.arrowUpTray,
        trash: heroMiniIcons.trash,
        plus: heroMiniIcons.plus,
        minus: heroMiniIcons.minus,
        informationCircle: heroMiniIcons.informationCircle,
        checkCircle: heroMiniIcons.checkCircle,
        exclamationTriangle: heroMiniIcons.exclamationTriangle,
        xCircle: heroMiniIcons.xCircle,
        magnifyingGlass: heroMiniIcons.magnifyingGlass,
        magnifyingGlassPlus: heroMiniIcons.magnifyingGlassPlus,
        magnifyingGlassMinus: heroMiniIcons.magnifyingGlassMinus,
        eye: heroMiniIcons.eye,
        eyeSlash: heroMiniIcons.eyeSlash,
        bold: heroMiniIcons.bold,
        italic: heroMiniIcons.italic,
        underline: heroMiniIcons.underline,
        link: heroMiniIcons.link,
        listBullet: heroMiniIcons.listBullet,
        numberedList: heroMiniIcons.numberedList,
        arrowUturnLeft: heroMiniIcons.arrowUturnLeft,
        arrowUturnRight: heroMiniIcons.arrowUturnRight,
        tag: heroMiniIcons.tag,
        photo: heroMiniIcons.photo,
        videoCamera: heroMiniIcons.videoCamera,
        folder: heroMiniIcons.folder,
        play: heroMiniIcons.play,
        pause: heroMiniIcons.pause,
        user: heroMiniIcons.user,
        envelope: heroMiniIcons.envelope,
        bell: heroMiniIcons.bell,
        arrowsUpDown: heroMiniIcons.arrowsUpDown,
        bars3: heroMiniIcons.bars3,
        pencilSquare: heroMiniIcons.pencilSquare,
        funnel: heroMiniIcons.funnel,
        arrowPath: heroMiniIcons.arrowPath,
      },
    }),
  ],
};
