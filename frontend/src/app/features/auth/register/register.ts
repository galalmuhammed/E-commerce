import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-register",
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.html",
  styleUrl: "./register.css",
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  form = this.fb.group({
    username: ["", [Validators.required, Validators.minLength(3)]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
    confirmPassword: ["", [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  loading = false;
  errorMsg = "";
  successMsg = "";

  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  submit(): void {
    this.errorMsg = "";
    this.successMsg = "";
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const { username, email, password } = this.form.value as { username: string; email: string; password: string };
    this.http.post("http://localhost:3000/api/user", { username, email, password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          this.successMsg = "Account created successfully! You can now login.";
          setTimeout(() => this.router.navigateByUrl("/login"), 2000);
        } else {
          this.errorMsg = res?.message || "Registration failed";
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || "Registration failed";
      }
    });
  }
}
