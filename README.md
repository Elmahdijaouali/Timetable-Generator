# Timetable Generator

This project is a digital timetable and scheduling system developed for **ISTA CITE Dé l'Air** (Institut Supérieur des Technologies Appliquées )

## Features
- **Administrateur Authentication**: Users can create an account and log in to access their timetables.
- **Timetable Creation**: Users can create and manage their timetables, including adding, editing
- **Customizable Timetables**: Users can customize their timetables by adding or removing events, setting reminders


## Technologies Used

- **Frontend**: Electron.js (React js TypeScript) / tailwindcss 
- **Backend**: Node.js (express js) / ORM Sequelize
- **Database**: SqlLite
- **API**: RESTful API
- **Authentication**: JWT (JSON Web Tokens)

---

## Building a Single .exe Installer (Electron + Express for Windows)

This project is already configured to package both the Electron (React) frontend and Express backend into a single Windows installer.

### **Step-by-Step Build Instructions**

1. **Install Dependencies**

   Open a terminal and run:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. **Build the Windows Installer**

   In the `frontend` directory, run:
   ```bash
   npm run build:win
   ```
   This will:
   - Build the React frontend
   - Package the Electron app
   - Include the backend folder
   - Create a Windows installer `.exe` in `frontend/release/`

3. **Find Your Installer**

   After the build completes, look in:
   ```
   frontend/release/
   ```
   You should see a file like:
   ```
   TimetableGenerator-Windows-1.0.0-Setup.exe
   ```

4. **Distribute and Install**

   - Distribute this `.exe` to users.
   - When they run it, it will install your app with both Electron and Express backend included.

---

**No need to merge package.json files. Your current structure is correct!**

For advanced packaging options, see `frontend/electron-builder.json5`.


