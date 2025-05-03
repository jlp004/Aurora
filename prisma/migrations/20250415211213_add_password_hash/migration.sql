/*
  Warnings:

  - You are about to drop the column `name` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `tagName` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tagName" TEXT NOT NULL
);
INSERT INTO "new_Tag" ("id") SELECT "id" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_tagName_key" ON "Tag"("tagName");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pictureURL" TEXT,
    "profileDesc" TEXT,
    "password" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "role" TEXT
);
INSERT INTO "new_User" ("email", "followers", "id", "likes", "pictureURL", "profileDesc", "role", "username") SELECT "email", "followers", "id", "likes", "pictureURL", "profileDesc", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
