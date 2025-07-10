import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
} from "@nn-seca-tms/shared";

@Injectable({
  providedIn: "root",
})
export class TicketService {
  private apiUrl = "http://localhost:3000/api/tickets";

  constructor(private http: HttpClient) {}

  getTicketsByBoard(boardId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/board/${boardId}`);
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  createTicket(ticketData: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticketData);
  }

  updateTicket(id: string, ticketData: UpdateTicketDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticketData);
  }

  moveTicket(id: string, moveData: { columnId: string; order: number }): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/move`, moveData);
  }

  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
