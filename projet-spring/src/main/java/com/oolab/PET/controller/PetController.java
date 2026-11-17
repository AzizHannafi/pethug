package com.oolab.PET.controller;

import com.oolab.PET.enity.Comment;
import com.oolab.PET.enity.Pet;
import com.oolab.PET.service.PetService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@SecurityRequirement(name = "keycloak")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<Pet> getAll() {
        return petService.findAll();
    }

    @GetMapping("/{id}")
    public Pet getById(@PathVariable Long id) {
        return petService.findById(id);
    }

    // Only administrators publish and curate pet listings.
    @PreAuthorize("hasRole('client_admin')")
    @PostMapping
    public Pet create(@RequestBody Pet pet) {
        return petService.create(pet);
    }

    // Only administrators edit a listing.
    @PreAuthorize("hasRole('client_admin')")
    @PutMapping("/{id}")
    public Pet update(@PathVariable Long id, @RequestBody Pet pet) {
        return petService.update(id, pet);
    }

    // Only administrators remove a listing.
    @PreAuthorize("hasRole('client_admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public Pet like(@PathVariable Long id) {
        return petService.like(id);
    }

    @PostMapping("/{id}/comments")
    public Pet addComment(@PathVariable Long id, @RequestBody Comment comment) {
        return petService.addComment(id, comment);
    }
}
