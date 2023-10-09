# Use the deployment scripts to deploy the application
If you are on windows use powershell console and run deploy.ps1 script.
If you are on linux use bash console and run deploy.sh script.

## Requirements
You must be connected using VPN to the heig-vd network.

You must specify all the necessary secrets in your environment variables.

Please check the the script for more information.

## Environement variables for MacOS and Linux
```bash
export REMOTE_USER=yourremoteuser
export REMOTE_HOST=yourremotehost
export POSTGRES_USER=youruser
export POSTGRES_PASSWORD=yourpassword
export POSTGRES_DB=yourdatabase
export NEXTAUTH_SECRET=yoursecret
export NEXTAUTH_GITHUB_ID=yourgithubid
export NEXTAUTH_GITHUB_SECRET=yourgithubsecret
export GITHUB_ORG=yourgithuborg
export GITHUB_APP_ID=yourgithubappid
export GITHUB_APP_PRIVATE_KEY_PATH=yourgithubappprivatekeypath
export GITHUB_APP_INSTALLATION_ID=yourgithubappinstallationid
export DB_SANDBOX_CLIENT_HOST="172.17.0.1"
```

## First Deployment - OnlineTest App

You need to place the private key of the github app "OnlineTest" in the /web folder of the project.

Online Test App : https://github.com/organizations/heigvd-teaching-tools/settings/applications/2307660

The private key `eval-teaching-tools.private-key.pem` is now stored on the server in the user home directory.

## Setting up SSL

The SSL certificate is stored on the server at : /etc/ssl/certs/iict-heig-vd.in/

The nginx configuration is expecting the certificates to be located in the /ssl folder of the project.


```bash	
sudo cp /etc/ssl/certs/iict-heig-vd.in/fullchain.pem ~/onlinetest/ssl/
sudo cp /etc/ssl/certs/iict-heig-vd.in/privkey.pem ~/onlinetest/ssl/
```

The nginx container will fail to run if the certificates are not present. Make sure to re-run the nginx container after copying the certificates.

