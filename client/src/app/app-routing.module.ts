import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { GuestGuard } from "./core/guards/guest.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
    canActivate: [GuestGuard],
  },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },
  {
    path: "board/:id",
    loadChildren: () =>
      import("./board/board.module").then((m) => m.BoardModule),
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    redirectTo: "/dashboard",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
