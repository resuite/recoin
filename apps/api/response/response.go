package response

import "github.com/gin-gonic/gin"

type ErrorCode int

const (
	MALFORMED_REQUEST       ErrorCode = 0
	INVALID_PARAMETERS      ErrorCode = 1
	AUTHENTICATION_REQUIRED ErrorCode = 2
	USER_NOT_FOUND          ErrorCode = 4
	PERMISSION_DENIED       ErrorCode = 5
	RESOURCE_NOT_FOUND      ErrorCode = 6
	DUPLICATE_ENTRY         ErrorCode = 7
	TOKEN_EXPIRED           ErrorCode = 8
	INVALID_TOKEN           ErrorCode = 9
	INVALID_OAUTH_TOKEN     ErrorCode = 10
	ACCOUNT_SUSPENDED       ErrorCode = 11
	TOO_MANY_REQUESTS       ErrorCode = 12
)

func Success(data any) gin.H {
	return gin.H{
		"success": true,
		"data":    data,
	}
}

func Error(code ErrorCode, message string, data any) gin.H {
	return gin.H{
		"error": gin.H{
			"code":    code,
			"message": message,
			"data":    data,
		},
	}
}
