# PetHug

Pet adoption platform: a **Spring Boot 3.4** REST API and an **Angular 19** client,
secured with **Keycloak**, stored in **MySQL**, with an AI chat assistant served by
**Ollama**.

| Folder | What it is |
|---|---|
| [`projet-spring/`](projet-spring/) | the REST API, the Docker stack and the Keycloak realm |
| [`projet-angular/`](projet-angular/) | the web client |

**Setup guide: [projet-spring/README.md](projet-spring/README.md)** — it walks through
the whole backend step by step and is self-contained.

---

## Run it

Only prerequisites: **Docker**, a **JDK 17+**, and **Node 20+** for the client.

```bash
cd projet-spring && docker compose up -d
```

That starts the API database, Keycloak with its own database, Adminer and the AI model.
Then, in a second terminal:

```bash
cd projet-spring && ./mvnw spring-boot:run
```

The API answers on <http://localhost:8086> (Swagger at `/swagger-ui.html`).
Keycloak is on <http://localhost:8080>, Adminer on <http://localhost:8087>.

For the web client:

```bash
cd projet-angular && npm install && npm start
```

<http://localhost:4200>, proxying `/api` to the API — no CORS involved.

## Accounts

Created automatically when Keycloak first starts. They behave differently, which is the
point of the authorization layer:

| Account | Password | Can do |
|---|---|---|
| `admin` | `admin` | everything: manage listings, moderate articles, handle reports |
| `user` | `user` | browse, publish an article (left pending), like, comment, report |

A standard user gets **403** on administration routes. Full matrix in the
[backend README](projet-spring/README.md#5-what-each-role-can-do).

> All credentials in this repository are local development defaults. Nothing here is
> a real secret.

## Features

- Pet listings and blog articles, with likes and comments
- Moderation workflow: articles are published as `pending` and approved by an admin
- Reporting of listings and articles, with a moderation queue
- AI chat assistant, which degrades gracefully when the model is unavailable
- OAuth2 / OIDC with PKCE, role-based authorization enforced in the API

## Architecture

```
          browser
             |
    localhost:4200  (Angular, proxies /api)
             |
             |-------------------> Keycloak  :8080  ──→  MySQL (keycloak)
             |                     realm "pet", OIDC + PKCE
             v
    Spring Boot API :8086  ──→  MySQL (petsdb)
             |
             └────────────────→  Ollama :11434
```

The browser only ever talks to one origin. The Keycloak token is attached by an HTTP
interceptor and validated by the API against the realm's public keys.
