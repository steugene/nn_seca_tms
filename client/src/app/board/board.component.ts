import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Subject, takeUntil, forkJoin } from "rxjs";
import {
  Board,
  Column,
  Ticket,
  User,
  TicketPriority,
} from "@nn-seca-tms/shared";
import { BoardService } from "../core/services/board.service";
import { TicketService } from "../core/services/ticket.service";
import { UserService } from "../core/services/user.service";
import { WebSocketService } from "../core/services/websocket.service";
import { AuthService } from "../core/services/auth.service";
import { CreateTicketDialogComponent } from "./create-ticket-dialog/create-ticket-dialog.component";
import { EditTicketDialogComponent } from "./edit-ticket-dialog/edit-ticket-dialog.component";

export interface FilterOptions {
  assignedTo?: string;
  priority?: TicketPriority;
}

export interface SortOptions {
  sortBy: 'priority' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board | null = null;
  columns: Column[] = [];
  tickets: Ticket[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  loading = true;
  boardId: string;
  
  filters: FilterOptions = {};
  sortOptions: SortOptions = { sortBy: 'priority', sortOrder: 'desc' };
  
  priorityOptions = [
    { value: TicketPriority.LOW, label: 'Low' },
    { value: TicketPriority.MEDIUM, label: 'Medium' },
    { value: TicketPriority.HIGH, label: 'High' },
    { value: TicketPriority.URGENT, label: 'Urgent' }
  ];

  sortByOptions = [
    { value: 'priority', label: 'Priority' },
    { value: 'createdAt', label: 'Created Date' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private ticketService: TicketService,
    private userService: UserService,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.boardId = this.route.snapshot.params["id"];
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadFiltersFromUrl();
    this.loadBoardData();
    this.setupWebSocketListeners();
    this.webSocketService.joinBoard(this.boardId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.leaveBoard(this.boardId);
  }

  private loadFiltersFromUrl(): void {
    const queryParams = this.route.snapshot.queryParams;
    
    if (queryParams['assignedTo']) {
      this.filters.assignedTo = queryParams['assignedTo'];
    }
    if (queryParams['priority']) {
      this.filters.priority = queryParams['priority'] as TicketPriority;
    }
    
    if (queryParams['sortBy']) {
      this.sortOptions.sortBy = queryParams['sortBy'];
    }
    if (queryParams['sortOrder']) {
      this.sortOptions.sortOrder = queryParams['sortOrder'];
    }
  }

  private updateUrl(): void {
    const queryParams: Record<string, string> = {};
    
    if (this.filters.assignedTo) {
      queryParams['assignedTo'] = this.filters.assignedTo;
    }
    if (this.filters.priority) {
      queryParams['priority'] = this.filters.priority;
    }
    
    queryParams['sortBy'] = this.sortOptions.sortBy;
    queryParams['sortOrder'] = this.sortOptions.sortOrder;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  private loadBoardData(): void {
    this.loading = true;

    forkJoin({
      board: this.boardService.getBoardById(this.boardId),
      tickets: this.ticketService.getTicketsByBoard(this.boardId),
      users: this.userService.getUsers(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ board, tickets, users }) => {
          this.board = board;
          this.tickets = tickets;
          this.users = users;
          this.columns = board.columns || [];
          this.loading = false;
        },
        error: (_error) => {
          this.snackBar.open("Failed to load board data", "Close", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          });
          this.router.navigate(["/dashboard"]);
        },
      });
  }

  setupWebSocketListeners(): void {
    this.webSocketService.onTicketCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event && event.ticket && event.boardId === this.boardId) {
          this.tickets.push(event.ticket);
        }
      });

