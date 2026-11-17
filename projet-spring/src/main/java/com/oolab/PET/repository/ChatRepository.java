package com.oolab.PET.repository;

import com.oolab.PET.enity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    Optional<Chat> findByUserId(String userId);
}
