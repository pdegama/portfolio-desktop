package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BlogPost struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

var posts = []BlogPost{
	{ID: 1, Title: "First Post", Content: "Hello World!"},
	{ID: 2, Title: "Building a Terminal App", Content: "Using node-pty and xterm.js..."},
}

func RegisterBlogRoutes(router *gin.RouterGroup) {
	blog := router.Group("/blog")
	{
		blog.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"success": true, "data": posts})
		})

		blog.GET("/:id", func(c *gin.Context) {
			idStr := c.Param("id")
			id, err := strconv.Atoi(idStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid ID"})
				return
			}

			for _, post := range posts {
				if post.ID == id {
					c.JSON(http.StatusOK, gin.H{"success": true, "data": post})
					return
				}
			}

			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Post not found"})
		})
	}
}
