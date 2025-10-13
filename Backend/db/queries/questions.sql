-- name: GetAllQuestions :many
SELECT * FROM questions;

-- name: CreateQuestion :one
INSERT INTO questions (question_text, created_at)
VALUES ($1, $2)
RETURNING *;

-- name: DeleteQuestion :exec
DELETE FROM questions
WHERE id=$1;

-- name: UpdateQuestion :one
UPDATE questions
SET question_text = $2
WHERE id = $1
RETURNING *;