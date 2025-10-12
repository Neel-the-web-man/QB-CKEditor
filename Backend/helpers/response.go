package helpers

import (
	"log"
	"net/http"
	"encoding/json"
)

func RespondWithError(w http.ResponseWriter,code int,message string){
	if(code>499){
		log.Println("Responding with 5xx error:",message);
	}
	type errorResponse struct{
		Error string `json:"error"`
	}
	RespondWithJSON(w,code,errorResponse{Error:message})
}



func RespondWithJSON(w http.ResponseWriter,code int,payload interface{}){
	data,err:=json.Marshal(payload)
	if err!=nil{
		log.Printf("Error marshaling JSON response: %v",payload)
		w.WriteHeader(500)
		return
	}
	w.Header().Add("Content-Type","application/json")
	w.WriteHeader(code)
	w.Write(data)
}