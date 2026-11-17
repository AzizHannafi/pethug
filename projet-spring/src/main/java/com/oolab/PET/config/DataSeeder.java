package com.oolab.PET.config;

import com.oolab.PET.enity.Blog;
import com.oolab.PET.enity.Comment;
import com.oolab.PET.enity.Pet;
import com.oolab.PET.enity.Report;
import com.oolab.PET.repository.BlogRepository;
import com.oolab.PET.repository.PetRepository;
import com.oolab.PET.repository.ReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * Seeds the database with demo content the first time the application starts
 * against an empty schema, so the UI is never blank out of the box.
 * Does nothing as soon as the tables hold data.
 */
@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final PetRepository petRepository;
    private final BlogRepository blogRepository;
    private final ReportRepository reportRepository;

    public DataSeeder(PetRepository petRepository,
                      BlogRepository blogRepository,
                      ReportRepository reportRepository) {
        this.petRepository = petRepository;
        this.blogRepository = blogRepository;
        this.reportRepository = reportRepository;
    }

    @Override
    public void run(String... args) {
        if (petRepository.count() == 0) {
            seedPets();
        }
        if (blogRepository.count() == 0) {
            seedBlogs();
        }
        if (reportRepository.count() == 0) {
            seedReports();
        }
    }

    private static Date date(String isoDate) {
        return Date.from(LocalDate.parse(isoDate).atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private static Comment comment(String userId, String userName, String content, String isoDate) {
        Comment c = new Comment();
        c.setUserId(userId);
        c.setUserName(userName);
        c.setContent(content);
        c.setDatePosted(date(isoDate));
        return c;
    }

    private void seedPets() {
        Pet bella = new Pet();
        bella.setName("Bella");
        bella.setType("dog");
        bella.setBreed("Golden Retriever");
        bella.setAge(3);
        bella.setSize("large");
        bella.setGender("female");
        bella.setColor("Golden");
        bella.setDescription("Friendly and energetic dog, great with families.");
        bella.setImageUrl("https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800");
        bella.setIsVaccinated(true);
        bella.setLocation("New York, NY");
        bella.setContactEmail("contact@adoptpets.com");
        bella.setContactPhone("123-456-7890");
        bella.setDateAdded(date("2024-05-20"));
        bella.setLikes(42);
        bella.getComments().addAll(Arrays.asList(
                comment("seed-alice", "Alice", "Bella looks so sweet!", "2024-05-21"),
                comment("seed-john", "JohnDoe", "Is she still available?", "2024-05-22")
        ));

        Pet milo = new Pet();
        milo.setName("Milo");
        milo.setType("cat");
        milo.setBreed("Siamese");
        milo.setAge(2);
        milo.setSize("medium");
        milo.setGender("male");
        milo.setColor("Cream and Brown");
        milo.setDescription("Quiet and cuddly indoor cat.");
        milo.setImageUrl("https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=800");
        milo.setIsVaccinated(true);
        milo.setLocation("Los Angeles, CA");
        milo.setContactEmail("info@petfinder.com");
        milo.setContactPhone("987-654-3210");
        milo.setDateAdded(date("2024-06-01"));
        milo.setLikes(30);
        milo.getComments().add(comment("seed-catlover", "CatLover88", "I love Siamese cats!", "2024-06-02"));

        Pet chirpy = new Pet();
        chirpy.setName("Chirpy");
        chirpy.setType("bird");
        chirpy.setBreed("Parakeet");
        chirpy.setAge(1);
        chirpy.setSize("small");
        chirpy.setGender("male");
        chirpy.setColor("Green and Yellow");
        chirpy.setDescription("Lively and talkative parakeet. Needs attention.");
        chirpy.setImageUrl("https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800");
        chirpy.setIsVaccinated(false);
        chirpy.setLocation("Austin, TX");
        chirpy.setContactEmail("pets@austinrescue.org");
        chirpy.setContactPhone("555-321-1234");
        chirpy.setDateAdded(date("2024-05-15"));
        chirpy.setLikes(15);

        petRepository.saveAll(List.of(bella, milo, chirpy));
        log.info("Seeded 3 demo pets");
    }

    private void seedBlogs() {
        Blog guide = new Blog();
        guide.setTitle("The Ultimate Guide to Pet Adoption");
        guide.setContent("Adopting a pet is a life changing decision. This guide walks you through "
                + "choosing the right companion, preparing your home, and the first weeks together.");
        guide.setImageUrl("https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800");
        guide.setAuthor("Sarah Johnson");
        guide.setDatePublished(date("2024-05-18"));
        guide.setLikes(54);
        guide.setTags(Arrays.asList("adoption", "guide", "beginners"));
        guide.setStatus("approved");
        guide.getComments().add(comment("seed-emma", "Emma", "This helped us so much, thank you!", "2024-05-19"));

        Blog behaviour = new Blog();
        behaviour.setTitle("Understanding Your Pet Behaviour");
        behaviour.setContent("Body language, vocalisations and routines tell you a lot about how your "
                + "pet feels. Learn to read the signals and respond to them properly.");
        behaviour.setImageUrl("https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=800");
        behaviour.setAuthor("Dr. Michael Chen");
        behaviour.setDatePublished(date("2024-05-25"));
        behaviour.setLikes(37);
        behaviour.setTags(Arrays.asList("behaviour", "training", "health"));
        behaviour.setStatus("approved");

        Blog home = new Blog();
        home.setTitle("Preparing Your Home for a New Pet");
        home.setContent("A safe home is a happy home. Here is a practical checklist to run through "
                + "before your new companion walks through the door.");
        home.setImageUrl("https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=800");
        home.setAuthor("Laura Martins");
        home.setDatePublished(date("2024-06-03"));
        home.setLikes(28);
        home.setTags(Arrays.asList("home", "safety", "preparation"));
        home.setStatus("pending");

        blogRepository.saveAll(List.of(guide, behaviour, home));
        log.info("Seeded 3 demo blog posts");
    }

    private void seedReports() {
        Report r1 = new Report();
        r1.setType("pet");
        r1.setItemId(1L);
        r1.setItemTitle("Bella");
        r1.setReporterId("seed-jane");
        r1.setReporterName("Jane Smith");
        r1.setReason("inappropriate");
        r1.setDescription("The description contains language that is not suitable for a family-friendly platform.");
        r1.setDateReported(date("2024-06-05"));
        r1.setStatus("pending");

        Report r2 = new Report();
        r2.setType("blog");
        r2.setItemId(2L);
        r2.setItemTitle("Understanding Your Pet Behaviour");
        r2.setReporterId("seed-mike");
        r2.setReporterName("Mike Johnson");
        r2.setReason("misinformation");
        r2.setDescription("This post contains incorrect information about pet behaviour that could be harmful.");
        r2.setDateReported(date("2024-06-07"));
        r2.setStatus("reviewed");

        reportRepository.saveAll(List.of(r1, r2));
        log.info("Seeded 2 demo reports");
    }
}
