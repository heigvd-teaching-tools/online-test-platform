const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

    const seedGroups = [{
        label: "ASD",
    },{
        label: "TWEB SEM2 2023 (BTL)",
    }];

    for(const group of seedGroups) {
        // Check if the default group already exists
        const existingGroup = await prisma.group.findFirst({
            where: group,
        });

        // If the default group doesn't exist, create it
        if (!existingGroup) {
            await prisma.group.create({data: group});
            console.log(`Group ${group.label} created.`);
        } else {
            console.log(`Group ${group.label} already exists.`);
        }
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
