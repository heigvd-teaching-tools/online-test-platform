/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const seedGroups = [
    {
      label: 'ASD',
    },
    {
      label: 'TWEB SEM2 2023 (BTL)',
    },
  ]

  const seedUsers = [
    {
      email: 'stefanteofanovic@hotmail.com',
      name: 'Stefan Teofanovic',
      role: 'PROFESSOR',
    },
    {
      email: 'bertil.chapuis@heig-vd.ch',
      name: 'Bertil Chapuis',
      role: 'PROFESSOR',
    },
  ]

  for (const group of seedGroups) {
    // Check if the default group already exists
    const existingGroup = await prisma.group.findFirst({
      where: group,
    })

    // If the default group doesn't exist, create it
    if (!existingGroup) {
      const created = await prisma.group.create({ data: group })

      console.log(`Group ${group.label} created.`)
    } else {
      console.log(`Group ${group.label} already exists.`)
    }
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
