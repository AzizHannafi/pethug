import { Component, OnInit } from '@angular/core';
import { ChatService, Message } from '../services/chat.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit  {

    messages: Message[] = [];
  newMessage = '';
  isLoading: boolean = false;

  constructor(private chatService: ChatService,  private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadChatHistory();
  }

    loadChatHistory(): void {
    this.chatService.getChatHistory().subscribe({
      next: (history) => {
        this.messages = history.map(msg => ({
          ...msg,
          safeContent: this.processMessageContent(msg.content)
        }));
      },
      error: (err) => {
        console.error('Failed to load chat history', err);
      }
    });
  }

  sendMessage(): void {

    const userMessage: Message = {
      role: 'user',
      content: this.newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    this.messages = [...this.messages, userMessage];
    
    // Show typing indicator
    this.isLoading =  true
    
    // Clear input
    this.newMessage = '';

    this.chatService.sendMessage(userMessage.content).subscribe({
      next: (response) => {
          this.isLoading = false;
          this.messages = response.chatHistory.map(msg => ({
          ...msg,
          safeContent: this.processMessageContent(msg.content)
        }));
        this.newMessage = '';
      },
      error: (err) => {
        console.error('Failed to send message', err);
        this.isLoading = false;
      }
    });
  }

    processMessageContent(content: string) {
    // Convert newlines to <br> tags and sanitize
    const withBreaks = content.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
  }

}
