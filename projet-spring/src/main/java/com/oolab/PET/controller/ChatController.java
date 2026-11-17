package com.oolab.PET.controller;


import com.oolab.PET.enity.Message;
import com.oolab.PET.model.ChatResponse;
import com.oolab.PET.service.BlogService;
import com.oolab.PET.service.ChatService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@SecurityRequirement(name = "keycloak")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/generate")
    public ResponseEntity<ChatResponse> generateResponse(
            @RequestBody Map<String, String> request,
            Authentication connectedUser) {

        String userId = connectedUser.getName();
        String userMessage = request.get("message");

        ChatResponse response = chatService.processUserMessage(userId, userMessage);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Message>> getChatHistory(Authentication connectedUser) {
        String userId = connectedUser.getName();
        List<Message> history = chatService.getChatHistory(userId);
        return ResponseEntity.ok(history);
    }



//    private final ChatModel chatModel;
//
//    public ChatController(ChatModel chatModel) {
//        this.chatModel = chatModel;
//    }



//    @GetMapping
//    public String getChat(
//            Authentication connectedUser
//    ) {
//        return "hellow world";
//    }
//
//    @GetMapping("/generate")
//    public String generate(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message,
//
//                           Authentication connectedUser) {
//
//        return chatModel.call(message);
//    }

}
