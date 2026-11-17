package com.oolab.PET.model;

import com.oolab.PET.enity.Message;

import java.util.List;

public class ChatResponse {
    private List<Message> chatHistory;

    public ChatResponse(List<Message> chatHistory) {
        this.chatHistory = chatHistory;
    }

    // Getters
    public List<Message> getChatHistory() { return chatHistory; }
}
