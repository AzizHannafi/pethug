package com.oolab.PET.service.impl;

import com.oolab.PET.enity.Blog;
import com.oolab.PET.enity.Comment;
import com.oolab.PET.exception.ResourceNotFoundException;
import com.oolab.PET.repository.BlogRepository;
import com.oolab.PET.security.CurrentUser;
import com.oolab.PET.service.BlogService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@Transactional
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final CurrentUser currentUser;

    public BlogServiceImpl(BlogRepository blogRepository, CurrentUser currentUser) {
        this.blogRepository = blogRepository;
        this.currentUser = currentUser;
    }

    @Override
    public List<Blog> findAll() {
        return blogRepository.findAll();
    }

    @Override
    public List<Blog> findMine() {
        return blogRepository.findByAuthorIdOrderByDatePublishedDesc(currentUser.id());
    }

    @Override
    public Blog findById(Long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found with id " + id));
    }

    @Override
    public Blog create(Blog blog) {
        blog.setId(null);
        blog.setDatePublished(new Date());
        blog.setLikes(0);
        // Every new post goes through moderation, whoever wrote it.
        blog.setStatus("pending");
        blog.getComments().clear();
        blog.setAuthorId(currentUser.id());
        blog.setAuthor(currentUser.displayName());
        return blogRepository.save(blog);
    }

    @Override
    public Blog update(Long id, Blog blog) {
        Blog existing = findById(id);
        currentUser.assertCanManage(existing.getAuthorId(), "posts");
        existing.setTitle(blog.getTitle());
        existing.setContent(blog.getContent());
        existing.setImageUrl(blog.getImageUrl());
        existing.setTags(blog.getTags() == null ? new ArrayList<>() : new ArrayList<>(blog.getTags()));
        // Editing your own post sends it back to moderation; an admin may set the
        // status explicitly through the dedicated endpoint.
        if (!currentUser.isAdmin()) {
            existing.setStatus("pending");
        } else if (blog.getStatus() != null) {
            existing.setStatus(blog.getStatus());
        }
        return blogRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        Blog existing = findById(id);
        currentUser.assertCanManage(existing.getAuthorId(), "posts");
        blogRepository.delete(existing);
    }

    @Override
    public Blog updateStatus(Long id, String status) {
        Blog existing = findById(id);
        existing.setStatus(status);
        return blogRepository.save(existing);
    }

    @Override
    public Blog like(Long id) {
        Blog existing = findById(id);
        existing.setLikes((existing.getLikes() == null ? 0 : existing.getLikes()) + 1);
        return blogRepository.save(existing);
    }

    @Override
    public Blog addComment(Long id, Comment comment) {
        Blog existing = findById(id);
        comment.setId(null);
        comment.setUserId(currentUser.id());
        comment.setUserName(currentUser.displayName());
        comment.setDatePosted(new Date());
        existing.getComments().add(comment);
        return blogRepository.save(existing);
    }
}
