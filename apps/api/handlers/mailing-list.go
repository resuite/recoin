package handlers

import (
	"recoin/config"
	"recoin/dtos"
	"recoin/models"

	"github.com/gin-gonic/gin"
)

func DefineMailingListRoutes(router *gin.Engine) {
	// router.GET("/mailing-list", GetMailingList)
	router.POST("/mailing-list", AddEmailToMailingList)
}

// func GetMailingList(c *gin.Context) {
// 	config := config.GetAppConfig()
// 	client := config.Client

// 	mailingList, _, err := client.From("mailing-list").Select("*", "exact", false).Execute()
// 	if err != nil {
// 		c.JSON(500, gin.H{
// 			"message": "Error fetching mailing list" + err.Error(),
// 		})
// 		return
// 	}

// 	var decodedMailingList []map[string]interface{}
// 	if err := json.Unmarshal(mailingList, &decodedMailingList); err != nil {
// 		c.JSON(500, gin.H{
// 			"message": "Error decoding mailing list" + err.Error(),
// 		})
// 		return
// 	}

// 	c.JSON(200, decodedMailingList)
// }

func AddEmailToMailingList(c *gin.Context) {
	var input dtos.MailingListRegistrationDTO

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	config := config.GetAppConfig()
	client := config.Client

	newEntry := models.MailingListItem{
		Email: input.Email,
	}
	insertData := []models.MailingListItem{newEntry}

	_, _, err := client.From("mailing-list").Insert(insertData, false, "", "", "minimal").Execute()

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to add email to mailing list: " + err.Error()})
		return
	}

	c.JSON(201, gin.H{"message": "Email added successfully"})
}
