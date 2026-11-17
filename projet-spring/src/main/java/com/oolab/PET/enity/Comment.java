package com.oolab.PET.enity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Keycloak user id (UUID) of the author. */
    private String userId;

    private String userName;

    @Column(length = 2000)
    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date datePosted;
}
