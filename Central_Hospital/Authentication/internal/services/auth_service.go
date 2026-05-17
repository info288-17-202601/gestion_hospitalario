package services

import (
	"errors"
	"time"

	"authentication_service/internal/config"
	"authentication_service/internal/models"
	"authentication_service/internal/schemas"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db  *gorm.DB
	cfg *config.Settings
}

func NewAuthService(db *gorm.DB, cfg *config.Settings) *AuthService {
	return &AuthService{db: db, cfg: cfg}
}

func (s *AuthService) logAuth(userID *uint, method, uidAttempt string, success bool, reason string) {
	logEntry := models.AuthLog{
		UserID:     userID,
		AuthMethod: method,
		UidAttempt: uidAttempt,
		Success:    success,
		Reason:     reason,
	}
	s.db.Create(&logEntry)
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":           user.ID,
		"rut":           user.Rut,
		"role":          user.Role,
		"department_id": user.DepartmentID,
		"exp":           time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) LoginClassic(req schemas.LoginClassicRequest) (string, *models.User, error) {
	var user models.User
	if err := s.db.Where("rut = ?", req.Rut).First(&user).Error; err != nil {
		s.logAuth(nil, "CLASSIC", req.Rut, false, "User not found")
		return "", nil, errors.New("invalid credentials")
	}

	// [TODO]
	// Use proper bcrypt password verification
	if req.Password != user.Password {
		err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
		if err != nil && user.Password != req.Password {
			s.logAuth(&user.ID, "CLASSIC", req.Rut, false, "Invalid password")
			return "", nil, errors.New("invalid credentials")
		}
	}

	if !user.IsActive {
		s.logAuth(&user.ID, "CLASSIC", req.Rut, false, "Inactive user")
		return "", nil, errors.New("user is inactive")
	}

	s.logAuth(&user.ID, "CLASSIC", req.Rut, true, "Success")
	token, err := s.generateToken(&user)
	if err != nil {
		return "", nil, err
	}
	return token, &user, nil
}

func (s *AuthService) LoginRFID(req schemas.LoginRFIDRequest) (string, *models.User, error) {
	var rfid models.RfidCard
	if err := s.db.Preload("User").Where("uid = ?", req.Uid).First(&rfid).Error; err != nil {
		s.logAuth(nil, "RFID", req.Uid, false, "RFID not found")
		return "", nil, errors.New("invalid credentials")
	}

	if !rfid.IsActive || !rfid.User.IsActive {
		s.logAuth(&rfid.User.ID, "RFID", req.Uid, false, "Inactive card or user")
		return "", nil, errors.New("inactive card or user")
	}

	var pinCred models.UserPinCredential
	if err := s.db.Where("user_id = ?", rfid.UserID).First(&pinCred).Error; err != nil {
		s.logAuth(&rfid.User.ID, "RFID", req.Uid, false, "PIN not configured")
		return "", nil, errors.New("invalid credentials")
	}

	if pinCred.PinHash != req.Pin {
		err := bcrypt.CompareHashAndPassword([]byte(pinCred.PinHash), []byte(req.Pin))
		if err != nil && pinCred.PinHash != req.Pin {
			s.logAuth(&rfid.User.ID, "RFID", req.Uid, false, "Invalid PIN")
			return "", nil, errors.New("invalid credentials")
		}
	}

	s.logAuth(&rfid.User.ID, "RFID", req.Uid, true, "Success")
	token, err := s.generateToken(&rfid.User)
	if err != nil {
		return "", nil, err
	}
	return token, &rfid.User, nil
}
