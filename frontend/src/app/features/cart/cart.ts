import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { CartService, CartItem } from "../../core/services/cart_service/cart-service";
import { ProductService } from "../../core/services/product_service/product-service";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-cart",
  imports: [CommonModule],
  templateUrl: "./cart.html",
  styleUrl: "./cart.css",
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);
  items: CartItem[] = this.cartService.getItems();
  priceChangePending: boolean = false;
  pendingDiffs: { title: string; oldPrice: number; newPrice: number }[] = [];
  private pendingUpdatedItems: CartItem[] = [];

  ngOnInit(): void {
    // Keep view in sync with service
    this.cartService.items$.subscribe((items) => {
      this.items = items;
      this.validatePrices();
    });
    // Initial validate on load
    this.validatePrices();
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  }

  remove(id: string): void {
    this.cartService.remove(id);
    this.items = this.cartService.getItems();
  }

  inc(id: string): void {
    const it = this.items.find((i) => i.product._id === id);
    if (!it) return;
    this.cartService.setQuantity(id, it.quantity + 1);
    this.items = this.cartService.getItems();
  }

  dec(id: string): void {
    const it = this.items.find((i) => i.product._id === id);
    if (!it) return;
    this.cartService.setQuantity(id, it.quantity - 1);
    this.items = this.cartService.getItems();
  }

  private validatePrices(): void {
    if (!this.items.length) {
      this.priceChangePending = false;
      this.pendingDiffs = [];
      return;
    }
    const requests = this.items.map((it) => this.productService.getById(it.product._id));
    forkJoin(requests).subscribe((responses) => {
      const diffs: { title: string; oldPrice: number; newPrice: number }[] = [];
      const updated: CartItem[] = this.items.map((it, idx) => {
        const res = responses[idx];
        const latest = res?.data;
        if (!res?.success || !latest) return it;
        const oldPrice = Number(it.product.price);
        const newPrice = Number(latest.price);
        if (isFinite(newPrice) && newPrice !== oldPrice) {
          diffs.push({ title: latest.title, oldPrice, newPrice });
          return { ...it, product: { ...it.product, price: String(newPrice), image: latest.image } };
        }
        return it;
      });
      if (diffs.length) {
        // Do not prompt; show checkbox to accept changes
        this.priceChangePending = true;
        this.pendingDiffs = diffs;
        this.pendingUpdatedItems = updated;
      } else {
        this.priceChangePending = false;
        this.pendingDiffs = [];
        this.pendingUpdatedItems = [];
      }
    });
  }

  acceptPriceChanges(accepted: boolean): void {
    if (!accepted || !this.priceChangePending) return;
    // Apply pending updates
    this.pendingUpdatedItems.forEach((u) => this.cartService.updateProductInfo(u.product._id, u.product));
    this.items = this.cartService.getItems();
    this.priceChangePending = false;
    this.pendingDiffs = [];
    this.pendingUpdatedItems = [];
  }

  onCheckout(): void {
    if (this.priceChangePending || this.items.length === 0) return;
    const token = localStorage.getItem("auth_token");
    if (!token) {
      // Optionally store redirect
      this.router.navigateByUrl("/login");
      return;
    }
    this.router.navigateByUrl("/checkout");
  }
}
