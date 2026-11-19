package com.oolab.PET.service.impl;

import com.oolab.PET.enity.Comment;
import com.oolab.PET.enity.Pet;
import com.oolab.PET.exception.ResourceNotFoundException;
import com.oolab.PET.repository.PetRepository;
import com.oolab.PET.security.CurrentUser;
import com.oolab.PET.service.PetService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Transactional
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final CurrentUser currentUser;

    public PetServiceImpl(PetRepository petRepository, CurrentUser currentUser) {
        this.petRepository = petRepository;
        this.currentUser = currentUser;
    }

    @Override
    public List<Pet> findAll() {
        return petRepository.findAll();
    }

    @Override
    public List<Pet> findMine() {
        return petRepository.findByOwnerIdOrderByDateAddedDesc(currentUser.id());
    }

    @Override
    public Pet findById(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with id " + id));
    }

    @Override
    public Pet create(Pet pet) {
        pet.setId(null);
        pet.setDateAdded(new Date());
        pet.setLikes(0);
        pet.getComments().clear();
        // Ownership comes from the token, never from the request body.
        pet.setOwnerId(currentUser.id());
        pet.setOwnerName(currentUser.displayName());
        return petRepository.save(pet);
    }

    @Override
    public Pet update(Long id, Pet pet) {
        Pet existing = findById(id);
        currentUser.assertCanManage(existing.getOwnerId(), "pet listings");
        existing.setName(pet.getName());
        existing.setType(pet.getType());
        existing.setBreed(pet.getBreed());
        existing.setAge(pet.getAge());
        existing.setSize(pet.getSize());
        existing.setGender(pet.getGender());
        existing.setColor(pet.getColor());
        existing.setDescription(pet.getDescription());
        existing.setImageUrl(pet.getImageUrl());
        existing.setIsVaccinated(pet.getIsVaccinated());
        existing.setLocation(pet.getLocation());
        existing.setContactEmail(pet.getContactEmail());
        existing.setContactPhone(pet.getContactPhone());
        return petRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        Pet existing = findById(id);
        currentUser.assertCanManage(existing.getOwnerId(), "pet listings");
        petRepository.delete(existing);
    }

    @Override
    public Pet like(Long id) {
        Pet existing = findById(id);
        existing.setLikes((existing.getLikes() == null ? 0 : existing.getLikes()) + 1);
        return petRepository.save(existing);
    }

    @Override
    public Pet addComment(Long id, Comment comment) {
        Pet existing = findById(id);
        comment.setId(null);
        comment.setUserId(currentUser.id());
        comment.setUserName(currentUser.displayName());
        comment.setDatePosted(new Date());
        existing.getComments().add(comment);
        return petRepository.save(existing);
    }
}
