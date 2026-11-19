package com.oolab.PET.controller;

import com.oolab.PET.enity.Comment;
import com.oolab.PET.enity.Pet;
import com.oolab.PET.service.PetService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
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

    /** The listings published by the caller. */
    @GetMapping("/me")
    public List<Pet> getMine() {
        return petService.findMine();
    }

    @GetMapping("/{id}")
    public Pet getById(@PathVariable Long id) {
        return petService.findById(id);
    }

    /** Anyone signed in may publish; the server records them as the owner. */
    @PostMapping
    public Pet create(@RequestBody Pet pet) {
        return petService.create(pet);
    }

    /** Owner or administrator only - enforced in the service, 403 otherwise. */
    @PutMapping("/{id}")
    public Pet update(@PathVariable Long id, @RequestBody Pet pet) {
        return petService.update(id, pet);
    }

    /** Owner or administrator only - enforced in the service, 403 otherwise. */
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
