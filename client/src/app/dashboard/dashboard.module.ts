import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { DashboardComponent } from "./dashboard.component";
import { CreateBoardDialogComponent } from "./create-board-dialog/create-board-dialog.component";

const routes: Routes = [{ path: "", component: DashboardComponent }];

@NgModule({
  declarations: [DashboardComponent, CreateBoardDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class DashboardModule {}
