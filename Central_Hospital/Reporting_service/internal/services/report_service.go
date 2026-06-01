package services

import (
	"reporting_service/internal/db"
	"reporting_service/internal/models"
	"time"

	"gorm.io/gorm"
)

// GetCriticalStockReport recupera el stock crítico del departamento
func GetCriticalStockReport(departmentID int) ([]models.CriticalStockReport, error) {
	var reports []models.CriticalStockReport
	query := `
		SELECT 
			d.name AS department,
			s.internal_code,
			s.name AS supply_name,
			di.quantity AS current_stock,
			s.minimum_stock
		FROM department_inventory di
		JOIN departments d ON di.department_id = d.id
		JOIN supplies s ON di.supply_id = s.id
		WHERE di.department_id = ?
		  AND di.quantity <= s.minimum_stock;
	`
	err := db.DB.Raw(query, departmentID).Scan(&reports).Error
	return reports, err
}

// GetMonthlyConsumptionReport recupera el consumo del ultimo mes
func GetMonthlyConsumptionReport(departmentID int) ([]models.MonthlyConsumptionReport, error) {
	var reports []models.MonthlyConsumptionReport
	query := `
		SELECT 
			s.internal_code,
			s.name AS supply_name,
			SUM(im.quantity) AS total_consumed
		FROM inventory_movements im
		JOIN supplies s ON im.supply_id = s.id
		WHERE im.origin_department_id = ?
		  AND im.type = 'consumo' 
		  AND im.movement_date >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY s.internal_code, s.name
		ORDER BY total_consumed DESC;
	`
	err := db.DB.Raw(query, departmentID).Scan(&reports).Error
	return reports, err
}

// GetTraceabilityReport recupera la trazabilidad de un insumo especifico
func GetTraceabilityReport(departmentID int, supplyCode string) ([]models.TraceabilityReport, error) {
	var reports []models.TraceabilityReport
	query := `
		SELECT 
			im.movement_date,
			im.type,
			im.quantity,
			COALESCE(u.name || ' ' || u.last_name, 'Desconocido') AS responsable,
			COALESCE(orig.name, 'N/A') AS origen,
			COALESCE(dest.name, 'N/A') AS destino,
			COALESCE(im.observations, '') AS observations
		FROM inventory_movements im
		JOIN supplies s ON im.supply_id = s.id
		LEFT JOIN users u ON im.user_id = u.id
		LEFT JOIN departments orig ON im.origin_department_id = orig.id
		LEFT JOIN departments dest ON im.destination_department_id = dest.id
		WHERE s.internal_code = ? 
		  AND (im.origin_department_id = ? OR im.destination_department_id = ?)
		ORDER BY im.movement_date DESC;
	`
	err := db.DB.Raw(query, supplyCode, departmentID, departmentID).Scan(&reports).Error
	return reports, err
}

// GetActiveAlertsReport recupera las alertas activas del departamento
func GetActiveAlertsReport(departmentID int) ([]models.ActiveAlertReport, error) {
	var reports []models.ActiveAlertReport
	query := `
		SELECT 
			s.name AS supply_name,
			a.type,
			a.message,
			a.created_at
		FROM alerts a
		LEFT JOIN supplies s ON a.supply_id = s.id
		WHERE a.department_id = ? 
		  AND a.status = 'activa'
		ORDER BY a.created_at DESC;
	`
	err := db.DB.Raw(query, departmentID).Scan(&reports).Error
	return reports, err
}

// GetDepartmentInventoryReport recupera el inventario completo
func GetDepartmentInventoryReport() ([]models.DepartmentInventoryReport, error) {
	var reports []models.DepartmentInventoryReport
	query := `
		SELECT 
			di.id,
			di.department_id,
			di.supply_id,
			di.quantity,
			s.minimum_stock
		FROM department_inventory di
		JOIN supplies s ON di.supply_id = s.id;
	`
	err := db.DB.Raw(query).Scan(&reports).Error
	return reports, err
}

func GetDepartments() ([]models.Department, error) {
	var departments []models.Department
	err := db.DB.Raw("SELECT id, name, location, is_active FROM departments").Scan(&departments).Error
	return departments, err
}

