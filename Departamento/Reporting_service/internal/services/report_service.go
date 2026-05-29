package services

import (
	"reporting_service/internal/db"
	"reporting_service/internal/models"
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
