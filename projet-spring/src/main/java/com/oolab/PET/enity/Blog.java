package com.oolab.PET.enity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "blogs")
@Getter
@Setter
@NoArgsConstructor
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    /** Either an http(s) URL or a base64 data URL coming from the upload form. */
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    /** Display name of the author. */
    private String author;

    /** Keycloak user id of the author. Set by the server. */
    private String authorId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date datePublished;

    private Integer likes = 0;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "blog_id")
    @OrderBy("datePosted ASC")
    private List<Comment> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "blog_tags", joinColumns = @JoinColumn(name = "blog_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    /** pending | approved | rejected */
    private String status = "pending";
}
