import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.html",
  styleUrls: ["./footer.css"],
  imports: [RouterLink],
})
export class Footer {
  currentYear: number = new Date().getFullYear();
}
