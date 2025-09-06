import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class CartApiService {
  private api = "http://localhost:3000/api/cart";
  constructor(private http: HttpClient) {}

  add(productId: string, quantity: number): Observable<any> {
    return this.http.post(this.api, { productId, quantity });
  }

  get(): Observable<any> {
    return this.http.get(this.api);
  }
}


