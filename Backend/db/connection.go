package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// DB is the global database handle
var DB *sql.DB

func ConnectDB() *sql.DB {
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable not set")
	}
	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	err = conn.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
	DB=conn
	return DB
}
