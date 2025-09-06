import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth_service/auth-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  if (!token) {
    router.navigateByUrl(`/login?returnUrl=${encodeURIComponent(state.url)}`);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    
    if (role !== 'admin' && role !== 'owner') {
      router.navigateByUrl('/home');
      return false;
    }
    
    return true;
  } catch (error) {
    localStorage.removeItem('auth_token');
    router.navigateByUrl(`/login?returnUrl=${encodeURIComponent(state.url)}`);
    return false;
  }
};
