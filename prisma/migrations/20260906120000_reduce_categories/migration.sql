-- The interface this app now follows offers six categories. spliit seeded 42;
-- the extras have no chip to live in. Expenses pointing at a row that is about
-- to disappear fall back to 0 first, so no foreign key is left dangling.
UPDATE "Expense" SET "categoryId" = 0 WHERE "categoryId" NOT IN (0, 1, 2, 7, 11, 27);
DELETE FROM "Category" WHERE "id" NOT IN (0, 1, 2, 7, 11, 27);

-- The survivors are renamed in place rather than reinserted: "Expense"."categoryId"
-- defaults to 0, so id 0 has to keep existing and keep meaning "uncategorised".
UPDATE "Category" SET "grouping" = 'Other',         "name" = 'Other'         WHERE "id" = 0;
UPDATE "Category" SET "grouping" = 'Settlement',    "name" = 'Settlement'    WHERE "id" = 1;
UPDATE "Category" SET "grouping" = 'Leisure',       "name" = 'Leisure'       WHERE "id" = 2;
UPDATE "Category" SET "grouping" = 'Food',          "name" = 'Food'          WHERE "id" = 7;
UPDATE "Category" SET "grouping" = 'Accommodation', "name" = 'Accommodation' WHERE "id" = 11;
UPDATE "Category" SET "grouping" = 'Transport',     "name" = 'Transport'     WHERE "id" = 27;
