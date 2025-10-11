package main

import (
	"log"
	"net/http"
	"os"


	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/Neel-the-web-man/QB-CKEditor/Backend/routes"
	"github.com/Neel-the-web-man/QB-CKEditor/Backend/db"
	"github.com/Neel-the-web-man/QB-CKEditor/Backend/controllers"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment")
	}
	
	portSTRING:=os.Getenv("PORT")
	if portSTRING==""{
		log.Fatal("PORT environment variable not set");
	}


	// Connect to the database
	conn:=db.ConnectDB()

	// Initialize sqlc store (typed queries)
	apiCfg := controllers.APIConfig{
		DB: db.New(conn), // sqlc-generated store
	}

	
	// Creating the main router
	r := chi.NewRouter()

	// Add default middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Define routes
	v1r := chi.NewRouter()

	routes.RegisterQuestionRoutes(v1r,apiCfg)

	// Mount the versioned router
	r.Mount("/api/v1", v1r)
	// Configuring the HTTP server
	srv := &http.Server{
		Handler: r,
		Addr:    ":" + portSTRING,
	}
	// Starting the server
	log.Printf("Starting server on port %s\n", portSTRING)

	srv.ListenAndServe()
}
