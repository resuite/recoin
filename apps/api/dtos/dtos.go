package dtos

type MailingListRegistrationDTO struct {
	Email string `json:"email" binding:"required,email"`
}
