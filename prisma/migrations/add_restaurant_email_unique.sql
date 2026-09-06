-- Restaurant contact emails must be unique. Before adding the constraint:
-- 1) Treat empty-string emails as NULL (Postgres unique indexes ignore NULLs).
-- 2) Null out duplicates, keeping the earliest restaurant per email.

UPDATE "restaurants" SET "email" = NULL WHERE "email" = '';

WITH ranked AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY LOWER("email")
            ORDER BY "created_at", "id"
        ) AS rn
    FROM "restaurants"
    WHERE "email" IS NOT NULL
)
UPDATE "restaurants" r
SET "email" = NULL
FROM ranked
WHERE ranked."id" = r."id" AND ranked.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_email_key" ON "restaurants"("email");