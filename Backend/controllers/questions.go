package controllers

import (
	"net/http"

	"github.com/Neel-the-web-man/QB-CKEditor/Backend/db"
	"github.com/Neel-the-web-man/QB-CKEditor/Backend/handlers"
)

type APIConfig struct {
	DB *db.Queries // sqlc-generated struct
}

// GetAllQuestions handles GET /questions
func (c *APIConfig) GetAllQuestions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	questions, err := c.DB.GetAllQuestions(ctx)
	if err != nil {
		respondWithError(w, 500, "Failed to fetch questions")
		return
	}
	respondWithJSON(w, 200, questions)
}

// CreateQuestion handles POST /questions
// func (c *APIConfig) CreateQuestion(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()
// 	var q db.CreateQuestionParams
// 	err := json.NewDecoder(r.Body).Decode(&q)
// 	if err != nil {
// 		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
// 		return
// 	}

// 	question, err := c.DB.CreateQuestion(ctx, q)
// 	if err != nil {
// 		respondWithError(w, http.StatusInternalServerError, "Failed to create question")
// 		return
// 	}

// 	respondWithJSON(w, http.StatusCreated, question)
// }
