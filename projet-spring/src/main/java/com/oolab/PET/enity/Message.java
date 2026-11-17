package com.oolab.PET.enity;

import jakarta.persistence.Embeddable;

@Embeddable
public class Message {
    private String role; // "user" or "agent"
    private String content;
    private String timestamp;

    // Constructors
    public Message() {}

    public Message(String role, String content, String timestamp) {
        this.role = role;
        this.content = content;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
