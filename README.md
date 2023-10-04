# Youtube Sharing Backend


# My Note:

Grant permissions for `account` on postgres

```sql
ALTER USER `youtubesharing` CREATEDB;
GRANT ALL ON schema public TO `youtubesharing`; 
```


Run this command to migrate database
```bash
npx prisma migrate dev
```