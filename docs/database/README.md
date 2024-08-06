# Database backup and restore

The deployment is creating a backup of the database before applying the migrations.

On the server under ~/db_dumps, you can find the latest backup of the database. The backups are named using the following pattern: `dump_onlinetest_2021-05-04_14-30-01.sql`. 

Here is how you can do it manually. 

The same folder contains 2 scripts that can be used to backup and restore the database. 

A new copy of these scripts can be found in the `scripts` folder of the repository.

## Backup the database

```bash
cd ~/db_dumps
bash pg_backup.sh
```
This will create a new backup file in the same folder.

## Restore the database

On the server under ~/db_dumps, you can find the latest backup of the database. The backups are named using the following pattern: `dump_onlinetest_2021-05-04_14-30-01.sql`. 

```bash
cd ~/db_dumps
bash pg_restore.sh <backup-file-name>
```

## Hints in case of issues with the scripts
- Line ending must be LF
- Execute permissions: `chmod +x pg_backup.sh`
