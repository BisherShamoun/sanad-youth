# Sanad Youth API

واجهة خلفية (Backend API) لمنصة Sanad Youth لإدارة البرامج التدريبية وطلبات التسجيل والجلسات والمواد التعليمية والإعلانات، باستخدام NestJS وTypeScript وPrisma.

## Features

- JWT Authentication and Authorization.
- Role-based access control: `USER`, `SUPERVISOR`, `ADMIN`.
- Browse published programs, search, and pagination.
- Create and update programs and training sessions.
- Submit applications, track application status, and cancel applications.
- Review applications by administrators.
- Upload CVs and program materials.
- Download program materials subject to access permissions.
- Caching for frequently accessed program listings, when enabled.
- File size and extension validation.

## Technologies

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL (حسب إعداد المشروع)
- JWT, Guards, and Custom Decorators
- Multer
- Postman

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```



3. Generate the Prisma client and apply migrations according to the Prisma version and configuration used by the project.

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

   If the project uses Prisma 7 or a custom Prisma configuration, follow its specific setup instructions.

4. Start the development server:

   ```bash
   npm run start:dev
   ```

The default local URL is usually `http://localhost:3000`. If a global prefix such as `api` is configured in `main.ts`, include it in the request URLs.

## User Roles

| Role | Responsibilities |
|---|---|
| `USER` | Browse programs, submit applications, track and cancel personal applications. |
| `SUPERVISOR` | Manage assigned programs, sessions, and materials according to permissions. |
| `ADMIN` | Review applications and manage platform resources according to permissions. |

## API Endpoints

The routes below are based on the controllers shared during development. Verify them against the actual controllers and DTOs.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a user; verify the DTO fields. |
| POST | `/auth/login` | Authenticate a user; verify the login DTO fields. |

### Programs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/programs` | List published programs with search and pagination. |
| GET | `/programs/:programId` | Get a published program. |
| POST | `/programs` | Create a program. |
| PATCH | `/programs/:programId` | Update a program according to permissions. |
| POST | `/programs/:programId/sessions` | Suggested route for adding a session; verify the actual controller. |

Example query parameters:

```text
?page=1&limit=10&search=backend&sortBy=createdAt&sortOrder=desc
```

### Applications

| Method | Endpoint | Description |
|---|---|---|
| POST | `/applications/:programId` | Apply to a program; `cv` is optional in the shared controller. |
| GET | `/applications/mine` | List the current user's applications. |
| PATCH | `/applications/:id/cancel` | Cancel an application. |
| GET | `/applications/program/:programId` | List applications for a program, subject to permissions. |
| PATCH | `/applications/:id/review` | Review an application; restricted to `ADMIN` in the shared controller. |

Check `ReviewApplicationDto` for the exact fields and accepted status values.

### Materials

| Method | Endpoint | Description |
|---|---|---|
| GET | `/programs/:programId/materials` | List program materials. |
| POST | `/programs/:programId/materials` | Upload a material using `title` and `file` form fields. |
| GET | `/programs/:programId/materials/:materialId/download` | Download a material subject to access checks. |

## File Uploads

### CV Uploads

- Form field: `cv`
- Allowed extensions: `.pdf`, `.doc`, `.docx`
- Maximum size: 5 MB
- Storage directory: `UPLOAD_DIR`, or `uploads` by default

### Program Materials

- Form fields: `title` and `file`
- Allowed extensions: `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.zip`
- Maximum size: 20 MB
- Upload permissions: `SUPERVISOR` and `ADMIN` in the shared controller

Extension checks alone do not guarantee that a file's actual content is safe. Validate file content before deploying to production.

## Testing with Postman

1. Import `Sanad_Youth_Postman_Collection.json` if available.
2. Configure `baseUrl` to match the running server and any global route prefix.
3. Register a user and log in.
4. Send the JWT with protected requests:

   ```http
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

5. Test each role: `USER`, `SUPERVISOR`, and `ADMIN`.
6. Test valid and invalid file uploads.
7. Test duplicate applications, full programs, cancellation, and access restrictions.

Some requests in the Postman collection may need to be adjusted to match the project's actual controllers and DTOs.

## Important Business Rules

- Prevent applications from exceeding a program's capacity.
- Prevent the same user from applying to the same program more than once.
- Restore a reserved seat when an application is rejected or cancelled, according to the application's state and business rules.
- Handle concurrent applications for the last available seat using database transactions and appropriate concurrency protection.
- Users should access only their own applications.
- Supervisors should manage only their assigned programs.
- Never expose passwords or sensitive information in API responses.

These are project requirements; verify their implementation in the services, Prisma transactions, and tests.

## Useful Commands

```bash
npm run start:dev
npm run build
npm test
```

Check `package.json` to confirm which scripts are available.

## Security Notes

- Never commit `.env` or production secrets to Git.
- Validate request data using DTOs and validation pipes.
- Configure rate limiting for authentication and sensitive endpoints.
- Verify authorization before reading, modifying, or downloading
