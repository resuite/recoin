package main

import (
	"net/http"
	"recoin/config"
	"recoin/handlers"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func RateLimiterMiddleware(limiter *rate.Limiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests"})
			return
		}
		c.Next()
	}
}

func main() {
	appConfig := config.LoadAppConfig()

	router := gin.Default()

	// CORS Middleware Configuration
	corsConfig := cors.DefaultConfig()
	if appConfig.FrontendURL != "" {
		corsConfig.AllowOrigins = []string{appConfig.FrontendURL}
	} else {
		corsConfig.AllowAllOrigins = true
	}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"} // Add any other headers your frontend sends
	corsConfig.AllowCredentials = true                                                              // If your frontend needs to send cookies or auth headers

	router.Use(cors.New(corsConfig))

	// Rate Limiter Middleware
	limiter := rate.NewLimiter(rate.Every(3*time.Second), 20)
	router.Use(RateLimiterMiddleware(limiter))

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	handlers.DefineMailingListRoutes(router)

	router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Server is running.")
	})

	router.Run(":" + appConfig.Port)

}