func GetSupplies() ([]models.Supply, error) {
	var supplies []models.Supply
	err := db.DB.Raw("SELECT id, internal_code, name, description, unit_of_measure, minimum_stock, category_id, is_active FROM supplies").Scan(&supplies).Error
	return supplies, err
}

func CreateSupply(supply *models.Supply) error {
	return db.DB.Exec(
		"INSERT INTO supplies (internal_code, name, description, unit_of_measure, minimum_stock, category_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
		supply.InternalCode, supply.Name, supply.Description, supply.UnitOfMeasure, supply.MinimumStock, supply.CategoryID, supply.IsActive,
	).Scan(&supply.ID).Error
}

func UpdateSupply(id int, supply *models.Supply) error {
	return db.DB.Exec(
		"UPDATE supplies SET internal_code=?, name=?, description=?, unit_of_measure=?, minimum_stock=?, category_id=?, is_active=? WHERE id=?",
		supply.InternalCode, supply.Name, supply.Description, supply.UnitOfMeasure, supply.MinimumStock, supply.CategoryID, supply.IsActive, id,
	).Error
}

func GetCategories() ([]models.Category, error) {
	var categories []models.Category
	err := db.DB.Raw("SELECT id, name, description FROM supply_category").Scan(&categories).Error
	return categories, err
}

func CreateCategory(category *models.Category) error {
	return db.DB.Exec(
		"INSERT INTO supply_category (name, description) VALUES (?, ?) RETURNING id",
		category.Name, category.Description,
	).Scan(&category.ID).Error
}

func UpdateCategory(id int, category *models.Category) error {
	return db.DB.Exec(
		"UPDATE supply_category SET name=?, description=? WHERE id=?",
		category.Name, category.Description, id,
	).Error
}

func DeleteCategory(id int) error {
	return db.DB.Exec("DELETE FROM supply_category WHERE id=?", id).Error
}

func GetUsers() ([]models.User, error) {
	var users []models.User
	err := db.DB.Raw("SELECT id, rut, name, last_name, email, phone, role, department_id, is_active FROM users").Scan(&users).Error
	return users, err
}

func CreateUser(req models.CreateUserRequest) (*models.User, error) {
	var id int
	err := db.DB.Raw(
		"INSERT INTO users (rut, name, last_name, email, phone, role, department_id, is_active, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
		req.Rut, req.FirstName, req.LastName, req.Email, req.Phone, req.Role, req.DepartmentID, req.IsActive, req.Password,
	).Scan(&id).Error
	if err != nil {
		return nil, err
	}
	user := &models.User{
		ID:           id,
		Rut:          req.Rut,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		Phone:        req.Phone,
		Role:         req.Role,
		DepartmentID: req.DepartmentID,
		IsActive:     req.IsActive,
	}
	return user, nil
}

func UpdateUser(id int, req models.UpdateUserRequest) (*models.User, error) {
	// For update, let's update fields provided.
	err := db.DB.Exec(
		"UPDATE users SET rut=?, name=?, last_name=?, email=?, phone=?, role=?, department_id=?, is_active=? WHERE id=?",
		req.Rut, req.FirstName, req.LastName, req.Email, req.Phone, req.Role, req.DepartmentID, req.IsActive, id,
	).Error
	if err != nil {
		return nil, err
	}
	user := &models.User{
		ID:           id,
		Rut:          req.Rut,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		Phone:        req.Phone,
		Role:         req.Role,
		DepartmentID: req.DepartmentID,
		IsActive:     req.IsActive,
	}
	return user, nil
}

func GetRfidCards() ([]models.RfidCard, error) {
	var cards []models.RfidCard
	err := db.DB.Raw("SELECT id, user_id, uid, is_active, created_at FROM rfid_cards").Scan(&cards).Error
	return cards, err
}

func GetUserPins() ([]models.UserPinCredential, error) {
	var pins []models.UserPinCredential
	err := db.DB.Raw("SELECT id, user_id, pin_hash, true as is_configured FROM user_pin_credentials").Scan(&pins).Error
	return pins, err
}

type DBAuthLog struct {
	ID         int
	UserID     *int
	AuthMethod string
	UIDAttempt *string
	Success    bool
	Reason     *string
	CreatedAt  time.Time
}

