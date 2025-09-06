import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProductModel, ApiResponse } from "../../../shared/interfaces/product.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private api: string = "http://localhost:3000/api/products";
  private categoriesApi: string = "http://localhost:3000/api/categories";
  constructor(private http: HttpClient) {}


  get(): Observable<ApiResponse<ProductModel[]>> {
    return this.http.get<ApiResponse<ProductModel[]>>(this.api);
  }

  getCategories(): Observable<ApiResponse<{ _id: string; name: string }[]>> {
    return this.http.get<ApiResponse<{ _id: string; name: string }[]>>(this.categoriesApi);
  }

  getById(id: string): Observable<ApiResponse<ProductModel>> {
    return this.http.get<ApiResponse<ProductModel>>(this.api + "/" + id);
  }

  post(customer: ProductModel): Observable<ApiResponse<ProductModel>> {
    return this.http.post<ApiResponse<ProductModel>>(this.api, customer);
  }

  put(id: string, customer: ProductModel): Observable<ApiResponse<ProductModel>> {
    return this.http.put<ApiResponse<ProductModel>>(this.api + "/" + id, customer);
  }

  delete(id: string): Observable<ApiResponse<ProductModel>> {
    return this.http.delete<ApiResponse<ProductModel>>(this.api + "/" + id);
  }
}
