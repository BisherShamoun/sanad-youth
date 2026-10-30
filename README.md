# Sanad Youth Backend

A REST API for **Sanad Youth**, a platform for managing youth training
programs, applications, announcements, and learning materials.

The project is built with **NestJS**, **Prisma ORM**, and
**PostgreSQL**. It provides backend APIs only; there is no frontend
included in this repository.


## Postman Collection

[Download Postman Collection](./Sanad_Youth_Postman_Collection.json)

## User Roles

  -----------------------------------------------------------------------
  Role                                Main permissions
  ----------------------------------- -----------------------------------
  `USER`                              Register, log in, browse published
                                      programs, apply, cancel their own
                                      pending application, view their
                                      applications and eligible
                                      announcements/materials.

  `SUPERVISOR`                        Create and manage their own
                                      programs, add program sessions,
                                      view applications for their
                                      programs, publish announcements for
                                      their programs, and upload program
                                      materials.

  `ADMIN`                             Create supervisor accounts, review
                                      applications, publish general
                                      announcements, and perform
                                      administrative actions where
                                      allowed by the endpoint.
  -----------------------------------------------------------------------

A public registration request always creates a `USER` account. The role
cannot be chosen through `/auth/register`.

## Use-Case Diagram

The diagram below summarizes the main interactions between the three
roles and the API.

``` mermaid
flowchart LR
    USER[User]
    SUP[Supervisor]
    ADMIN[Admin]

    subgraph API[Sanad Youth Backend]
        REGISTER([Register / Log in])
        BROWSE([Browse published programs])
        APPLY([Apply for a program])
        TRACK([View or cancel own application])
        VIEWM([View eligible materials])
        CREATEP([Create / update own programs])
        SESSION([Add program sessions])
        VIEWAPP([View applications for own programs])
        ANNOUNCEP([Publish program announcements])
        UPLOAD([Upload program materials])
        CREATE_SUP([Create supervisor accounts])
        REVIEW([Accept / reject applications])
        ANNOUNCEG([Publish general announcements])
    end

    USER --> REGISTER
    USER --> BROWSE
    USER --> APPLY
    USER --> TRACK
    USER --> VIEWM

    SUP --> REGISTER
    SUP --> CREATEP
    SUP --> SESSION
    SUP --> VIEWAPP
    SUP --> ANNOUNCEP
    SUP --> UPLOAD

    ADMIN --> REGISTER
    ADMIN --> CREATE_SUP
    ADMIN --> REVIEW
    ADMIN --> ANNOUNCEG
    ADMIN --> UPLOAD
```

> This is a high-level overview of the implemented role-based
> functionality, not a substitute for endpoint-level authorization
> checks.

## Database ERD

The following ERD is based on the Prisma schema in
`prisma/schema.prisma`.

``` mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ PROGRAM : supervises
    USER ||--o{ APPLICATION : submits
    USER ||--o{ ANNOUNCEMENT : authors
    PROGRAM ||--o{ PROGRAM_SESSION : contains
    PROGRAM ||--o{ APPLICATION : receives
    PROGRAM ||--o{ ANNOUNCEMENT : may_have
    PROGRAM ||--o{ MATERIAL : provides

    USER {
        int id PK
        string firstName
        string lastName
        string email UK
        string username UK
        string password
        UserRole role
        datetime createdAt
        datetime updatedAt
    }

    SESSION {
        int id PK
        int userId FK
        string refreshTokenHash
        datetime expiresAt
        datetime revokedAt
        datetime createdAt
    }

    PROGRAM {
        int id PK
        string title
        string description
        string imagePath
        int capacity
        int availableSeats
        ProgramStatus status
        int supervisorId FK
        datetime createdAt
        datetime updatedAt
    }

    PROGRAM_SESSION {
        int id PK
        int programId FK
        datetime startsAt
        datetime endsAt
        string location
        string meetingUrl
        datetime createdAt
    }

    APPLICATION {
        int id PK
        int userId FK
        int programId FK
        ApplicationStatus status
        string cvPath
        int reviewedBy
        datetime reviewedAt
        string reviewNote
        datetime createdAt
        datetime updatedAt
    }

    ANNOUNCEMENT {
        int id PK
        string title
        string body
        AnnouncementScope scope
        int authorId FK
        int programId FK
        datetime createdAt
        datetime updatedAt
    }

    MATERIAL {
        int id PK
        string title
        string filePath
        string mimeType
        int size
        int programId FK
        datetime createdAt
    }
```

### Relationship summary

-   One `User` can have many login `Session` records.
-   One supervisor (`User`) can supervise many `Program` records.
-   A `Program` can contain multiple `ProgramSession` records.
-   A user can apply to multiple programs, and each program can receive
    applications from multiple users.
