import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem("auth_token");
  if (token) return true;
  const router = inject(Router);
  router.navigateByUrl(`/login?returnUrl=${encodeURIComponent(state.url)}`);
  return false;
};


