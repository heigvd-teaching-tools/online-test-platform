const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    const seedGroup = {
        label: "ASD",
    };

    // Check if the default group already exists
    const existingGroup = await prisma.group.findFirst({
        where: seedGroup,
    });

    // If the default group doesn't exist, create it
    if (!existingGroup) {
        await prisma.group.create({ data: seedGroup });
        console.log("Default group created.");
    } else {
        console.log("Default group already exists.");
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
