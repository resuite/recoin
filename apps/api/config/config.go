package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type AppConfig struct {
	SUPABASE_API_URL          string
	SUPABASE_SERVICE_ROLE_KEY string
	Client                    supabase.Client
	Port                      string
	FrontendURL               string
	initialized               bool
}

var appConfig AppConfig

func LoadAppConfig() AppConfig {
	godotenv.Load()

	SUPABASE_API_URL := os.Getenv("SUPABASE_API_URL")
	SUPABASE_SERVICE_ROLE_KEY := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	Port := os.Getenv("PORT")
	FrontendURL := os.Getenv("FRONTEND_URL")

	if SUPABASE_API_URL == "" {
		fmt.Println("SUPABASE_API_URL is required")
		os.Exit(1)
	}

	if SUPABASE_SERVICE_ROLE_KEY == "" {
		fmt.Println("SUPABASE_SERVICE_ROLE_KEY is required")
		os.Exit(1)
	}

	if Port == "" {
		Port = "3000"
	}

	if FrontendURL == "" {
		// Default to an empty string or a sensible default if needed,
		// but for CORS, it's better to require it explicitly or handle it in the middleware.
		fmt.Println("Warning: FRONTEND_URL environment variable not set. CORS might not work as expected.")
	}

	client, err := supabase.NewClient(SUPABASE_API_URL, SUPABASE_SERVICE_ROLE_KEY, &supabase.ClientOptions{})
	if err != nil {
		fmt.Println("Error creating client:", err)
		fmt.Println("Env variables:")
		os.Exit(1)
	}

	appConfig := AppConfig{
		SUPABASE_API_URL:          SUPABASE_API_URL,
		SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY,
		Client:                    *client,
		Port:                      Port,
		FrontendURL:               FrontendURL,
		initialized:               true,
	}

	return appConfig
}

func GetAppConfig() AppConfig {
	if !appConfig.initialized {
		appConfig = LoadAppConfig()
	}
	return appConfig
}
