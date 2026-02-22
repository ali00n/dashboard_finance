const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const path = require('path');

const dbPath = path.join(process.cwd(), 'dev.db');
const dbUrl = 'file:' + dbPath.replace(/\\/g, '/');
console.log('DB URL:', dbUrl);

const client = createClient({ url: dbUrl });
const adapter = new PrismaLibSql(client);
const prisma = new PrismaClient({ adapter });

prisma.user.findUnique({ where: { username: 'alissondev' } })
    .then(u => {
        console.log('User found:', u ? { id: u.id, username: u.username, hasPassword: !!u.password } : 'NOT FOUND');
    })
    .catch(e => console.error('ERR:', e.message))
    .finally(() => prisma.$disconnect());
