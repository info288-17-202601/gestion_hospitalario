package handlers

import (
	"net/http"

	"authentication_service/internal/config"
	"authentication_service/internal/db"
	"authentication_service/internal/schemas"
	"authentication_service/internal/services"

	"github.com/gin-gonic/gin"
)

// @Summary Login via RUT and Password
// @Description Authenticates a user with RUT and password, returns JWT token
// @Tags authentication
// @Accept json
// @Produce json
// @Param request body schemas.LoginClassicRequest true "Login credentials"
// @Success 200 {object} schemas.TokenResponse "Successfully authenticated"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 400 {object} map[string]string "Bad Request"
// @Router /auth/login/classic [post]
func LoginClassic(c *gin.Context) {
	var req schemas.LoginClassicRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	cfg, _ := config.LoadConfig()
	svc := services.NewAuthService(db.GetDB(), cfg)

	token, user, err := svc.LoginClassic(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schemas.TokenResponse{
		AccessToken: token,
		TokenType:   "bearer",
		User: schemas.UserResponse{
			ID:           user.ID,
			Name:         user.Name,
			Role:         user.Role,
			DepartmentID: user.DepartmentID,
		},
	})
}

// @Summary Login via RFID and PIN
// @Description Authenticates a user using RFID card UID and PIN, returns JWT token
// @Tags authentication
// @Accept json
// @Produce json
// @Param request body schemas.LoginRFIDRequest true "RFID credentials"
// @Success 200 {object} schemas.TokenResponse "Successfully authenticated"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 400 {object} map[string]string "Bad Request"
// @Router /auth/login/rfid [post]
func LoginRFID(c *gin.Context) {
	var req schemas.LoginRFIDRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	cfg, _ := config.LoadConfig()
	svc := services.NewAuthService(db.GetDB(), cfg)

	token, user, err := svc.LoginRFID(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, schemas.TokenResponse{
		AccessToken: token,
		TokenType:   "bearer",
		User: schemas.UserResponse{
			ID:           user.ID,
			Name:         user.Name,
			Role:         user.Role,
			DepartmentID: user.DepartmentID,
		},
	})
}
