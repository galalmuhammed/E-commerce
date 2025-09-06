import { Routes } from "@angular/router";
import { Home } from "./features/home/home";
import { Faq } from "./features/faq/faq";
import { Testimonials } from "./features/testimonials/testimonials";
import { Contact } from "./features/contact/contact";
import { ProductDetail } from "./features/products/product-detail/product-detail";
import { CartComponent } from "./features/cart/cart";
import { CheckoutComponent } from "./features/checkout/checkout";
import { authGuard } from "./core/guards/auth.guard";
import { LoginComponent } from "./features/auth/login/login";
import { RegisterComponent } from "./features/auth/register/register";
import { AdminDashboardComponent } from "./features/admin/dashboard/admin-dashboard";
import { adminGuard } from "./core/guards/admin.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    component: Home,
  },
  {
    path: "faq",
    component: Faq,
  },
  {
    path: "testimonials",
    component: Testimonials,
  },
  {
    path: "contact",
    component: Contact,
  },
  {
    path: "product/:id",
    component: ProductDetail,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "cart",
    component: CartComponent,
  },
  {
    path: "checkout",
    component: CheckoutComponent,
    canActivate: [authGuard],
  },
  {
    path: "admin",
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
  },
];
