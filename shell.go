package main

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	"golang.org/x/term"
)

var allowedCommands = map[string]bool{
	"ls":   true,
	"file": true,
	"cat":  true,
	"echo": true,
}

func RunShell() {
	// Put the terminal into raw mode if it's a real terminal (or PTY)
	fd := int(os.Stdin.Fd())
	if term.IsTerminal(fd) {
		oldState, err := term.MakeRaw(fd)
		if err == nil {
			defer term.Restore(fd, oldState)
		}
	}

	terminal := term.NewTerminal(os.Stdin, "portfolio> ")

	for {
		line, err := terminal.ReadLine()
		if err != nil {
			if err == io.EOF {
				break
			}
			fmt.Fprintf(terminal, "Error reading line: %v\r\n", err)
			continue
		}

		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		args := strings.Fields(line)
		if len(args) == 0 {
			continue
		}

		cmdName := args[0]

		switch cmdName {
		case "exit", "quit":
			return
		case "clear":
			// ANSI escape to clear screen
			fmt.Fprint(terminal, "\033[2J\033[H")
		case "pwd":
			dir, err := os.Getwd()
			if err != nil {
				fmt.Fprintf(terminal, "Error: %v\r\n", err)
			} else {
				fmt.Fprintf(terminal, "%s\r\n", dir)
			}
		case "cd":
			if len(args) < 2 {
				// cd to HOME
				home, _ := os.UserHomeDir()
				os.Chdir(home)
			} else {
				err := os.Chdir(args[1])
				if err != nil {
					fmt.Fprintf(terminal, "cd: %v\r\n", err)
				}
			}
		default:
			if allowedCommands[cmdName] {
				cmd := exec.Command(cmdName, args[1:]...)
				cmd.Stdin = os.Stdin
				cmd.Stdout = terminal
				cmd.Stderr = terminal
				
				err := cmd.Run()
				if err != nil {
					fmt.Fprintf(terminal, "%v\r\n", err)
				}
			} else {
				fmt.Fprintf(terminal, "Command not allowed: %s\r\n", cmdName)
			}
		}
	}
}
