
# Deployment Using Gihub Actions

A self-hosted runner is used to deploy the application. The runner is configured on the organisation level and is available to all repositories:

https://github.com/organizations/heigvd-teaching-tools/settings/actions/runners

The runner is configured to run on the server `eval.iict-heig-vd.in`. Runner files can be found in the following location: `~/actions-runner`

## Deploy the application to production

Run the GitHub Actions deploy workflow.

The deploy workflow is setup to run on `workflow_dispatch` event. This means that it must be triggered manually from the GitHub Actions page: 

https://github.com/heigvd-teaching-tools/online-test-platform/actions

The workflow is setup to checkout the `main` branch and deploy it to the production server. Make sure that the `main` branch is up to date before triggering the workflow.


## Runner status 
If the runner is not running, you can start it manually using the following command:

```bash
# should run it in background so that it does not stop when you close the terminal
nohup ~/actions-runner/run.sh &
```
The logs of the runner can be checked using the following command:
    
```bash
cat nohup.out
```

Its status can be checked on the following page:
https://github.com/organizations/heigvd-teaching-tools/settings/actions/runners

## Setup a new runner

If you need to setup a new runner, please follow the instructions in the following link:
https://github.com/organizations/heigvd-teaching-tools/settings/actions/runners

Name of the runner: `deploy`
Add label: `deploy`

## GitHub Secrets

A number of secrets are required to deploy the application. These secrets are stored in the GitHub repository settings under the section `Secrets`.
https://github.com/heigvd-teaching-tools/online-test-platform/settings/secrets/actions

| Secret | Description |
| --- | --- |
| HEXTAUTH_KEYCLOAK_CLIENT_ID | The Keycloak OIDC client id |
| HEXTAUTH_KEYCLOAK_CLIENT_SECRET | The Keycloak OIDC client secret |
| NEXTAUTH_SECRET | The secret used to encrypt the session |
| POSTGRES_DB | The name of the database, used by docker compose to initialize the prod database |
| POSTGRES_PASSWORD | The password of the database user |
| POSTGRES_USER | The name of the database user |
| REMOTE_HOST | The IP address of the server used by the runner to deploy the application |
| REMOTE_SSH_KEY | The private key used by the runner to connect to the server |
| REMOTE_USER | The user used by the runner to connect to the server |
| SSL_FULLCHAIN | The fullchain certificate used by the server for https |
| SSL_PRIVKEY | The private key used by the server for https |

# Server configuration

- Must have a running docker daemon
- Open ports: 80, 443 and 22
- Must have rsync installed



## Monitoring Server Resources

A monitoring tool is available './home/heiguser/monitor.sh'. It refreshes every 5 seconds and displays the CPU, Memory and Disk usage of the server. The refresh rate can be changed in the script. 

```bash
cd ~
bash ./monitor.sh
```

### Disk space used by docker
    
```bash
docker system df
```

# Server Scheduled Tasks

We need 2 scheduled tasks running on the server.

The database backup and the the docker disk space cleanup.

To list all existing cron jobs, use the following command:

```bash
crontab -l
```

To edit the cron jobs, use the following command:

```bash
crontab -e
```

## Cron jobs

```
0 3 * * * cd ~/crons/db_scheduled_backup && bash pg_backup.sh >> ~/crons/db_scheduled_backup/pg_backup.log 2>&1
0 0 * * 0 cd ~/crons && bash cleanup_disk_space.sh >> ~/crons/cleanup_disk_space.log 2>&1
```

Make sure each script writes its own log file for debugging purposes.

Add these 2 lines in crontab to schedule the tasks. Make sure the related scripts are in the correct folder.
You can copy these scripts from /scripts folder in the repository.

Update, save and exit the file to apply the changes.

- Go to the line you want to edit
- Press `i` to enter the insert mode
- Make the changes
- Press `ESC` to exit the insert mode
- Type `:wq` to save and exit the file

