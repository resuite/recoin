package main

import (
	"net/http"
	"recoin/config"
	"recoin/handlers"
	"time"

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

	limiter := rate.NewLimiter(rate.Every(3*time.Second), 20)
	router.Use(RateLimiterMiddleware(limiter))

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	handlers.DefineMailingListRoutes(router)

	router.Run(":" + appConfig.Port)

}
