import { LocationStrategy } from '@angular/common';
import { DestroyRef, EnvironmentProviders, inject, makeEnvironmentProviders, signal } from '@angular/core';
import { NavigationEnd, Router, UrlTree } from '@angular/router';
import { MED_MENU_LINK_STRATEGY, MenuItemRouterLink, MenuLinkStrategy } from '@medra/ui';

/**
 * Registers the Router-backed `MenuLinkStrategy` that menu items with
 * `routerLink` need. Call once, in the app's providers, after
 * `provideRouter(...)`.
 *
 * Every link is resolved from the app root (`createUrlTree` without
 * `relativeTo`), because a menu appears in places whose current route
 * differs. The `href` is the Router's own serialization plus the app's base
 * href, so it is always an app path — a hostile `routerLink` such as
 * `javascript:alert(1)` or `//evil.com` becomes a harmless path segment, never
 * a scheme or another origin. `navigate()` uses the same `UrlTree` as `href`,
 * never `navigateByUrl` with the raw string.
 */
export function provideMedraMenuRouterLinks(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: MED_MENU_LINK_STRATEGY, useFactory: createMenuLinkStrategy }]);
}

function createMenuLinkStrategy(): MenuLinkStrategy {
  const router = inject(Router);
  const locationStrategy = inject(LocationStrategy);

  // Bumped on every finished navigation so `isActive()` re-evaluates inside
  // OnPush templates and `computed`s without a subscription per menu item.
  const navigations = signal(0);
  const subscription = router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      navigations.update((count) => count + 1);
    }
  });
  inject(DestroyRef).onDestroy(() => subscription.unsubscribe());

  const treeOf = (link: MenuItemRouterLink): UrlTree => router.createUrlTree(typeof link === 'string' ? [link] : [...link]);

  return {
    href: (link) => locationStrategy.prepareExternalUrl(router.serializeUrl(treeOf(link))),
    navigate: (link) => {
      void router.navigateByUrl(treeOf(link));
    },
    isActive: (link, exact) => {
      navigations();
      return router.isActive(treeOf(link), {
        paths: exact ? 'exact' : 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    },
  };
}
