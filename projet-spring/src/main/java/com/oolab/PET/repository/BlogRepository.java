package com.oolab.PET.repository;

import com.oolab.PET.enity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByAuthorIdOrderByDatePublishedDesc(String authorId);
}
