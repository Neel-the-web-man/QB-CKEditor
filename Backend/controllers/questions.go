package controllers

import (
	"net/http"
	
	"github.com/Neel-the-web-man/QB-CKEditor/Backend/helpers"
)

func GetAllQuestions(w http.ResponseWriter, r *http.Request) {
	questions := []string{"Q1", "Q2"} // replace with DB query
	helpers.RespondWithJSON(w, http.StatusOK, questions)
}

func CreateQuestion(w http.ResponseWriter, r *http.Request) {
	// parse request body, save to DB
	helpers.RespondWithJSON(w, http.StatusCreated, map[string]string{"status": "ok"})
}

