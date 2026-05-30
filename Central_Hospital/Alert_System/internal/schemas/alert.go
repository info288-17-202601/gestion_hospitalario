package schemas

type AlertMessage struct {
	Type         string `json:"type" binding:"required"`
	Message      string `json:"message" binding:"required"`
	SupplyID     *uint  `json:"supply_id"`
	DepartmentID *uint  `json:"department_id"`
}

type UpdateAlertStatusRequest struct {
	Status string `json:"status" binding:"required"` // PENDING, REVIEWED, RESOLVED
}
