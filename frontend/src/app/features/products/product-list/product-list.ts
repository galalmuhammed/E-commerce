import { Component, inject, OnInit } from "@angular/core";
import { ProductService } from "../../../core/services/product_service/product-service";
import { ApiResponse, ProductModel } from "../../../shared/interfaces/product.model";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CartService } from "../../../core/services/cart_service/cart-service";
import { CartApiService } from "../../../core/services/cart_service/cart-api.service";

@Component({
  selector: "app-product-list",
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./product-list.html",
  styleUrl: "./product-list.css",
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private cartApi = inject(CartApiService);

  products: ProductModel[] = [];
  filteredProducts: ProductModel[] = [];
  categories: { _id: string; name: string }[] = [];
  searchTerm: string = "";
  selectedCategoryId: string = "";
  ngOnInit(): void {
    this.productService.get().subscribe(
      (res: ApiResponse<ProductModel[]>) => {
        if (res.success && res.data) {
          this.products = res.data;
          this.applyFilters();
        }
      },
      (error) => {
        console.error("Error fetching products", error);
      }
    );
    this.productService.getCategories().subscribe(
      (res) => {
        if (res.success && res.data) this.categories = res.data.filter((c: any) => !c.isDeleted);
      },
      (err) => console.error("Error fetching categories", err)
    );
  }

  onImgError(event: Event, product: ProductModel): void {
    const img = event.target as HTMLImageElement;
    img.src = "assets/images/logo.png";
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const categoryId = this.selectedCategoryId;
    this.filteredProducts = this.products.filter((p) => {
      const matchesTerm = term
        ? p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
        : true;
      const matchesCategory = categoryId
        ? typeof p.category === "string"
          ? p.category === categoryId
          : (p.category as any)?._id === categoryId
        : true;
      return matchesTerm && matchesCategory;
    });
  }

  addToCart(product: ProductModel): void {
    this.cartService.add(product, 1);
  }
}
