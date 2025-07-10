import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Board, CreateBoardDto, UpdateBoardDto } from "@nn-seca-tms/shared";

@Injectable({
  providedIn: "root",
})
export class BoardService {
  private apiUrl = "http://localhost:3000/api/boards";

  constructor(private http: HttpClient) {}

  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl);
  }

  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${id}`);
  }

  createBoard(boardData: CreateBoardDto): Observable<Board> {
    return this.http.post<Board>(this.apiUrl, boardData);
  }

  updateBoard(id: string, boardData: UpdateBoardDto): Observable<Board> {
    return this.http.patch<Board>(`${this.apiUrl}/${id}`, boardData);
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
