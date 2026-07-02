package schemas

type LoginClassicRequest struct {
	Rut                string `json:"rut" binding:"required"`
	Password           string `json:"password" binding:"required"`
	TargetDepartmentID uint   `json:"target_department_id"`
}

type LoginRFIDRequest struct {
	Uid                string `json:"uid" binding:"required"`
	Pin                string `json:"pin" binding:"required"`
	TargetDepartmentID uint   `json:"target_department_id"`
}

type UserResponse struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Role         string `json:"role"`
	DepartmentID uint   `json:"department_id"`
}

type TokenResponse struct {
	AccessToken string       `json:"access_token"`
	TokenType   string       `json:"token_type"`
	User        UserResponse `json:"user"`
}
