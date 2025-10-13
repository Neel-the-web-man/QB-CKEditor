-- name: CreateOption :one
INSERT INTO options(question_id,option_text,option_index,is_correct,created_at)
VALUES ($1,$2,$3,$4,$5)
RETURNING *;

-- name: GetOptionsByQuestionID :many
SELECT * FROM options
WHERE question_id = $1
ORDER BY option_index;

-- name: DeleteOptionsByQuestionID :exec
DELETE FROM options
WHERE question_id = $1;