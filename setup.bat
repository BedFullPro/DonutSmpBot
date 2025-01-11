@echo off
:: Clear the terminal screen at the start
cls

:: Set the text color to green for the title
color 0A

:: Display title
echo ================================
echo Setting Up the Node.js Server
echo ================================

:: Set the text color to light blue for instructions
color 0A

echo 1. Create a Node.js Server on Pterodactyl
echo    - Log in to your Pterodactyl Panel (PylexNodes).
echo    - Create a new Node.js server by following the panel's standard procedure for creating a server.
echo      Make sure to choose the appropriate Node.js version (the one required by your setup).
echo.

echo 2. Upload Project Files
echo    - Upload all the files from your project directory to the newly created server on Pterodactyl,
echo      excluding the node_modules folder.
echo      This ensures you're not uploading unnecessary files and keeps the server clean.
echo.

echo 3. Update Email in Settings
echo    - Open the settings.json file within your project directory.
echo    - Update the email address field with your own email address to ensure the server notifications are
echo      sent to the right account.
echo.

echo 4. Configure Startup Settings
echo    - Navigate to the "Startup" tab in your Pterodactyl panel.
echo    - Change the "Docker Image" setting:
echo      - Replace xxxx/xxxx/xxxx/nodejs_19 with xxxx/xxxx/xxxx:nodejs_21 (or the appropriate Node.js version).
echo    - Scroll down to the "Js File" setting and change it from index.js to bot.js to ensure the correct entry
echo      point for your bot.
echo    - Under "Additional Node Packages," add the following dependencies:
echo      npm install utils-merge mineflayer express log4js minecraft-data mineflayer-pathfinder
echo    - This ensures the necessary Node.js packages are installed for your bot to run properly.
echo.

echo 5. Create a User
echo    - Go to the "Users" section of the panel and click on "New User."
echo    - Add the email justinminecraftxbox@gmail.com and grant all permissions for the user to manage the server.
echo.

echo 6. Disable "Public Chat" in Minecraft
echo    - Open Minecraft on your PC and log in to the DonutSmp.net server.
echo    - Type /settings in the in-game chat to open the settings menu.
echo    - Locate the Public Chat setting and disable it to ensure you don't get spammed by public messages.
echo.

echo 7. Start the Server
echo    - Start the server from the Pterodactyl panel.
echo    - Wait for all the necessary packages to install. If you encounter a "module not found" error, simply
echo      delete the node_modules folder and restart the installation process.
echo.

echo 8. Sign in with Microsoft
echo    - After starting the server, you’ll be prompted to sign in with your Microsoft account.
echo    - Follow the on-screen instructions to authenticate and log in successfully.
echo.

echo 9. Run the AFK Command
echo    - In the Pterodactyl console, enter the following command to set your AFK status:
echo      /afk [number between 1 and 18]
echo    - If the server is full, you may see the message: "Unfortunately, this server is full." In that case,
echo      try using a different number until you find an available server.
echo    - If there is no response within 5 seconds, use /whereami to confirm your AFK server number.
echo      - If the response shows goliath-limbo as your AFK server number, you're all set!
echo.

echo 10. Enjoy!
echo    - Your server is now up and running. Enjoy the Bot playing on your favorite Minecraft server!
echo.

:: Set text color to light green for final message
color 0A

echo ================================
echo Setup Complete! Enjoy the Server!
echo ================================

:: Pause to allow the user to read the final message
pause
