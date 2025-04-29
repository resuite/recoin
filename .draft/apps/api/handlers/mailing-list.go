package handlers

import (
	"encoding/json"
	"recoin/config"
	"recoin/dtos"
	"recoin/models"
	"recoin/response"

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

	result, _, err := client.From("mailing-list").Select("email", "exact", false).Eq("email", input.Email).Execute()
	if err != nil {
		c.JSON(500, response.Error(response.INTERNAL_SERVER_ERROR, "Error fetching mailing list data.", err.Error()))
		return
	}

	var existingEntries []models.MailingListItem
	if err := json.Unmarshal(result, &existingEntries); err != nil {
		c.JSON(500, response.Error(response.INTERNAL_SERVER_ERROR, "Error decoding mailing list data.", err.Error()))
		return
	}

	// If email already exists, return a duplicate entry error
	if len(existingEntries) > 0 {
		c.JSON(409, response.Error(response.DUPLICATE_ENTRY, "Your email is already in the mailing list.", nil))
		return
	}

	newEntry := models.MailingListItem{
		Email: input.Email,
	}
	insertData := []models.MailingListItem{newEntry}

	_, _, err = client.From("mailing-list").Insert(insertData, false, "", "", "minimal").Execute()

	if err != nil {
		c.JSON(500, response.Error(response.INTERNAL_SERVER_ERROR, "Error adding email to mailing list.", err.Error()))
		return
	}

	c.JSON(201, response.Success(map[string]string{"message": "Email added to mailing list."}))
}
