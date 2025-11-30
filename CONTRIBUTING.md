# Development Workflow

This document outlines the standard workflow for developing, testing, and deploying the TwoHearts application.

## 1. The Three Environments

To avoid confusion, it is important to understand the role of each environment:

1.  **Local (Your Computer)**: This is your **Kitchen**.
    *   **Purpose**: Coding, debugging, and testing.
    *   **Action**: You make all code changes here. You verify them using `npm run dev` or `npm run preview`.
    *   **Status**: This is the *only* place where you edit code.

2.  **Git (GitHub)**: This is your **Recipe Book**.
    *   **Purpose**: Backup, version control, and collaboration.
    *   **Action**: Once your local code is working, you "push" it here.
    *   **Status**: This is the "Source of Truth". It should always contain clean, working code.

3.  **Server (Production)**: This is the **Restaurant**.
    *   **Purpose**: Serving the application to real users.
    *   **Action**: You "pull" code from GitHub to here (or deploy built artifacts).
    *   **Status**: You *never* edit code directly here. It only runs what is in GitHub.

---

## 2. Step-by-Step Workflow

Follow this cycle for every new feature or fix:

### Step 1: Start Locally
1.  **Pull latest changes**: `git checkout master && git pull origin master`
2.  **Create a branch**: `git checkout -b feature/my-new-feature`
3.  **Code**: Make your changes in VS Code.
4.  **Test**: Run `npm test` and verify in your browser (`npm run dev`).

### Step 2: Save to Git
1.  **Stage changes**: `git add .`
2.  **Commit**: `git commit -m "Add my new feature"`
3.  **Push**: `git push origin feature/my-new-feature`
4.  **Merge**: Create a Pull Request on GitHub and merge it into `master`.

### Step 3: Deploy to Server
1.  **SSH into Server**: `ssh server2`
2.  **Navigate**: `cd /var/www/twohearts`
3.  **Update**: `git pull origin master`
4.  **Install/Build**:
    *   `npm install` (if dependencies changed)
    *   `npm run build` (to update frontend)
    *   `pm2 restart twohearts` (to update backend)

---

## 3. Key Commands

| Action | Command | Where to Run |
| :--- | :--- | :--- |
| **Start Dev Server** | `npm run dev` | Local |
| **Run Tests** | `npm test` | Local |
| **Build Frontend** | `npm run build` | Local / Server |
| **Check Status** | `git status` | Local |
| **Deploy** | `git pull origin master` | Server |
