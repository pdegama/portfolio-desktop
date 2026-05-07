package api

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

type FileItem struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Size     *int64 `json:"size"`
	Modified string `json:"modified"`
}

func RegisterFilesRoutes(router *gin.RouterGroup) {
	filesBase := os.Getenv("FILES_BASE_PATH")
	if filesBase == "" {
		filesBase, _ = os.UserHomeDir()
	}

	files := router.Group("/files")
	{
		// Serve static files
		files.StaticFS("/serve", gin.Dir(filesBase, false))

		files.GET("/", func(c *gin.Context) {
			requestedPath := c.Query("path")
			fullPath := filepath.Join(filesBase, requestedPath)

			// Clean paths to prevent directory traversal
			fullPath = filepath.Clean(fullPath)
			cleanBase := filepath.Clean(filesBase)

			if !strings.HasPrefix(fullPath, cleanBase) {
				c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Access denied"})
				return
			}

			entries, err := os.ReadDir(fullPath)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to read directory"})
				return
			}

			result := []FileItem{}
			for _, entry := range entries {
				info, err := entry.Info()
				if err != nil {
					continue
				}
				
				item := FileItem{
					Name:     entry.Name(),
					Type:     "file",
					Modified: info.ModTime().Format(http.TimeFormat),
				}
				if entry.IsDir() {
					item.Type = "directory"
				} else {
					size := info.Size()
					item.Size = &size
				}
				result = append(result, item)
			}

			c.JSON(http.StatusOK, gin.H{"success": true, "data": result, "cwd": requestedPath})
		})
	}
}
