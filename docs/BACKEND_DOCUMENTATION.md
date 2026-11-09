# WriteSpace: Backend Engineering & Implementation Manual

> **Framework:** Spring Boot 3.2.x / Java 17 LTS  
> **Build Tool:** Apache Maven 3.8+  
> **ORM & Data:** Spring Data JPA / Hibernate 6.x / Flyway Core  
> **Status:** Implementation Baseline Manual

---

## 1. Purpose
This document provides the definitive implementation manual for the **WriteSpace** backend application. It details the internal packaging conventions, component contracts, dependency wiring, transaction policies, entity relationships, and unit/integration testing standards.

---

## 2. Scope
This manual guides the development of the Java Spring Boot service located in `backend/`, including:
- Maven project dependency declarations (`pom.xml`).
- Package taxonomy and layer responsibilities.
- JPA Entity definitions and relational mappings.
- Repository query methods and pagination.
- Service interfaces, transactional logic, and DTO transformations.
- REST Controllers and Jakarta Validation handling.
- Centralized exception interception.

---

## 3. Maven Dependency Architecture (`pom.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>

    <groupId>com.writespace</groupId>
    <artifactId>writespace-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>writespace-backend</name>
    <description>WriteSpace Social Publishing Backend API</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.5</jjwt.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Database & Migrations -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

        <!-- JWT Token Library -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- HTML Sanitizer for Article Content -->
        <dependency>
            <groupId>org.jsoup</groupId>
            <artifactId>jsoup</artifactId>
            <version>1.17.2</version>
        </dependency>

        <!-- Testing Dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 4. Package Structure & Architectural Separation

```
com.writespace/
├── WriteSpaceApplication.java          # Spring Boot main entry point
│
├── config/                             # Infrastructure Beans
│   ├── SecurityConfig.java             # SecurityFilterChain & CORS rules
│   ├── WebMvcConfig.java               # WebMvcConfigurer & formatters
│   └── JpaConfig.java                  # AuditingEntityListener configuration
│
├── controller/                         # REST API perimeter adapters
│   ├── AuthController.java             # /api/v1/auth
│   ├── UserController.java             # /api/v1/users
│   ├── PostController.java             # /api/v1/posts
│   ├── CommentController.java          # /api/v1/posts/{id}/comments
│   ├── SocialController.java           # /api/v1/posts/{id}/like & bookmarks
│   └── FeedController.java             # /api/v1/feed
│
├── dto/                                # Immutable Data Transfer Objects (Records)
│   ├── request/                        # Inbound payloads with @Valid annotations
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── PostCreateRequest.java
│   │   └── CommentCreateRequest.java
│   └── response/                       # Outbound payloads
│       ├── AuthResponse.java
│       ├── UserProfileResponse.java
│       ├── PostResponse.java
│       ├── PostSummaryResponse.java
│       └── ErrorResponse.java
│
├── entity/                             # JPA / Hibernate entities mapped to PostgreSQL
│   ├── BaseAuditEntity.java            # Shared created_at & updated_at timestamps
│   ├── User.java
│   ├── Post.java
│   ├── Comment.java
│   ├── Like.java
│   ├── Follow.java
│   └── Bookmark.java
│
├── exception/                          # Domain exceptions & Global Exception Advice
│   ├── ResourceNotFoundException.java
│   ├── ResourceAlreadyExistsException.java
│   ├── UnauthorizedActionException.java
│   ├── SelfFollowException.java
│   └── GlobalExceptionHandler.java     # Central @RestControllerAdvice
│
├── mapper/                             # Entity <-> DTO translation components
│   ├── UserMapper.java
│   └── PostMapper.java
│
├── repository/                         # Spring Data JPA Repository interfaces
│   ├── UserRepository.java
│   ├── PostRepository.java
│   ├── CommentRepository.java
│   ├── LikeRepository.java
│   ├── FollowRepository.java
│   └── BookmarkRepository.java
│
├── security/                           # Stateless JWT Security components
│   ├── JwtTokenProvider.java          # Token generation, signing, and parsing
│   ├── JwtAuthenticationFilter.java   # OncePerRequestFilter extracting Bearer JWT
│   └── CustomUserDetailsService.java  # UserDetailsService implementation
│
└── service/                            # Domain business logic contracts & impls
    ├── AuthService.java / AuthServiceImpl.java
    ├── UserService.java / UserServiceImpl.java
    ├── PostService.java / PostServiceImpl.java
    ├── CommentService.java / CommentServiceImpl.java
    ├── SocialService.java / SocialServiceImpl.java
    └── FeedService.java / FeedServiceImpl.java
```