-   A database constraint allows only one application per user per
    program (`userId + programId`).
-   A user can author multiple announcements. An announcement can be
    general or linked to a program.
-   A program can provide multiple learning `Material` files.

### Important enums

-   `UserRole`: `USER`, `SUPERVISOR`, `ADMIN`
-   `ProgramStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
-   `ApplicationStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`
-   `AnnouncementScope`: `GENERAL`, `PROGRAM`

## Project Structure

``` text
src/
├── auth/             # Registration, login, JWT strategy and guards
├── users/            # User profile and supervisor account creation
├── programs/         # Program listing, details, updates and sessions
├── applications/     # Apply, view, cancel and review applications
├── announcements/    # List and create announcements
├── materials/        # Upload, list and download learning materials
├── prisma/           # Prisma service and module
├── common/
│   ├── decorators/   # Current-user and role decorators
│   └── guards/       # Role-based authorization guard
├── app.module.ts     # Root module
└── main.ts            # API bootstrap, /api prefix and validation

prisma/
└── schema.prisma     # Database models, relationships and enums

uploads/              # Local storage for uploaded files
.env.example          # Example environment configuration
docker-compose.yml    # Local PostgreSQL service
```

## Getting Started

### Prerequisites

Install:

-   Node.js 20 or newer
-   npm
-   Git (optional, for cloning the repository)

### 1. Get the project

``` bash
git clone https://github.com/BisherShamoun/sanad-youth
cd sanad-youth-backend
```

If you already have the project on your computer, open a terminal in its
root directory.

### 2. Configure environment variables

Copy `.env.example` to `.env`.

**Windows PowerShell:**

``` powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

``` bash
cp .env.example .env
```

Open `.env` and check the database URL and JWT secret. Do not commit
`.env` to GitHub.


## Environment Variables

  ---------------------------------------------------------------------------------------------------------------------------
  Variable                Purpose                 Example
  ----------------------- ----------------------- ---------------------------------------------------------------------------
  `PORT`                  Port used by the API    `3000`

  `DATABASE_URL`          PostgreSQL connection   `postgresql://postgres:postgres@localhost:5432/sanad_youth?schema=public`
                          string                  

  `JWT_SECRET`            Secret used to sign     Replace with a long random secret
                          JWTs                    

  `UPLOAD_DIR`            Local directory for     `uploads`
                          uploaded files          

  `MAX_FILE_SIZE_MB`      CV upload size setting  `5`
                          in the example          
                          environment             
  ---------------------------------------------------------------------------------------------------------------------------

The Docker Compose credentials are for local development only. Use
strong credentials and secrets outside local development.

## API Endpoints

All routes use the `/api` prefix. For example, `POST /auth/login` means
`POST http://localhost:3000/api/auth/login`.

### Authentication

  Method   Endpoint           Access          Purpose
  -------- ------------------ --------------- --------------------------------
  `POST`   `/auth/register`   Public          Create a `USER` account
  `POST`   `/auth/login`      Public          Log in using username or email
  `GET`    `/auth/profile`    Authenticated   Get the current JWT user
  `POST`   `/auth/logout`     Authenticated   Revoke the current session

Login JSON example:

``` json
{
  "identifier": "youth1@example.com",
  "password": "ChangeMe123!"
}
```

Use `identifier` for either the account's username or email. The API
does not accept `email` as the login field name.

Registration JSON example:

``` json
{
  "firstName": "Youth",
  "lastName": "User",
  "email": "youth1@example.com",
  "username": "youth1",
  "password": "ChangeMe123!"
}
```

### Users

  Method   Endpoint               Access          Purpose
  -------- ---------------------- --------------- --------------------------------
  `GET`    `/users/me`            Authenticated   Get the current user's profile
  `POST`   `/users/supervisors`   Admin           Create a supervisor account

### Programs

  --------------------------------------------------------------------------------
  Method            Endpoint                   Access            Purpose
  ----------------- -------------------------- ----------------- -----------------
  `GET`             `/programs`                Public            List published
                                                                 programs;
                                                                 supports
                                                                 pagination and
                                                                 search

  `GET`             `/programs/:id`            Public            Get published
                                                                 program details
                                                                 and sessions

  `POST`            `/programs`                Supervisor        Create a program

  `PATCH`           `/programs/:id`            Supervisor        Update a program,
                                                                 subject to
                                                                 ownership rules

  `POST`            `/programs/:id/sessions`   Supervisor        Add a session to
                                                                 a program
  --------------------------------------------------------------------------------

List query parameters include `page`, `limit`, and `search`. Example:

``` text
GET /api/programs?page=1&limit=10&search=programming
```

