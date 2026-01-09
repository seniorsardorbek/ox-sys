# OX-SYS - NestJS Backend API

- **Node.js** (v18 yoki undan yuqori)


## O'rnatish 

### 1-qadam: Bog'liqliklarni o'rnatish

```bash
npm install
```

### 2-qadam: PostgreSQL db yaratish

```sql
CREATE DATABASE oxsys;
```

##  (.env) Sozlash


```env
PORT=4000
```

```env
NODE_ENV=development
```

### Ma'lumotlar Bazasi Sozlamalari


```env
DATABASE_URL="postgresql://postgres:Enter@localhost:5432/oxsys?schema=public"
```

### JWT  Sozlamalari

```env
JWT_SECRET=oxsys-secret
```


## Prisma Migratsiyalarini Bajarish

```bash
npx prisma migrate dev --name init
```

```bash
npx prisma generate
```

## Loyihani Ishga Tushirish


```bash
npm run start:dev
```




- **http://localhost:4000**


