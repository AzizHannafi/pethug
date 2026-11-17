package com.oolab.PET.enity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** pet | blog */
    private String type;

    private Long itemId;

    private String itemTitle;

    /** Keycloak user id (UUID) of the reporter. */
    private String reporterId;

    private String reporterName;

    private String reason;

    @Column(length = 2000)
    private String description;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateReported;

    /** pending | reviewed | resolved */
    private String status;
}
