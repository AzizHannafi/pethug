import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AppConfigService } from './app-config.service';

export interface Message {
  role: string; // 'user' or 'agent'
  content: string;
  timestamp: string;
  safeContent?: any;
}

export interface ChatResponse {
  latestResponse: string;
  chatHistory: Message[];
}


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly apiUrl: string;

  constructor(private http: HttpClient, config: AppConfigService) {
    this.apiUrl = `${config.apiUrl}/chat`;
  }

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.apiUrl}/generate`,
      { message },
    ).pipe(
      tap(response => {
        console.log('Message sent successfully', response);
      }),
      catchError(error => {
        console.error('Error sending message', error);
        return throwError(error);
      })
    );
  }

    getChatHistory(): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/history`,
    ).pipe(
      tap(history => {
        console.log('Retrieved chat history', history);
      }),
      catchError(error => {
        console.error('Error fetching chat history', error);
        return throwError(error);
      })
    );
  }
}
