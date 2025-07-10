import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.snackBar.open("Login successful!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.message || "Login failed";
          this.snackBar.open(message, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError("required")) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError("email")) {
      return "Please enter a valid email address";
    }
    if (control?.hasError("minlength")) {
      return "Password must be at least 6 characters long";
    }
    return "";
  }
}