### Applications

  -------------------------------------------------------------------------------------------
  Method            Endpoint                             Access             Purpose
  ----------------- ------------------------------------ ------------------ -----------------
  `POST`            `/applications/:programId`           Authenticated      Apply to a
                                                                            program; optional
                                                                            `cv` file

  `GET`             `/applications/mine`                 Authenticated      List the current
                                                                            user's
                                                                            applications

  `PATCH`           `/applications/:id/cancel`           Application owner  Cancel an
                                                                            eligible
                                                                            application

  `GET`             `/applications/program/:programId`   Supervisor/Admin   List applications
                                                                            for a program,
                                                                            subject to access
                                                                            rules

  `PATCH`           `/applications/:id/review`           Admin              Accept or reject
                                                                            a pending
                                                                            application
  -------------------------------------------------------------------------------------------

To attach a CV, use `multipart/form-data` with a file field named `cv`.

### Announcements

  -------------------------------------------------------------------------
  Method            Endpoint           Access             Purpose
  ----------------- ------------------ ------------------ -----------------
  `GET`             `/announcements`   Authenticated      List
                                                          announcements
                                                          available to the
                                                          user

  `POST`            `/announcements`   Supervisor/Admin   Create a
                                                          permitted program
                                                          or general
                                                          announcement
  -------------------------------------------------------------------------

### Learning materials

  --------------------------------------------------------------------------------------------------------------
  Method            Endpoint                                                Access             Purpose
  ----------------- ------------------------------------------------------- ------------------ -----------------
  `GET`             `/programs/:programId/materials`                        Authenticated,     List available
                                                                            eligibility        materials
                                                                            checked            

  `GET`             `/programs/:programId/materials/:materialId/download`   Authenticated,     Download a
                                                                            eligibility        material
                                                                            checked            

  `POST`            `/programs/:programId/materials`                        Supervisor/Admin   Upload a program
                                                                                               material, subject
                                                                                               to access rules
  --------------------------------------------------------------------------------------------------------------

For uploads, use `multipart/form-data`. The material upload uses a file
field named `file` and a text field named `title`.

> Authorization is also checked inside the application services where
> required. A valid JWT alone does not grant access to every program or
> application.

## Authentication

1.  Register a user with `POST /api/auth/register`.
2.  Log in with `POST /api/auth/login`.
3.  Copy the returned `accessToken`.
4.  For protected endpoints, send this header:

``` text
Authorization: Bearer <accessToken>
```

5.  Call `POST /api/auth/logout` to revoke the current session.

The API hashes user passwords with bcrypt. The database stores a hash of
the refresh token in the session record, not the raw refresh token.

**Current limitation:** the login response includes a refresh token, but
a refresh-token rotation endpoint is not implemented in this version.

## File Uploads

-   **Application CV:** PDF, DOC, or DOCX; maximum 5 MB.
-   **Program materials:** PDF, DOC, DOCX, PPT, PPTX, or ZIP; maximum 20
    MB.
-   Uploaded files are stored locally in the directory configured by
    `UPLOAD_DIR` (default: `uploads`).

For production deployment, move uploads to private object storage and
keep downloads protected by authorization checks. Do not expose private
uploads as a public static directory.

## Validation and Business Rules

-   The API uses a global validation pipe with `whitelist`,
    `forbidNonWhitelisted`, and `transform` enabled.
-   Unknown DTO properties are rejected. For example, login requires
    `identifier`, not `email`.
-   Public registration cannot assign a privileged role.
-   Applications are limited to one per user per program by a database
    unique constraint.
-   Applying to a program checks availability and uses a database
    transaction to protect seat allocation from concurrent requests.
-   Program sessions include start/end times and can include a physical
    location or meeting URL.
-   Protected routes require a valid JWT; role- and ownership-based
    rules apply to privileged actions.

## Testing with Postman

1.  Start PostgreSQL and the NestJS server.
2.  Set a Postman environment variable:
    -   `baseUrl` = `http://localhost:3000/api`
3.  Register a test account with `POST {{baseUrl}}/auth/register`.
4.  Log in with `POST {{baseUrl}}/auth/login` and save `accessToken`.
5.  For protected requests, choose **Authorization → Bearer Token** and
    paste the access token.
6.  Test program browsing, applications, announcements, and materials
    according to the role and ownership requirements.

Example login request:

``` http
POST {{baseUrl}}/auth/login
Content-Type: application/json
```

``` json
{
  "identifier": "youth1@example.com",
  "password": "ChangeMe123!"
}
```

If you use a Postman collection, review its base URL and ensure it does
not accidentally append `/api` twice.



## License

No license has been specified yet. Add a `LICENSE` file if you intend to
publish the project for reuse.
