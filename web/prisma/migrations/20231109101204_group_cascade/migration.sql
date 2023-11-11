-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_groupId_fkey";

-- DropForeignKey
ALTER TABLE "JamSession" DROP CONSTRAINT "JamSession_groupId_fkey";

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JamSession" ADD CONSTRAINT "JamSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
