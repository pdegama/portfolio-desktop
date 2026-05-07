package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"portfolio/api"

	"github.com/creack/pty"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for the terminal
	},
}

type ResizeMessage struct {
	Type string `json:"type"`
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

func handleWebSocket(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer ws.Close()

	exe, err := os.Executable()
	if err != nil {
		exe = os.Args[0]
	}
	cmd := exec.Command(exe, "--shell")
	cmd.Env = os.Environ()
	cmd.Dir = os.Getenv("HOME")
	if cmd.Dir == "" {
		cmd.Dir, _ = os.Getwd()
	}

	ptmx, err := pty.Start(cmd)
	if err != nil {
		log.Println("Failed to start pty:", err)
		return
	}
	defer func() {
		_ = ptmx.Close()
		_ = cmd.Process.Kill()
		_, _ = cmd.Process.Wait()
	}()

	// Read from PTY, write to WS
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := ptmx.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Println("PTY read error:", err)
				}
				break
			}
			err = ws.WriteMessage(websocket.TextMessage, buf[:n])
			if err != nil {
				log.Println("WS write error:", err)
				break
			}
		}
	}()

	// Read from WS, write to PTY
	for {
		messageType, p, err := ws.ReadMessage()
		if err != nil {
			log.Println("WS read error:", err)
			break
		}

		if messageType == websocket.TextMessage {
			// Check if it's a resize command
			var resizeMsg ResizeMessage
			if err := json.Unmarshal(p, &resizeMsg); err == nil && resizeMsg.Type == "resize" {
				if err := pty.Setsize(ptmx, &pty.Winsize{
					Rows: resizeMsg.Rows,
					Cols: resizeMsg.Cols,
				}); err != nil {
					log.Println("PTY resize error:", err)
				}
				continue
			}
		}

		// Write to PTY
		_, err = ptmx.Write(p)
		if err != nil {
			log.Println("PTY write error:", err)
			break
		}
	}
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "--shell" {
		RunShell()
		return
	}

	// Load .env
	_ = godotenv.Load()

	app := gin.Default()

	// CORS config
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	app.Use(cors.New(config))

	// API Routes
	apiGroup := app.Group("/api")
	api.RegisterBlogRoutes(apiGroup)
	api.RegisterFilesRoutes(apiGroup)
	api.RegisterGoatRoutes(apiGroup)
	api.RegisterMusicRoutes(apiGroup)

	// WebSocket Terminal
	app.GET("/ws", handleWebSocket)
	app.GET("/", func(c *gin.Context) {
		if c.GetHeader("Upgrade") == "websocket" {
			handleWebSocket(c)
			return
		}
		// If not websocket, we might just be accessing the root
		c.File("web/dist/index.html")
	})

	// Serve Static Files from web/dist
	app.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}

		// Try serving the file
		if _, err := os.Stat("web/dist" + path); err == nil {
			c.File("web/dist" + path)
			return
		}

		// Fallback to index.html for SPA
		c.File("web/dist/index.html")
	})

	port := "3001"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	log.Printf("Terminal backend listening on http://localhost:%s\n", port)
	app.Run(":" + port)
}
