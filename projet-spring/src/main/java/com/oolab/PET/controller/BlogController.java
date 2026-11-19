package com.oolab.PET.controller;

import com.oolab.PET.enity.Blog;
import com.oolab.PET.enity.Comment;
import com.oolab.PET.service.BlogService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@SecurityRequirement(name = "keycloak")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public List<Blog> getAll() {
        return blogService.findAll();
    }

    /** The posts written by the caller, whatever their moderation status. */
    @GetMapping("/me")
    public List<Blog> getMine() {
        return blogService.findMine();
    }

    @GetMapping("/{id}")
    public Blog getById(@PathVariable Long id) {
        return blogService.findById(id);
    }

    /** Anyone signed in may publish; the post starts as "pending". */
    @PostMapping
    public Blog create(@RequestBody Blog blog) {
        return blogService.create(blog);
    }

    /** Author or administrator only - enforced in the service, 403 otherwise. */
    @PutMapping("/{id}")
    public Blog update(@PathVariable Long id, @RequestBody Blog blog) {
        return blogService.update(id, blog);
    }

    /** Author or administrator only - enforced in the service, 403 otherwise. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        blogService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Moderation: approving your own post would defeat the purpose.
    @PreAuthorize("hasRole('client_admin')")
    @PutMapping("/{id}/status")
    public Blog updateStatus(@PathVariable Long id, @RequestParam String status) {
        return blogService.updateStatus(id, status);
    }

    @PostMapping("/{id}/like")
    public Blog like(@PathVariable Long id) {
        return blogService.like(id);
    }

    @PostMapping("/{id}/comments")
    public Blog addComment(@PathVariable Long id, @RequestBody Comment comment) {
        return blogService.addComment(id, comment);
    }
}
