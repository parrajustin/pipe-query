-- 8. Set Operations (UNION, INTERSECT, EXCEPT)
CREATE PUBLIC TABLE FUNCTION CombineSets(
    table_a TABLE<id INT64>,
    table_b TABLE<id INT64>
)
AS (
    FROM table_a
    |> UNION ALL (FROM table_b)
    |> INTERSECT DISTINCT (FROM table_a |> WHERE id > 5)
);
