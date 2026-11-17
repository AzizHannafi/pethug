package com.oolab.PET.service;

import com.oolab.PET.enity.Blog;
import com.oolab.PET.enity.Comment;

import java.util.List;

public interface BlogService {
    List<Blog> findAll();
    Blog findById(Long id);
    Blog create(Blog blog);
    Blog update(Long id, Blog blog);
    void delete(Long id);
    Blog updateStatus(Long id, String status);
    Blog like(Long id);
    Blog addComment(Long id, Comment comment);
}
