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

Generate CA
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt

```