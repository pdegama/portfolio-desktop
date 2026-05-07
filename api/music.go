package api

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/dhowden/tag"
	"github.com/gin-gonic/gin"
)

func RegisterMusicRoutes(router *gin.RouterGroup) {
	filesBase := os.Getenv("FILES_BASE_PATH")
	if filesBase == "" {
		filesBase, _ = os.UserHomeDir()
	}

	router.GET("/music", func(c *gin.Context) {
		requestedPath := c.Query("path")
		fullPath := filepath.Join(filesBase, requestedPath)

		fullPath = filepath.Clean(fullPath)
		cleanBase := filepath.Clean(filesBase)

		if !strings.HasPrefix(fullPath, cleanBase) {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Access denied"})
			return
		}

		f, err := os.Open(fullPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to read file"})
			return
		}
		defer f.Close()

		m, err := tag.ReadFrom(f)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to parse music metadata"})
			return
		}

		base64Cover := ""
		pic := m.Picture()
		if pic != nil && len(pic.Data) > 0 {
			b64 := base64.StdEncoding.EncodeToString(pic.Data)
			base64Cover = fmt.Sprintf("data:%s;base64,%s", pic.MIMEType, b64)
		}

		// Calculate approximate duration using file size and bitrate? dhowden/tag doesn't do duration easily
		// For our purposes we can return a 0 if we can't find duration or use a different lib, but for now:
		
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"title":    m.Title(),
				"artist":   m.Artist(),
				"duration": 0, // Duration requires full decoding, leaving 0 or omitting
				"cover":    base64Cover,
			},
		})
	})
}
