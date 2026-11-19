package com.oolab.PET.service;

import com.oolab.PET.enity.Comment;
import com.oolab.PET.enity.Pet;

import java.util.List;

public interface PetService {
    List<Pet> findAll();
    List<Pet> findMine();
    Pet findById(Long id);
    Pet create(Pet pet);
    Pet update(Long id, Pet pet);
    void delete(Long id);
    Pet like(Long id);
    Pet addComment(Long id, Comment comment);
}
