import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDividerModule } from "@angular/material/divider";
import { MatChipsModule } from "@angular/material/chips";

import { BoardComponent } from "./board.component";
import { CreateTicketDialogComponent } from "./create-ticket-dialog/create-ticket-dialog.component";
import { EditTicketDialogComponent } from "./edit-ticket-dialog/edit-ticket-dialog.component";

import { AuthGuard } from "../core/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: BoardComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [
    BoardComponent,
    CreateTicketDialogComponent,
    EditTicketDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,

    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
  ],
  providers: [],
})
export class BoardModule {}
