import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("host3000", 12);
    const updatedUser = await prisma.user.update({
        where: { username: "alissondev" },
        data: { password: passwordHash }
    });
    console.log("Updated user password to 'host3000':", updatedUser.username);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
