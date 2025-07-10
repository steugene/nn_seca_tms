import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject, takeUntil, Observable } from "rxjs";
import { AuthService } from "./core/services/auth.service";
import { WebSocketService } from "./core/services/websocket.service";
import { ThemeService } from "./core/services/theme.service";
import { User } from "@nn-seca-tms/shared";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "NN SECA TMS";
  currentUser: User | null = null;
  isAuthenticated = false;
  isDarkMode$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private themeService: ThemeService,
  ) {
    this.isDarkMode$ = this.themeService.isDarkTheme$;
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.isAuthenticated = !!user;

        if (user) {
          this.webSocketService.connect();
        } else {
          this.webSocketService.disconnect();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.disconnect();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
