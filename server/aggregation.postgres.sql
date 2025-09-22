--7 
SELECT role, COUNT(*) AS count
FROM Users
GROUP BY role
ORDER BY count DESC;

--8
UPDATE "Users" u
SET balance = balance + cashback.total_cashback
FROM (
  SELECT c."userId", SUM(c.prize * 0.1) AS total_cashback
  FROM "Contests" c
  JOIN "Users" u ON u.id = c."userId"
  WHERE u.role = 'customer'
    AND c."createdAt" BETWEEN '2024-12-25' AND '2025-01-14'
  GROUP BY c."userId"
) AS cashback
WHERE u.id = cashback."userId";

--9
UPDATE "Users" u
SET balance = balance + 10
WHERE id IN (
  SELECT id
  FROM "Users"
  WHERE role = 'creator'
  ORDER BY rating DESC
  LIMIT 3
);