    this.webSocketService.onTicketUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event && event.ticket && event.boardId === this.boardId) {
          const index = this.tickets.findIndex((t) => t.id === event.ticket.id);
          if (index !== -1) {
            this.tickets[index] = event.ticket;
          }
        }
      });

    this.webSocketService.onTicketDeleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event && event.ticketId && event.boardId === this.boardId) {
          this.tickets = this.tickets.filter((t) => t.id !== event.ticketId);
        }
      });

    this.webSocketService.onTicketMoved$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event && event.ticket && event.boardId === this.boardId) {
          const index = this.tickets.findIndex((t) => t.id === event.ticket.id);
          if (index !== -1) {
            this.tickets[index] = event.ticket;
          }
        }
      });
  }

  getTicketsByColumn(columnId: string): Ticket[] {
    let columnTickets = this.tickets.filter((ticket) => ticket.columnId === columnId);
    
    if (this.filters.assignedTo) {
      columnTickets = columnTickets.filter(ticket => ticket.assignedTo === this.filters.assignedTo);
    }
    
    if (this.filters.priority) {
      columnTickets = columnTickets.filter(ticket => ticket.priority === this.filters.priority);
    }
    
    columnTickets.sort((a, b) => {
      let compareResult = 0;
      
      if (this.sortOptions.sortBy === 'priority') {
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        compareResult = aPriority - bPriority;
      } else if (this.sortOptions.sortBy === 'createdAt') {
        compareResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      if (this.sortOptions.sortOrder === 'desc') {
        compareResult = -compareResult;
      }
      
      if (compareResult === 0) {
        compareResult = a.order - b.order;
      }
      
      return compareResult;
    });
    
    return columnTickets;
  }

  onFilterChange(): void {
    this.updateUrl();
  }

  onSortChange(): void {
    this.updateUrl();
  }

  clearFilters(): void {
    this.filters = {};
    this.updateUrl();
  }

  clearAssignedToFilter(): void {
    this.filters.assignedTo = undefined;
    this.updateUrl();
  }

  clearPriorityFilter(): void {
    this.filters.priority = undefined;
    this.updateUrl();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.assignedTo || this.filters.priority);
  }

  onDrop(event: CdkDragDrop<Ticket[]>): void {
    const ticket = event.item.data;
    const targetColumnId = event.container.id;
    const targetColumn = this.columns.find((c) => c.id === targetColumnId);

    if (!targetColumn) return;

    if (event.previousContainer.id === event.container.id) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const moveData = {
        columnId: targetColumnId,
        order: event.currentIndex,
      };

      this.ticketService
        .moveTicket(ticket.id, moveData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedTicket) => {
            const index = this.tickets.findIndex(
              (t) => t.id === updatedTicket.id,
            );

            if (index !== -1) {
              const oldTickets = [...this.tickets];

              this.tickets = [
                ...oldTickets.slice(0, index),
                updatedTicket,
                ...oldTickets.slice(index + 1),
              ];
            }
          },
          error: (_error) => {
            this.snackBar.open("Failed to move ticket", "Close", {
              duration: 3000,
            });
            this.loadBoardData();
          },
        });
    }
  }

  openCreateTicketDialog(columnId: string): void {
    const dialogRef = this.dialog.open(CreateTicketDialogComponent, {
      width: "600px",
      data: {
        boardId: this.boardId,
        columnId: columnId,
        users: this.users,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.tickets.push(result);
        }
      });
  }

  openEditTicketDialog(ticket: Ticket): void {
    const dialogRef = this.dialog.open(EditTicketDialogComponent, {
      width: "600px",
      data: {
        ticket: { ...ticket },
        users: this.users,
        columns: this.columns,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          const index = this.tickets.findIndex((t) => t.id === result.id);
          if (index !== -1) {
            this.tickets[index] = result;
          }
        }
      });
  }

  deleteTicket(ticket: Ticket, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete "${ticket.title}"?`)) {
      this.ticketService
        .deleteTicket(ticket.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.tickets = this.tickets.filter((t) => t.id !== ticket.id);
            this.snackBar.open("Ticket deleted successfully", "Close", {
              duration: 3000,
              panelClass: ["success-snackbar"],
            });
          },
          error: (_error) => {
            this.snackBar.open("Failed to delete ticket", "Close", {
              duration: 5000,
              panelClass: ["error-snackbar"],
            });
          },
        });
    }
  }

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.id === userId);
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }

  getPriorityColor(priority: TicketPriority | string): string {
    if (!priority) {
      return "#757575";
    }

    const priorityStr =
      typeof priority === "string" ? priority : String(priority);

    switch (priorityStr) {
      case "LOW":
        return "#4caf50";
      case "MEDIUM":
        return "#ff9800";
      case "HIGH":
        return "#f44336";
      case "URGENT":
        return "#9c27b0";
      default:
        return "#757575";
    }
  }

  goBack(): void {
    this.router.navigate(["/dashboard"]);
  }
}
