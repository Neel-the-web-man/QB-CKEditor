package routes

import (
	"github.com/Neel-the-web-man/QB-CKEditor/Backend/controllers"
	"github.com/go-chi/chi/v5"
)

func RegisterQuestionRoutes(r chi.Router, cfg controllers.APIConfig) {
	r.Route("/questions", func(r chi.Router) {
		r.Get("/", cfg.GetAllQuestions)
	})
}
