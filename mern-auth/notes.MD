### Deployment Notes
1. ssh to your instance
2. Create a new user to avoid using root user ```adduser George```
3. Make the created user an admin to have sudo rights ```usermod -aG sudo George```
4. Confirm if the user really has sudo rights ```groups George``` It should print three groups i.e. George sudo users
5. Login as the new user/Switch to the created user ```su - George```
6. Install nodejs. Its better to install using nvm first.
7. Installing and running using PM2 ```npm install -g pm2```
   - start the Application ```pm2 start backend/server.js```
   - Enable firewall ```sudo ufw enable``` This blocks all ports. 
   - Enable HTTP, SSH and HTTPS ports 
     - ```sudo ufw allow ssh``` 
     - ```sudo ufw allow http``` 
     - ```sudo ufw allow https```
   - Install Nginx ```sudo apt install nginx```
   - Edit the application to access it via the root domain
   ```sudo nano /etc/nginx/sites-available/default``` go to location and edit the details
   - After this, reload nginx ```sudo service nginx restart```
   - Optionally confirm nginx configuration ```sudo nginx -t```
