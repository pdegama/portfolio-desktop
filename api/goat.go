package api

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type GoatRequest struct {
	Code string `json:"code"`
}

func RegisterGoatRoutes(router *gin.RouterGroup) {
	router.POST("/goat", func(c *gin.Context) {
		var req GoatRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Missing or invalid 'code' in request body"})
			return
		}

		if req.Code == "" {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Missing 'code' in request body"})
			return
		}

		// Create temporary files
		fIn, err := os.CreateTemp("", "goat-in-*.txt")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create temp file"})
			return
		}
		defer os.Remove(fIn.Name())

		fOut, err := os.CreateTemp("", "goat-out-*.svg")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to create temp file"})
			return
		}
		defer os.Remove(fOut.Name())

		if _, err := fIn.WriteString(req.Code); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to write temp file"})
			return
		}
		fIn.Close()

		// Run aasvg via bunx
		cmd := exec.Command("bash", "-c", fmt.Sprintf("~/.bun/bin/bunx aasvg < %s > %s", fIn.Name(), fOut.Name()))
		var stderr bytes.Buffer
		cmd.Stderr = &stderr
		if err := cmd.Run(); err != nil {
			fmt.Println("aasvg error:", err, stderr.String())
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to render diagram"})
			return
		}

		// Read output SVG
		outBytes, err := os.ReadFile(fOut.Name())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to read output"})
			return
		}

		svg := string(outBytes)

		// Replace colors
		svg = strings.Replace(svg,
			":root { color-scheme: light dark; --aasvg-b: light-dark(black, white); --aasvg-w: light-dark(white, black); }",
			":root { color-scheme: light dark; --aasvg-b: var(--foreground); --aasvg-w: var(--background); }",
			1,
		)
		svg = strings.Replace(svg, "* {", ".aasvg * {", 1)

		c.Data(http.StatusOK, "image/svg+xml", []byte(svg))
	})
}
