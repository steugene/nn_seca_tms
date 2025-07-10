import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TicketService } from "../../core/services/ticket.service";
import { User } from "@nn-seca-tms/shared";

interface DialogData {
  boardId: string;
  columnId: string;
  users: User[];
}

@Component({
  selector: "app-create-ticket-dialog",
  templateUrl: "./create-ticket-dialog.component.html",
  styleUrls: ["./create-ticket-dialog.component.scss"],
})
export class CreateTicketDialogComponent {
  createTicketForm: FormGroup;
  loading = false;
  priorities = [
    { value: "LOW", label: "Low", color: "#4caf50" },
    { value: "MEDIUM", label: "Medium", color: "#ff9800" },
    { value: "HIGH", label: "High", color: "#f44336" },
    { value: "URGENT", label: "Urgent", color: "#9c27b0" },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTicketDialogComponent>,
    private ticketService: TicketService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.createTicketForm = this.fb.group({
      title: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: ["", [Validators.maxLength(500)]],
      priority: ["MEDIUM", [Validators.required]],
      assignedTo: [""],
    });
  }

  onSubmit(): void {
    if (this.createTicketForm.valid) {
      this.loading = true;

      const ticketData = {
        ...this.createTicketForm.value,
        boardId: this.data.boardId,
        columnId: this.data.columnId,
        assignedTo: this.createTicketForm.value.assignedTo || undefined,
      };

      this.ticketService.createTicket(ticketData).subscribe({
        next: (ticket) => {
          this.snackBar.open("Ticket created successfully!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.dialogRef.close(ticket);
        },
        error: (error) => {
          this.loading = false;
          const message = error.error?.message || "Failed to create ticket";
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

  getUserName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
