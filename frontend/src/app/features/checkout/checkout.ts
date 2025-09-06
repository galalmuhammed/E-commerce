import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { CartService } from "../../core/services/cart_service/cart-service";
import { CartApiService } from "../../core/services/cart_service/cart-api.service";
import { forkJoin, of } from "rxjs";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./checkout.html",
  styleUrl: "./checkout.css",
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cart = inject(CartService);
  private cartApi = inject(CartApiService);

  form = this.fb.group({
    address: ["", [Validators.required, Validators.minLength(6)]],
    phone: ["", [Validators.required, Validators.pattern(/^\+?[0-9\-\s]{7,}$/)]],
    notes: [""]
  });

  loading = false;
  errorMsg = "";

  submit(): void {
    this.errorMsg = "";
    if (this.form.invalid || this.loading) return;
    const items = this.cart.getItems();
    if (!items.length) {
      this.errorMsg = "Your cart is empty";
      return;
    }
    this.loading = true;
    const syncCalls = items.map((it) => this.cartApi.add(it.product._id, it.quantity));
    const sync$ = syncCalls.length ? forkJoin(syncCalls) : of(undefined);
    (sync$ as any).subscribe({
      next: () => {
        // Verify backend cart is present
        this.cartApi.get().subscribe({
          next: () => {
            this.http.post("http://localhost:3000/api/order", this.form.value).subscribe({
              next: (res: any) => {
                this.loading = false;
                if (res?.success) {
                  this.cart.clear();
                  this.router.navigateByUrl("/home");
                } else {
                  this.errorMsg = res?.message || "Order failed";
                }
              },
              error: (err) => {
                this.loading = false;
                this.errorMsg = err?.error?.message || "Order failed";
              }
            });
          },
          error: () => {
            this.loading = false;
            this.errorMsg = "Your cart is empty";
          }
        });
      },
      error: () => {
        // Even if sync fails, attempt to place order; backend may already have items
        this.http.post("http://localhost:3000/api/order", this.form.value).subscribe({
          next: (res: any) => {
            this.loading = false;
            if (res?.success) {
              this.cart.clear();
              this.router.navigateByUrl("/home");
            } else {
              this.errorMsg = res?.message || "Order failed";
            }
          },
          error: (err) => {
            this.loading = false;
            this.errorMsg = err?.error?.message || "Order failed";
          }
        });
      }
    });
  }
}


