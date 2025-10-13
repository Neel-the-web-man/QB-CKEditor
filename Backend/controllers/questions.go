package controllers

import (
	"encoding/json"
	"net/http"
	"time"
	"database/sql" 
	"strconv"

	"github.com/Neel-the-web-man/QB-CKEditor/Backend/db"
	"github.com/Neel-the-web-man/QB-CKEditor/Backend/helpers"
	"github.com/go-chi/chi/v5"
)

type APIConfig struct {
	DB *db.Queries
	Conn *sql.DB 
}

type OptionPayload struct {
	Text      string `json:"text"`
	IsCorrect bool   `json:"is_correct"`
}

type CreateQuestionPayload struct {
	QuestionText string           `json:"question_text"`
	Options      []OptionPayload  `json:"options"`
}

type OptionResponse struct {
	ID        int32  `json:"id"`
	Text      string `json:"text"`
	IsCorrect bool   `json:"is_correct"`
}

type QuestionResponse struct {
	ID           int32            `json:"id"`
	QuestionText string           `json:"question_text"`
	CreatedAt    string           `json:"created_at"`
	Options      []OptionResponse `json:"options"`
}

// GetAllQuestions handles GET /questions
func (c *APIConfig) GetAllQuestions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// fetch all questions
	questions, err := c.DB.GetAllQuestions(ctx)
	if err != nil {
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch questions")
		return
	}

	var response []QuestionResponse

	for _, q := range questions {
		// fetch options for each question
		opts, err := c.DB.GetOptionsByQuestionID(ctx, q.ID)
		if err != nil {
			helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch options")
			return
		}

		var optionResponses []OptionResponse
		for _, o := range opts {
			optionResponses = append(optionResponses, OptionResponse{
				ID:        o.ID,
				Text:      o.OptionText,
				IsCorrect: o.IsCorrect,
			})
		}

		response = append(response, QuestionResponse{
			ID:           q.ID,
			QuestionText: q.QuestionText,
			CreatedAt:    q.CreatedAt.Time.Format(time.RFC3339),
			Options:      optionResponses,
		})
	}

	helpers.RespondWithJSON(w, http.StatusOK, response)
}

// CreateQuestion handles POST /questions
func (c *APIConfig) CreateQuestion(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload CreateQuestionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		helpers.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	tx, err := db.DB.BeginTx(ctx, nil)
	if err != nil {
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}

	qtx := c.DB.WithTx(tx)

	question, err := qtx.CreateQuestion(ctx, db.CreateQuestionParams{
		QuestionText: payload.QuestionText,
		CreatedAt:    sql.NullTime{Time: time.Now().UTC(), Valid: true},
	})
	if err != nil {
		tx.Rollback()
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to create question")
		return
	}

	for i, opt := range payload.Options {
		_, err := qtx.CreateOption(ctx, db.CreateOptionParams{
			QuestionID:  question.ID,
			OptionText:  opt.Text,
			OptionIndex: int16(i + 1),
			IsCorrect:   opt.IsCorrect,
			CreatedAt:   sql.NullTime{Time: time.Now().UTC(), Valid: true},
		})
		if err != nil {
			tx.Rollback()
			helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to create options")
			return
		}
	}

	if err := tx.Commit(); err != nil {
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	helpers.RespondWithJSON(w, http.StatusCreated,  map[string]string{
    "message": "Question created successfully",
	})
}


// DeleteQuestion handles Delete /questions/{questionID}

func (c *APIConfig) DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// get questionID from URL params
	questionIDStr := chi.URLParam(r, "questionID")
	if questionIDStr == "" {
		helpers.RespondWithError(w, http.StatusBadRequest, "Missing question ID")
		return
	}

	// convert to int32
	questionIDInt, err := strconv.Atoi(questionIDStr)
	if err != nil {
		helpers.RespondWithError(w, http.StatusBadRequest, "Invalid question ID")
		return
	}
	questionID := int32(questionIDInt)

	// call sqlc delete query
	err = c.DB.DeleteQuestion(ctx, questionID)
	if err != nil {
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to delete question")
		return
	}

	helpers.RespondWithJSON(w, http.StatusCreated,  map[string]string{
    "message": "Question DELETED successfully",
	})
}


// EditQuestion handles Editing of questions/{questionID}

func (c *APIConfig) EditQuestion(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get questionID from URL
	questionIDStr := chi.URLParam(r, "questionID")
	if questionIDStr == "" {
		helpers.RespondWithError(w, http.StatusBadRequest, "Missing question ID")
		return
	}

	qidInt, err := strconv.Atoi(questionIDStr)
	if err != nil {
		helpers.RespondWithError(w, http.StatusBadRequest, "Invalid question ID")
		return
	}
	questionID := int32(qidInt)

	// Decode request body
	var payload CreateQuestionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		helpers.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Start transaction
	tx, err := db.DB.BeginTx(ctx, nil)
	if err != nil {
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to start transaction")
		return
	}
	qtx := c.DB.WithTx(tx)

	// Update question text
	_, err = qtx.UpdateQuestion(ctx, db.UpdateQuestionParams{
		ID:           questionID,
		QuestionText: payload.QuestionText,
	})
	if err != nil {
		tx.Rollback()
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to update question")
		return
	}

	// Delete old options
	err = qtx.DeleteOptionsByQuestionID(ctx, questionID)
	if err != nil {
		tx.Rollback()
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to delete old options")
		return
	}

	// Insert new options
	for i, opt := range payload.Options {
		_, err := qtx.CreateOption(ctx, db.CreateOptionParams{
			QuestionID:  questionID,
			OptionText:  opt.Text,
			OptionIndex: int16(i + 1),
			IsCorrect:   opt.IsCorrect,
			CreatedAt:   sql.NullTime{Time: time.Now().UTC(), Valid: true},
		})
		if err != nil {
			tx.Rollback()
			helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to create new options")
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		helpers.RespondWithError(w, http.StatusInternalServerError, "Failed to commit transaction")
		return
	}

	helpers.RespondWithJSON(w, http.StatusCreated,  map[string]string{
    	"message": "Question Edited successfully",
	})
}