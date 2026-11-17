package com.oolab.PET.repository;

import com.oolab.PET.enity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<Pet, Long> {
}
