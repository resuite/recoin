package response

import "github.com/gin-gonic/gin"

func Success(data any) gin.H {
	return gin.H{
		"success": true,
		"data":    data,
	}
}
