# Amush

A mental-wellness companion for students.

## Live site

https://amush-studio.ai.studio

## How to install

### 1. Install the tools (once)

**Mac**
```
brew install openjdk@21 maven
```

**Windows**
```
winget install EclipseAdoptium.Temurin.21.JDK
winget install Apache.Maven
```
If `winget install Apache.Maven` does not work, download Maven from https://maven.apache.org/download.cgi, unzip it, and add its `bin` folder to your PATH.

Restart your terminal, then check:
```
java -version
mvn -v
```

### 2. Run it

1. Open the project folder in VS Code.
2. Open the terminal (Ctrl + `) and run:
   ```
   mvn spring-boot:run
   ```
3. Open http://localhost:8080/api/health. You should see `{"status":"ok"}`.
4. Open `Amush.html` in your browser (or use the VS Code "Live Server" extension).
