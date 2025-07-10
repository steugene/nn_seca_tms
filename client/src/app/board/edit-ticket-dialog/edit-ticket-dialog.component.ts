import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TicketService } from "../../core/services/ticket.service";
import { User, Ticket, Column, TicketPriority } from "@nn-seca-tms/shared";

interface DialogData {
  ticket: Ticket;
  users: User[];
  columns: Column[];
}

@Component({
  selector: "app-edit-ticket-dialog",
  templateUrl: "./edit-ticket-dialog.component.html",
  styleUrls: ["./edit-ticket-dialog.component.scss"],
})
export class EditTicketDialogComponent {
  editTicketForm: FormGroup;
  loading = false;
  priorities = [
    { value: TicketPriority.LOW, label: "Low", color: "#4caf50" },
    { value: TicketPriority.MEDIUM, label: "Medium", color: "#ff9800" },
    { value: TicketPriority.HIGH, label: "High", color: "#f44336" },
    { value: TicketPriority.URGENT, label: "Urgent", color: "#9c27b0" },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTicketDialogComponent>,
    private ticketService: TicketService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.editTicketForm = this.fb.group({
      title: [
        data.ticket.title,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [data.ticket.description || "", [Validators.maxLength(500)]],
      priority: [data.ticket.priority, [Validators.required]],
      assignedTo: [data.ticket.assignedTo || ""],
      columnId: [data.ticket.columnId, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.editTicketForm.valid) {
      this.loading = true;

      const updateData = {
        ...this.editTicketForm.value,
        assignedTo: this.editTicketForm.value.assignedTo || undefined,
      };

      this.ticketService
        .updateTicket(this.data.ticket.id, updateData)
        .subscribe({
          next: (ticket) => {
            this.snackBar.open("Ticket updated successfully!", "Close", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
            this.dialogRef.close(ticket);
          },
          error: (error) => {
            this.loading = false;
            const message = error.error?.message || "Failed to update ticket";
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

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }
}
