-- +goose Up
CREATE TABLE questions(
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE questions;