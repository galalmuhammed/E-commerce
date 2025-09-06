import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ProductModel } from "../../../shared/interfaces/product.model";

export interface CartItem {
  product: ProductModel;
  quantity: number;
}

@Injectable({ providedIn: "root" })
export class CartService {
  private readonly cookieName = "app_cart";
  private readonly cookieMaxDays = 30;
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadFromCookie());
  readonly items$ = this.itemsSubject.asObservable();

  getItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  getCount(): number {
    return this.getItems().reduce((sum, i) => sum + i.quantity, 0);
  }

  add(product: ProductModel, quantity: number = 1): void {
    const items = this.getItems();
    const idx = items.findIndex((i) => i.product._id === product._id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
    } else {
      items.push({ product, quantity });
    }
    this.save(items);
  }

  remove(productId: string): void {
    const items = this.getItems().filter((i) => i.product._id !== productId);
    this.save(items);
  }

  setQuantity(productId: string, quantity: number): void {
    const items = this.getItems().map((i) =>
      i.product._id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
    );
    this.save(items);
  }

  clear(): void {
    this.save([]);
  }

  updateProductInfo(productId: string, productPatch: Partial<ProductModel>): void {
    const items = this.getItems().map((i) =>
      i.product._id === productId ? { ...i, product: { ...i.product, ...productPatch } } : i
    );
    this.save(items);
  }

  private save(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.saveToCookie(items);
  }

  private loadFromCookie(): CartItem[] {
    try {
      const cookie = this.readCookie(this.cookieName);
      if (!cookie) return [];
      const parsed = JSON.parse(cookie);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  private saveToCookie(items: CartItem[]): void {
    try {
      const json = JSON.stringify(items);
      const expires = new Date();
      expires.setDate(expires.getDate() + this.cookieMaxDays);
      document.cookie = `${this.cookieName}=${encodeURIComponent(json)};expires=${expires.toUTCString()};path=/`;
    } catch {
      // ignore
    }
  }

  private readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }
}


