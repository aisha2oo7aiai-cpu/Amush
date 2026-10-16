# Amush

Amush is a mental-wellness companion for students. This repository contains the website (HTML, CSS and JavaScript) and the backend (Java, Spring Boot).

Each student gets their own account and profile. Every request is tied to the logged-in student, so nobody can see another student's data.

## Project files

| File | What it is |
|---|---|
| `Amush.html`, `Amush.css`, `script.js` | Main page of the website |
| `session.html`, `session.css`, `session.js` | Wellness session / chat page |
| `terms.js` | Terms and consent logic |
| `pom.xml` | Maven build file for the Java backend |
| `src/` | Backend source code (controllers, services, config) |

## Run the backend on your Mac

1. Install the tools (once):
   ```
   brew install openjdk@21 maven
   ```
   Then run the PATH line Homebrew prints at the end. Check with `java -version` and `mvn -v`.
2. Open this folder in VS Code (File > Open Folder).
3. In the VS Code terminal (Ctrl+`):
   ```
   mvn spring-boot:run
   ```
   The first run downloads libraries, so wait a few minutes.
4. Open http://localhost:8080/api/health in your browser. You should see `{"status":"ok"}`.

Leave the terminal running. Closing it stops the backend.

The default database is a local file database saved in the `data` folder. No setup needed. The `data` folder is listed in `.gitignore` and must never be uploaded to GitHub.

## Run the website

Serve the frontend files on port 5500 (for example with the VS Code "Live Server" extension) and open `Amush.html`. Make sure the backend URL in the frontend JavaScript (`script.js` and `session.js`) points to your backend, for example `http://localhost:8080`.

## Endpoints

Send the login token on every request except register, login and health:
`Authorization: Bearer <token>`

| Method | Path | What it does |
|---|---|---|
| GET | /api/health | Checks the server is awake |
| POST | /api/auth/register | Body: `{name, email, password}` (password 8+ chars). Returns `{token, name}` |
| POST | /api/auth/login | Body: `{email, password}`. Returns `{token, name}` |
| GET | /api/profile/me | Your profile |
| PUT | /api/profile/me | Body: `{college, yearOfStudy, preferences}` |
| POST | /api/chat | Body: `{message, sessionId}` (sessionId is null for a new chat). Returns `{sessionId, reply, crisis, helplines}` |
| GET | /api/chat/sessions | Your list of conversations |
| GET | /api/chat/sessions/{id} | Messages of one of your conversations |
| DELETE | /api/chat/sessions/{id} | Deletes one of your conversations |

Status codes: 400 bad input, 401 wrong password or bad token, 404 not found (or not yours), 409 email already registered.

## Quick test without the website

```
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"name":"Asha","email":"asha@test.com","password":"password123"}'
```
Copy the token from the answer, then:
```
curl -X POST http://localhost:8080/api/chat -H "Content-Type: application/json" -H "Authorization: Bearer PASTE_TOKEN" -d '{"message":"I am stressed about exams","sessionId":null}'
```

Data separation demo: register two students, then open one student's session id with the other student's token. You get a 404, which shows the data is separate.

## AI model (Gemma)

The chat reply comes from Google's Gemma model, called from the backend in `service/AiService.java`. The website never talks to the model directly.

- The API key is kept in a **server-side environment variable** and is never placed in any HTML or JavaScript file.
- Set the key before starting the backend (use the variable name that `AiService.java` reads), for example:
  ```
  export GEMMA_API_KEY=your-key-here
  ```
- Never commit the key to GitHub.

## Privacy

- Accounts are protected by a password and a login token. Each student can only read and delete their own conversations.
- Conversations are stored in the backend database so a student can return to them, and a student can delete any conversation with `DELETE /api/chat/sessions/{id}`.
- Messages are sent to the AI model to generate a reply.
- Amush is a support tool, not a replacement for a doctor, counsellor or therapist.

## CORS: letting your website talk to the backend

The browser blocks calls from a website unless the backend allows that website's address. By default these are allowed:
`http://localhost:5500` and `http://127.0.0.1:5500`

For your deployed website, set the `CORS_ORIGINS` environment variable (comma separated), for example:
```
CORS_ORIGINS=https://your-site.lovable.app
```

## Switch to Supabase (PostgreSQL)

Set three environment variables before starting:
```
DB_URL=jdbc:postgresql://HOST:5432/postgres
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```
Copy the host, user and password from your Supabase project's database connection settings. The tables are created automatically.

## Deploy (Render or Railway)

- Build command: `mvn -DskipTests package`
- Start command: `java -jar target/amush-backend-0.0.1.jar` (check that this filename matches the name and version in `pom.xml`)
- Set `CORS_ORIGINS`, the AI key variable, and the three database variables if you use Supabase.
- The server reads the `PORT` variable automatically.
- Then put your deployed backend URL in the backend URL setting of your frontend JavaScript (`script.js` and `session.js`).

## Crisis detection

If a message contains self-harm words, the AI is skipped and a fixed supportive reply is returned with `crisis: true` and the helplines. This is a keyword check. It can miss indirect wording and can flag harmless sentences, so it is a first safety net, not a complete solution. Verify the helpline numbers in `CrisisService.java` against official sources before any demo or release.

## Where to change things

- `service/AiService.java`: the call to the Gemma model. Keep the API key in an environment variable on the server.
- `service/CrisisService.java`: keywords, helplines and the supportive message.
- `src/main/resources/application.properties`: database and CORS settings.