---

## 5. Domain Entity Architecture

### 5.1 Base Audit Entity (`BaseAuditEntity.java`)
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseAuditEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Getters and Setters
}
```

### 5.2 Post Entity (`Post.java`)
```java
@Entity
@Table(name = "posts")
public class Post extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostStatus status = PostStatus.DRAFT;

    @Column(name = "reading_time_minutes", nullable = false)
    private int readingTimeMinutes = 1;

    @Column(name = "published_at")
    private Instant publishedAt;

    // Constructors, Getters, and Setters
}
```

---

## 6. Repository Design & Custom Queries

### 6.1 `PostRepository.java`
```java
@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Optional<Post> findBySlugAndStatus(String slug, PostStatus status);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.author.username = :username AND p.status = :status")
    Page<Post> findByAuthorUsernameAndStatus(
        @Param("username") String username,
        @Param("status") PostStatus status,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Post p
        JOIN Follow f ON p.author.id = f.following.id
        WHERE f.follower.id = :userId AND p.status = 'PUBLISHED'
        ORDER BY p.publishedAt DESC
    """)
    Page<Post> findUserFeed(@Param("userId") UUID userId, Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        WHERE p.status = 'PUBLISHED'
          AND (lower(p.title) LIKE lower(concat('%', :query, '%'))
           OR lower(p.excerpt) LIKE lower(concat('%', :query, '%')))
    """)
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);
}
```

---

## 7. Service Implementation & Transaction Rules

### 7.1 Transaction Management
- Class-level: `@Transactional(readOnly = true)` applied to all service implementations to optimize database connection read locks.
- Method-level: Mutating actions (`createPost`, `updatePost`, `deletePost`, `toggleLike`) override with `@Transactional(rollbackFor = Exception.class)`.

### 7.2 PostService Sample Implementation
```java
@Service
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;

    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository, PostMapper postMapper) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postMapper = postMapper;
    }

    @Override
    @Transactional
    public PostResponse createPost(PostCreateRequest request, UUID currentUserId) {
        User author = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String slug = generateUniqueSlug(request.title());
        int readingTime = calculateReadingTime(request.content());

        Post post = new Post();
        post.setAuthor(author);
        post.setTitle(request.title());
        post.setSlug(slug);
        post.setExcerpt(request.excerpt());
        post.setContent(request.content());
        post.setCoverImageUrl(request.coverImageUrl());
        post.setStatus(request.status());
        post.setReadingTimeMinutes(readingTime);

        if (request.status() == PostStatus.PUBLISHED) {
            post.setPublishedAt(Instant.now());
        }

        Post savedPost = postRepository.save(post);
        return postMapper.toResponse(savedPost);
    }

    private String generateUniqueSlug(String title) {
        String base = title.toLowerCase()
            .replaceAll("[^a-z0-9\\s]", "")
            .replaceAll("\\s+", "-");
        // Collisions append random alphanumeric characters
        return base + "-" + UUID.randomUUID().toString().substring(0, 6);
    }

    private int calculateReadingTime(String content) {
        int words = content.trim().split("\\s+").length;
        return Math.max(1, (int) Math.ceil(words / 200.0));
    }
}
```

---

## 8. REST Controller Layer & Validation Handling

### 8.1 Controller Implementation (`PostController.java`)
```java
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
        @Valid @RequestBody PostCreateRequest request,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        PostResponse response = postService.createPost(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PostResponse> getPostBySlug(
        @PathVariable String slug,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID viewerId = (principal != null) ? principal.getId() : null;
        return ResponseEntity.ok(postService.getPostBySlug(slug, viewerId));
    }
}
```

---

## 9. Global Exception Handling Layer

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationErrors(
        MethodArgumentNotValidException ex, 
        HttpServletRequest request
    ) {
        List<FieldErrorDetail> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> new FieldErrorDetail(f.getField(), String.valueOf(f.getRejectedValue()), f.getDefaultMessage()))
            .toList();

        ValidationErrorResponse response = new ValidationErrorResponse(
            Instant.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Validation Failed",
            "One or more request parameters failed validation",
            request.getRequestURI(),
            fieldErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
```

---

## 10. Testing Requirements
- **Unit Testing:** JUnit 5 and Mockito for isolated service unit tests (`PostServiceTest`, `AuthServiceTest`).
- **Repository Testing:** `@DataJpaTest` with test schema validating queries, pagination, and constraint violations.
- **Integration Testing:** `@SpringBootTest` + `MockMvc` verifying HTTP endpoint authorization barriers and status codes.
