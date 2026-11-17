package com.oolab.PET.enity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "pets")
@Getter
@Setter
@NoArgsConstructor
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** dog | cat | bird | rabbit | other */
    private String type;

    private String breed;

    private Integer age;

    /** small | medium | large */
    private String size;

    /** male | female */
    private String gender;

    private String color;

    @Column(length = 5000)
    private String description;

    /** Either an http(s) URL or a base64 data URL coming from the upload form. */
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    private Boolean isVaccinated = Boolean.FALSE;

    private String location;

    private String contactEmail;

    private String contactPhone;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateAdded;

    private Integer likes = 0;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "pet_id")
    @OrderBy("datePosted ASC")
    private List<Comment> comments = new ArrayList<>();
}
