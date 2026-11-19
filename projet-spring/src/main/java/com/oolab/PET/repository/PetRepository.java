package com.oolab.PET.repository;

import com.oolab.PET.enity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerIdOrderByDateAddedDesc(String ownerId);
}
