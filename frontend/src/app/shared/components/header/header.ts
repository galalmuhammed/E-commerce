import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CartService } from "../../../core/services/cart_service/cart-service";
import { AuthService } from "../../../core/services/auth_service/auth-service";
import { AdminService } from "../../../core/services/admin_service/admin-service";

@Component({
  selector: "app-header",
  imports: [CommonModule, RouterLink],
  templateUrl: "./header.html",
  styleUrl: "./header.css",
})
export class Header {
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private adminService = inject(AdminService);
  
  get cartCount(): number {
    return this.cartService.getCount();
  }
  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
  get isAdmin(): boolean {
    const role = this.adminService.getCurrentUserRole();
    return role === 'admin' || role === 'owner';
  }
  signout(): void {
    this.auth.logout();
  }
}
