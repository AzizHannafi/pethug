# PetHug API — Spring Boot

REST API for the PetHug pet adoption platform: **Spring Boot 3.4**, **MySQL**,
**Keycloak** (OAuth2 / OIDC), and an optional AI chat assistant served by **Ollama**.

Docker runs everything the API needs. You run the API.

---

## 1. Requirements

| Tool | Version | Check |
|---|---|---|
| Docker Desktop | any recent | `docker --version` |
| JDK | **17 or later** | `java -version` |

Maven is **not** required: the project ships the Maven wrapper (`mvnw`).

> If `java -version` shows 1.8 or anything below 17, install a JDK 17 and make sure
> your IDE points at it. The API will not compile otherwise.

---

## 2. Start the infrastructure

From **this folder** (`projet-spring/`):

```bash
docker compose up -d
```

Everything the API needs starts:

| Container | Role | Exposed on |
|---|---|---|
| `pethug-mysql` | the API database (`petsdb`) | `localhost:3306` |
| `pethug-keycloak-db` | Keycloak's **own** database (`keycloak`) | internal only |
| `pethug-keycloak` | identity provider, realm `pet` | `localhost:8080` |
| `pethug-adminer` | web UI to browse both databases | `localhost:8087` |
| `pethug-ollama` | the AI chat model; downloads it itself on first run | `localhost:11434` |

> **The first run downloads ~3.2 GB** for Ollama. To start without it:
> ```bash
> docker compose up -d mysql keycloak-db keycloak adminer
> ```
> The API runs perfectly without it — the chat simply answers that the assistant
> is unavailable.
>
> `docker compose up` is all-or-nothing: if that large download fails, Compose
> rolls back everything it created in the same command. Starting in two steps
> keeps the databases safe, because they are already running by then:
> ```bash
> docker compose up -d mysql keycloak-db keycloak adminer
> docker compose up -d
> ```

The two databases are deliberately separate: the API owns its schema, Keycloak owns
its own, and neither can corrupt the other. You can reset one without touching the
other.

> **The very first start takes a few minutes.** Keycloak applies 148 database
> migrations before it answers. Watch it with:
> ```bash
> docker compose logs -f keycloak
> ```
> and wait for the line `Keycloak 26.0.8 ... started`. Later starts take seconds.

Check everything is up:

```bash
docker compose ps
```

`mysql` and `keycloak-db` must show `(healthy)`.

---

## 3. Start the API

```bash
./mvnw spring-boot:run
```

On Windows:

```bat
mvnw.cmd spring-boot:run
```

Wait for:

```
Tomcat started on port 8086 (http) with context path '/'
Started PetApplication in X seconds
```

On the very first run the API creates its tables and inserts demo data — 3 pets,
3 articles, 2 reports — so nothing is ever empty. It only seeds when the tables are
empty, so your own data is never overwritten.

**From an IDE:** run `com.oolab.PET.PetApplication`. Nothing else to configure. If you
change `pom.xml`, reload the Maven project first.

Quick check:

```bash
curl http://localhost:8086/actuator/health
```

Swagger UI: <http://localhost:8086/swagger-ui.html>

---

## 4. Log in and call the API

Every route except the Swagger and health endpoints needs a Keycloak token.

### Test accounts

The realm ships with two accounts, created automatically, so you can exercise both
sides of the application:

| Account | Password | Keycloak client roles | Who they are |
|---|---|---|---|
| `admin` | `admin` | `client_admin`, `client_user` | administrator: moderates and manages |
| `user` | `user` | `client_user` | standard member: browses, posts, reports |

Anyone can also register from the Keycloak login page.

### Getting a token

```bash
curl -X POST http://localhost:8080/realms/pet/protocol/openid-connect/token \
  -d "client_id=pet-hug-front" \
  -d "grant_type=password" \
  -d "username=admin" \
  -d "password=admin"
```

