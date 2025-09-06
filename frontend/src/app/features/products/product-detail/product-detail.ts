import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ProductService } from "../../../core/services/product_service/product-service";
import { ApiResponse, ProductModel } from "../../../shared/interfaces/product.model";

@Component({
  selector: "app-product-detail",
  imports: [CommonModule, RouterLink],
  templateUrl: "./product-detail.html",
  styleUrl: "./product-detail.css",
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product?: ProductModel;
  categories: { _id: string; name: string }[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;
    this.productService.getById(id).subscribe(
      (res: ApiResponse<ProductModel>) => {
        if (res.success && res.data) {
          // Backend returns absolute image URL
          this.product = res.data;
        }
      },
      (err) => {
        console.error("Error loading product", err);
      }
    );
    this.productService.getCategories().subscribe(
      (res) => {
        if (res.success && res.data) this.categories = res.data.filter((c: any) => !c.isDeleted);
      },
      (err) => console.error("Error fetching categories", err)
    );
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.warn("Detail image failed to load:", this.product?.image);
    img.src = "assets/images/logo.png";
  }
}
