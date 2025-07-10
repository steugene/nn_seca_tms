import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Board, User } from "@nn-seca-tms/shared";
import { AuthService } from "../core/services/auth.service";
import { BoardService } from "../core/services/board.service";
import { CreateBoardDialogComponent } from "./create-board-dialog/create-board-dialog.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  boards: Board[] = [];
  user: User | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private boardService: BoardService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.loadBoards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoards(): void {
    this.loading = true;
    this.boardService
      .getBoards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boards) => {
          this.boards = boards;
          this.loading = false;
        },
        error: (_error) => {
          this.loading = false;
          this.snackBar.open("Failed to load boards", "Close", {
            duration: 3000,
          });
        },
      });
  }

  openCreateBoardDialog(): void {
    const dialogRef = this.dialog.open(CreateBoardDialogComponent, {
      width: "500px",
      disableClose: false,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadBoards();
        }
      });
  }

  openBoard(boardId: string): void {
    this.router.navigate(["/board", boardId]);
  }

  deleteBoard(boardId: string, event: Event): void {
    event.stopPropagation();

    const board = this.boards.find(b => b.id === boardId);
    if (!board) return;

    if (confirm(`Are you sure you want to delete "${board.title}"?`)) {
      this.boardService
        .deleteBoard(boardId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open("Board deleted successfully", "Close", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
            this.loadBoards();
          },
          error: (_error) => {
            this.snackBar.open("Failed to delete board", "Close", {
              duration: 3000,
            });
          },
        });
    }
  }
}
