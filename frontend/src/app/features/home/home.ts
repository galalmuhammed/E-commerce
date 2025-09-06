import { Component, inject } from "@angular/core";
import { ProductList } from "../products/product-list/product-list";

@Component({
  selector: "app-home",
  imports: [ProductList],
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class Home {}
