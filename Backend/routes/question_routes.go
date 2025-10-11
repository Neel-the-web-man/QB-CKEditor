package routes

import (
	"net/http"

	"github.com/Neel-the-web-man/QB-CKEditor/Backend/controllers"
	"github.com/go-chi/chi/v5"
)

func RegisterQuestionRoutes(r chi.Router) {
    r.Route("/questions", func(r chi.Router) {
        r.Get("/", controllers.GetAllQuestions)
        r.Post("/", controllers.CreateQuestion)
        r.Delete("/", controllers.CreateQuestion)
    })
}
