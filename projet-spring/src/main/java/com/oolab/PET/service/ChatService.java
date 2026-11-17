package com.oolab.PET.service;


import com.oolab.PET.enity.Chat;
import com.oolab.PET.enity.Message;
import com.oolab.PET.model.ChatResponse;
import com.oolab.PET.repository.ChatRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatRepository chatRepository;

    private final ChatModel chatModel;

    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern("h:mm:ss a");

    private static final String MODEL_UNAVAILABLE_MESSAGE =
            "The assistant is not reachable right now. If you just started the stack, "
                    + "the language model is still being downloaded - try again in a few minutes.";

    public ChatService(ChatRepository chatRepository, ChatModel chatModel) {
        this.chatRepository = chatRepository;
        this.chatModel = chatModel;

    }

    public ChatResponse processUserMessage(String userId, String userMessage) {
        String timestamp = LocalTime.now().format(TIME_FORMATTER);

        Chat chat = chatRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Chat newSession = new Chat();
                    newSession.setUserId(userId);
                    return chatRepository.save(newSession);
                });

        // Add user message
        chat.addUserMessage(userMessage, timestamp);

        // Generate AI response - the model may not be ready yet, never fail the request for that
        String aiResponse;
        try {
            aiResponse = chatModel.call(userMessage);
        } catch (Exception e) {
            log.warn("Chat model unavailable: {}", e.getMessage());
            aiResponse = MODEL_UNAVAILABLE_MESSAGE;
        }
        String aiTimestamp = LocalTime.now().format(TIME_FORMATTER);
        chat.addAgentMessage(aiResponse, aiTimestamp);

        chatRepository.save(chat);

        return new ChatResponse(chat.getMessages());
    }

    public List<Message> getChatHistory(String userId) {
        return chatRepository.findByUserId(userId)
                .map(Chat::getMessages)
                .orElse(Collections.emptyList());
    }
}
