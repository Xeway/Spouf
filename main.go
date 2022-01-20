package main

import (
	"fmt"
	"net/http"
	"text/template"
)

type html struct {
	Name string
	Age  int
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		t, error := template.ParseFiles("./public/html/index.html")
		if error != nil {
			fmt.Println(error)
		}
		error = t.Execute(w, html{"Ewan", 17})
		if error != nil {
			fmt.Println(error)
		}
	})
	http.ListenAndServe("127.0.0.1:8080", nil)

}
