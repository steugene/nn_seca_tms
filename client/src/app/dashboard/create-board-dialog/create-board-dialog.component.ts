import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BoardService } from "../../core/services/board.service";

@Component({
  selector: "app-create-board-dialog",
  templateUrl: "./create-board-dialog.component.html",
  styleUrls: ["./create-board-dialog.component.scss"],
})
export class CreateBoardDialogComponent {
  createBoardForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateBoardDialogComponent>,
    private boardService: BoardService,
    private snackBar: MatSnackBar,
  ) {
    this.createBoardForm = this.fb.group({
      title: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: ["", [Validators.maxLength(200)]],
    });
  }

  onSubmit(): void {
    if (this.createBoardForm.valid) {
      this.loading = true;
      this.boardService.createBoard(this.createBoardForm.value).subscribe({
        next: (board) => {
          this.snackBar.open("Board created successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.dialogRef.close(board);
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.message || "Failed to create board";
          this.snackBar.open(message, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
