import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../core/services/auth_service/auth-service";
import { CartService } from "../../../core/services/cart_service/cart-service";
import { CartApiService } from "../../../core/services/cart_service/cart-api.service";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-login",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cart = inject(CartService);
  private cartApi = inject(CartApiService);

  form = this.fb.group({
    username: ["", [Validators.required, Validators.minLength(3)]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  errorMsg = "";

  submit(): void {
    this.errorMsg = "";
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const { username, password } = this.form.value as { username: string; password: string };
    this.auth.login(username, password).subscribe({
      next: (res) => {
        if (res.success) {
          // Get the return URL from query params, default to home
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          
          // sync local cart to backend
          const items = this.cart.getItems();
          const calls = items.map((it) => this.cartApi.add(it.product._id, it.quantity));
          if (calls.length) {
            forkJoin(calls).subscribe({
              next: () => {
                this.loading = false;
                this.router.navigateByUrl(returnUrl);
              },
              error: () => {
                this.loading = false;
                this.router.navigateByUrl(returnUrl);
              },
            });
          } else {
            this.loading = false;
            this.router.navigateByUrl(returnUrl);
          }
        } else {
          this.loading = false;
          this.errorMsg = res.message || "Invalid credentials";
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Login failed";
      },
    });
  }
}
