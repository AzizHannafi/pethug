package com.oolab.PET.enity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_sessions")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    // EAGER: the history is serialised outside the transaction (open-in-view is off),
    // a lazy collection would blow up with a LazyInitializationException.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "chat_messages", joinColumns = @JoinColumn(name = "session_id"))
    @OrderColumn(name = "message_order")
    private List<Message> messages = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper methods
    public void addUserMessage(String content, String timestamp) {
        messages.add(new Message("user", content, timestamp));
    }

    public void addAgentMessage(String content, String timestamp) {
        messages.add(new Message("agent", content, timestamp));
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<Message> getMessages() {
        return messages;
    }
}