Copy the `access_token` from the response and use it:

```bash
curl http://localhost:8086/api/pets -H "Authorization: Bearer <token>"
```

Without a token you get **401**. With a token but the wrong role, **403**.

---

## 5. What each role can do

This is the part worth testing: the two accounts behave differently.

| Action | `user` | `admin` |
|---|:--:|:--:|
| Browse pets and articles | yes | yes |
| Read one pet / one article | yes | yes |
| Like, comment | yes | yes |
| Publish an article (lands as `pending`) | yes | yes |
| Report a listing or an article | yes | yes |
| Talk to the AI assistant | yes | yes |
| Create / edit / delete a pet listing | **403** | yes |
| Edit or delete an article | **403** | yes |
| Approve or reject an article | **403** | yes |
| Read the moderation queue (reports) | **403** | yes |
| Handle or dismiss a report | **403** | yes |
| Read the user directory | **403** | yes |

The rule is enforced in the controllers with
`@PreAuthorize("hasRole('client_admin')")`. The role comes from the token:
`JwtAuthConverter` reads `resource_access.pet-hug-front.roles` and turns each entry
into a Spring authority prefixed with `ROLE_`.

### Scenario to try

1. Get a token as `user`, publish an article → it comes back with `"status": "pending"`.
2. Still as `user`, try to approve it → **403**.
3. Get a token as `admin`, `PUT /api/blogs/{id}/status?status=approved` → **200**.
4. As `user`, report a pet → **200**. Try to read `/api/reports` → **403**.
5. As `admin`, read `/api/reports` → the report is in the queue.

---

## 6. Endpoints

| Method | Route | Role |
|---|---|---|
| `GET` | `/api/pets`, `/api/pets/{id}` | any signed-in user |
| `POST PUT DELETE` | `/api/pets`, `/api/pets/{id}` | `client_admin` |
| `POST` | `/api/pets/{id}/like`, `/api/pets/{id}/comments` | any signed-in user |
| `GET` | `/api/blogs`, `/api/blogs/{id}` | any signed-in user |
| `POST` | `/api/blogs` | any signed-in user |
| `PUT DELETE` | `/api/blogs/{id}` | `client_admin` |
| `PUT` | `/api/blogs/{id}/status?status=approved` | `client_admin` |
| `POST` | `/api/blogs/{id}/like`, `/api/blogs/{id}/comments` | any signed-in user |
| `POST` | `/api/reports` | any signed-in user |
| `GET` | `/api/reports` | `client_admin` |
| `PUT DELETE` | `/api/reports/{id}/status`, `/api/reports/{id}` | `client_admin` |
| `GET POST PUT DELETE` | `/api/users` | `client_admin` |
| `POST GET` | `/api/chat/generate`, `/api/chat/history` | any signed-in user |

---

## 7. The AI assistant (optional)

`docker compose up -d` starts it along with everything else. The image is ~3.2 GB and
the `gemma3:1b` model another ~800 MB, which the container pulls itself the first
time it starts. Follow it with:

```bash
docker compose logs -f ollama
```

Until the model is ready, `POST /api/chat/generate` still answers **200** with a
message saying the assistant is unreachable — it never fails the request. The same
applies if you chose not to start Ollama at all.

To start the stack without it:

```bash
docker compose up -d mysql keycloak-db keycloak adminer
```

---

## 8. Browsing the databases

Adminer at <http://localhost:8087>:

| Field | API database | Keycloak database |
|---|---|---|
| System | MySQL | MySQL |
| Server | `mysql` | `keycloak-db` |
| Username | `root` | `root` |
| Password | `root` | `root` |
| Database | `petsdb` | `keycloak` |

---

## 9. Configuration

Nothing needs changing. Every value in `src/main/resources/application.yml` has a
default matching `docker-compose.yml`, and can be overridden with an environment
variable:

