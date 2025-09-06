import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("auth_token");
  console.log('Auth interceptor - URL:', req.url);
  console.log('Auth interceptor - Token exists:', !!token);
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    console.log('Auth interceptor - Added token to request');
  }
  return next(req);
};