func GetAuthLogs() ([]models.AuthLog, error) {
	var dbLogs []DBAuthLog
	if err := db.DB.Raw("SELECT id, user_id, auth_method, uid_attempt, success, reason, created_at FROM auth_logs ORDER BY created_at DESC").Scan(&dbLogs).Error; err != nil {
		return nil, err
	}
	var logs = make([]models.AuthLog, 0)
	for _, dl := range dbLogs {
		result := "fallido"
		if dl.Success {
			result = "exitoso"
		}
		logs = append(logs, models.AuthLog{
			ID:        dl.ID,
			UserID:    dl.UserID,
			Method:    dl.AuthMethod,
			UIDUsed:   dl.UIDAttempt,
			Result:    result,
			Reason:    dl.Reason,
			CreatedAt: dl.CreatedAt,
		})
	}
	return logs, nil
}

func GetInventoryMovements() ([]models.InventoryMovement, error) {
	var movements []models.InventoryMovement
	err := db.DB.Raw("SELECT id, type, quantity, movement_date, observations, user_id, supply_id, origin_department_id, destination_department_id FROM inventory_movements ORDER BY movement_date DESC").Scan(&movements).Error
	return movements, err
}

func CreateInventoryMovement(req models.CreateMovementRequest) (*models.InventoryMovement, error) {
	tx := db.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	movement := models.InventoryMovement{
		Type:                    req.Type,
		Quantity:                req.Quantity,
		Observations:            req.Observations,
		UserID:                  req.UserID,
		SupplyID:                req.SupplyID,
		SourceDepartmentID:      req.SourceDepartmentID,
		DestinationDepartmentID: req.DestinationDepartmentID,
	}

	if err := tx.Create(&movement).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Update stock based on type
	if req.Type == "entrada" && req.DestinationDepartmentID != nil {
		err := updateStock(tx, *req.DestinationDepartmentID, req.SupplyID, req.Quantity)
		if err != nil { tx.Rollback(); return nil, err }
	} else if req.Type == "salida" && req.SourceDepartmentID != nil {
		err := updateStock(tx, *req.SourceDepartmentID, req.SupplyID, -req.Quantity)
		if err != nil { tx.Rollback(); return nil, err }
	} else if req.Type == "transferencia" && req.SourceDepartmentID != nil && req.DestinationDepartmentID != nil {
		err := updateStock(tx, *req.SourceDepartmentID, req.SupplyID, -req.Quantity)
		if err != nil { tx.Rollback(); return nil, err }
		err = updateStock(tx, *req.DestinationDepartmentID, req.SupplyID, req.Quantity)
		if err != nil { tx.Rollback(); return nil, err }
	} else if req.Type == "ajuste" {
		// Depends on whether it's positive or negative adjustment, but quantity is usually positive here.
		// If Source is present, treat as reduction. If Dest is present, treat as addition.
		if req.SourceDepartmentID != nil {
			err := updateStock(tx, *req.SourceDepartmentID, req.SupplyID, -req.Quantity)
			if err != nil { tx.Rollback(); return nil, err }
		}
		if req.DestinationDepartmentID != nil {
			err := updateStock(tx, *req.DestinationDepartmentID, req.SupplyID, req.Quantity)
			if err != nil { tx.Rollback(); return nil, err }
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return &movement, nil
}

func updateStock(tx *gorm.DB, deptID int, supplyID int, qty float64) error {
	var inv struct { Quantity float64 }
	err := tx.Raw("SELECT quantity FROM department_inventory WHERE department_id = ? AND supply_id = ?", deptID, supplyID).Scan(&inv).Error
	if err != nil {
		return err
	}
	
	// If record doesn't exist, we must insert it
	var count int64
	tx.Raw("SELECT COUNT(*) FROM department_inventory WHERE department_id = ? AND supply_id = ?", deptID, supplyID).Count(&count)
	if count == 0 {
		return tx.Exec("INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES (?, ?, ?)", deptID, supplyID, qty).Error
	}

	return tx.Exec("UPDATE department_inventory SET quantity = quantity + ? WHERE department_id = ? AND supply_id = ?", qty, deptID, supplyID).Error
}