| Variable | Default | What it is |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/petsdb?...` | API database |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / `root` | its credentials |
| `KEYCLOAK_ISSUER_URI` | `http://localhost:8080/realms/pet` | must match the token's `iss` |
| `KEYCLOAK_JWK_SET_URI` | same host, `/protocol/openid-connect/certs` | where the public keys are fetched |
| `KEYCLOAK_RESOURCE_ID` | `pet-hug-front` | the client whose roles are read |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | the assistant |
| `OLLAMA_MODEL` | `gemma3:1b` | the model |

Keycloak's hostname is pinned to `http://localhost:8080` in `docker-compose.yml`
(`KC_HOSTNAME`). That is what makes the `iss` claim stable whatever address the
browser used. **If you change the Keycloak port, change `KC_HOSTNAME` and
`KEYCLOAK_ISSUER_URI` together**, or every token will be rejected.

---

## 10. Project layout

```
src/main/java/com/oolab/PET/
├── PetApplication.java
├── config/        OpenAPI, CORS, demo data seeder
├── controller/    REST endpoints, role rules
├── enity/         JPA entities: Pet, Blog, Comment, Report, Chat, Message, User
├── enums/
├── exception/     ResourceNotFoundException -> 404
├── model/         response payloads
├── repository/    Spring Data JPA
├── security/      SecurityConfig, JwtAuthConverter
└── service/       business logic (+ impl/)
```

`keycloak/realm-pet.json` holds the realm: client, roles and the two test accounts.
It is imported automatically the first time Keycloak starts, and skipped afterwards.
To force a reimport, wipe the volume:

```bash
docker compose down -v
```

---

## 11. Verifying the whole thing

A quick manual round-trip, with the infrastructure and the API running.

Get a token for each account:

```bash
curl -s -X POST http://localhost:8080/realms/pet/protocol/openid-connect/token -d "client_id=pet-hug-front" -d "grant_type=password" -d "username=admin" -d "password=admin"
```

```bash
curl -s -X POST http://localhost:8080/realms/pet/protocol/openid-connect/token -d "client_id=pet-hug-front" -d "grant_type=password" -d "username=user" -d "password=user"
```

Then check that the two behave differently — the same call must answer 200 for the
administrator and 403 for the standard user:

```bash
curl -s -o /dev/null -w "%{http_code}
" http://localhost:8086/api/reports -H "Authorization: Bearer <admin-token>"
```

```bash
curl -s -o /dev/null -w "%{http_code}
" http://localhost:8086/api/reports -H "Authorization: Bearer <user-token>"
```

And that an anonymous call is rejected:

```bash
curl -s -o /dev/null -w "%{http_code}
" http://localhost:8086/api/pets
```

Expected: `200`, `403`, `401`.

---

## 12. Troubleshooting

| Symptom | Fix |
|---|---|
| `ClassNotFoundException: jakarta.servlet.Filter` | stale IDE classpath: reload the Maven project. `spring-boot-starter-tomcat` must **not** be `provided`, otherwise Tomcat is dropped and Spring Boot starts a reactive context. |
| `Access denied for user 'root'` | the database password is `root`; start MySQL from this compose file, or set `DB_PASSWORD`. |
| `Unable to determine Dialect without JDBC metadata` | the API could not reach MySQL at all. `docker compose ps` — is `mysql` healthy and published on 3306? |
| 401 on every call | missing or expired token; get a new one (they last 30 minutes). |
| 403 on a call that should work | you are signed in as `user` on an administrator route. Use `admin`. |
| Keycloak does not answer | first start, it is migrating its database: `docker compose logs -f keycloak` |
| `port is already allocated` | 3306, 8080 or 8087 is taken; change the left-hand side in `docker-compose.yml` |
| Containers `Up` but `localhost` refuses | Docker Desktop port forwarding dropped, usually after a VPN change. Restart Docker Desktop. |
| Start over from scratch | `docker compose down -v` then `docker compose up -d` |
