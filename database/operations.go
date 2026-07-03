package database

import (
	"fmt"

	"github.com/mereith/nav/types"
)

func HasApiToken(token string) bool {
	sql := `SELECT value FROM nav_api_token WHERE value = ? and disabled = 0`
	rows, err := DB.Query(sql, token)
	if err != nil {
		return false
	}
	defer rows.Close()

	for rows.Next() {
		return true
	}
	return false
}

// ==================== 搜索引擎相关操作 ====================

// 获取所有搜索引擎（按排序）
func GetAllSearchEngines() ([]types.SearchEngine, error) {
	sql := `SELECT id, name, baseUrl, queryParam, logo, sort, enabled FROM nav_search_engine ORDER BY sort ASC`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var engines []types.SearchEngine
	for rows.Next() {
		var engine types.SearchEngine
		err := rows.Scan(&engine.Id, &engine.Name, &engine.BaseUrl, &engine.QueryParam, &engine.Logo, &engine.Sort, &engine.Enabled)
		if err != nil {
			return nil, err
		}
		engines = append(engines, engine)
	}
	return engines, nil
}

// 获取启用的搜索引擎（按排序）
func GetEnabledSearchEngines() ([]types.SearchEngine, error) {
	sql := `SELECT id, name, baseUrl, queryParam, logo, sort, enabled FROM nav_search_engine WHERE enabled = 1 ORDER BY sort ASC`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var engines []types.SearchEngine
	for rows.Next() {
		var engine types.SearchEngine
		err := rows.Scan(&engine.Id, &engine.Name, &engine.BaseUrl, &engine.QueryParam, &engine.Logo, &engine.Sort, &engine.Enabled)
		if err != nil {
			return nil, err
		}
		engines = append(engines, engine)
	}
	return engines, nil
}

// 添加搜索引擎
func AddSearchEngine(engine types.SearchEngine) (int64, error) {
	// 获取最大排序值
	var maxSort int
	err := DB.QueryRow(`SELECT COALESCE(MAX(sort), 0) FROM nav_search_engine`).Scan(&maxSort)
	if err != nil {
		return 0, err
	}
	
	sql := `INSERT INTO nav_search_engine (name, baseUrl, queryParam, logo, sort, enabled) VALUES (?, ?, ?, ?, ?, ?)`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()
	
	result, err := stmt.Exec(engine.Name, engine.BaseUrl, engine.QueryParam, engine.Logo, maxSort+1, engine.Enabled)
	if err != nil {
		return 0, err
	}
	
	return result.LastInsertId()
}

// 更新搜索引擎
func UpdateSearchEngine(engine types.SearchEngine) error {
	sql := `UPDATE nav_search_engine SET name = ?, baseUrl = ?, queryParam = ?, logo = ?, enabled = ? WHERE id = ?`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return err
	}
	defer stmt.Close()
	
	_, err = stmt.Exec(engine.Name, engine.BaseUrl, engine.QueryParam, engine.Logo, engine.Enabled, engine.Id)
	return err
}

// 删除搜索引擎
func DeleteSearchEngine(id int) error {
	sql := `DELETE FROM nav_search_engine WHERE id = ?`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return err
	}
	defer stmt.Close()
	
	_, err = stmt.Exec(id)
	return err
}

// ==================== 点击追踪相关操作 ====================

func RecordClick(e types.ClickEvent) error {
	sql := `INSERT INTO nav_click (tool_id, tool_name, url, referrer, user_agent, ip) VALUES (?, ?, ?, ?, ?, ?)`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(e.ToolId, e.ToolName, e.Url, e.Referrer, e.UserAgent, e.Ip)
	return err
}

func GetClickStats() ([]types.ClickStats, error) {
	sql := `
		SELECT
			tool_id,
			tool_name,
			COUNT(*) as clicks,
			SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today,
			SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as week
		FROM nav_click
		GROUP BY tool_id
		ORDER BY clicks DESC
	`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats []types.ClickStats
	for rows.Next() {
		var s types.ClickStats
		err := rows.Scan(&s.ToolId, &s.ToolName, &s.Clicks, &s.Today, &s.Week)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

func GetClickTotal() (int, int, int, error) {
	var total, today, week int
	err := DB.QueryRow(`SELECT COUNT(*) FROM nav_click`).Scan(&total)
	if err != nil {
		return 0, 0, 0, err
	}
	DB.QueryRow(`SELECT COUNT(*) FROM nav_click WHERE date(created_at) = date('now')`).Scan(&today)
	DB.QueryRow(`SELECT COUNT(*) FROM nav_click WHERE created_at >= datetime('now', '-7 days')`).Scan(&week)
	return total, today, week, nil
}

// ==================== Affiliate 相关操作 ====================

func GetAllAffiliates() ([]types.Affiliate, error) {
	sql := `SELECT id, tool_id, tool_name, original_url, affiliate_url, program, commission, platform, status, notes FROM nav_affiliate ORDER BY id DESC`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var affiliates []types.Affiliate
	for rows.Next() {
		var a types.Affiliate
		err := rows.Scan(&a.Id, &a.ToolId, &a.ToolName, &a.OriginalUrl, &a.AffiliateUrl, &a.Program, &a.Commission, &a.Platform, &a.Status, &a.Notes)
		if err != nil {
			return nil, err
		}
		affiliates = append(affiliates, a)
	}
	return affiliates, nil
}

func AddAffiliate(a types.Affiliate) (int64, error) {
	sql := `INSERT INTO nav_affiliate (tool_id, tool_name, original_url, affiliate_url, program, commission, platform, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(a.ToolId, a.ToolName, a.OriginalUrl, a.AffiliateUrl, a.Program, a.Commission, a.Platform, a.Status, a.Notes)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func UpdateAffiliate(a types.Affiliate) error {
	sql := `UPDATE nav_affiliate SET tool_id=?, tool_name=?, original_url=?, affiliate_url=?, program=?, commission=?, platform=?, status=?, notes=? WHERE id=?`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(a.ToolId, a.ToolName, a.OriginalUrl, a.AffiliateUrl, a.Program, a.Commission, a.Platform, a.Status, a.Notes, a.Id)
	return err
}

func DeleteAffiliate(id int) error {
	sql := `DELETE FROM nav_affiliate WHERE id=?`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	return err
}

func ActivateAffiliate(id int) error {
	var a types.Affiliate
	err := DB.QueryRow(`SELECT id, tool_id, affiliate_url FROM nav_affiliate WHERE id=?`, id).Scan(&a.Id, &a.ToolId, &a.AffiliateUrl)
	if err != nil {
		return fmt.Errorf("affiliate not found: %w", err)
	}
	if a.AffiliateUrl == "" {
		return fmt.Errorf("affiliate URL is empty")
	}

	_, err = DB.Exec(`UPDATE nav_table SET url=? WHERE id=?`, a.AffiliateUrl, a.ToolId)
	if err != nil {
		return fmt.Errorf("failed to update tool URL: %w", err)
	}

	_, err = DB.Exec(`UPDATE nav_affiliate SET status='active' WHERE id=?`, id)
	return err
}

// ==================== 搜索日志相关操作 ====================

func RecordSearch(query string, results int, ip string) error {
	sql := `INSERT INTO nav_search_log (query, results, ip) VALUES (?, ?, ?)`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return fmt.Errorf("failed to prepare search log: %w", err)
	}
	defer stmt.Close()
	_, err = stmt.Exec(query, results, ip)
	return err
}

func GetSearchStats() ([]types.SearchStats, error) {
	sql := `
		SELECT
			query,
			COUNT(*) as count,
			SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today,
			SUM(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as week,
			AVG(results) as avg_results
		FROM nav_search_log
		GROUP BY LOWER(query)
		ORDER BY count DESC
		LIMIT 100
	`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, fmt.Errorf("failed to query search stats: %w", err)
	}
	defer rows.Close()

	var stats []types.SearchStats
	for rows.Next() {
		var s types.SearchStats
		err := rows.Scan(&s.Query, &s.Count, &s.Today, &s.Week, &s.AvgResults)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

func GetSearchTotal() (int, int, int, error) {
	var total, today, week int
	DB.QueryRow(`SELECT COUNT(*) FROM nav_search_log`).Scan(&total)
	DB.QueryRow(`SELECT COUNT(*) FROM nav_search_log WHERE date(created_at) = date('now')`).Scan(&today)
	DB.QueryRow(`SELECT COUNT(*) FROM nav_search_log WHERE created_at >= datetime('now', '-7 days')`).Scan(&week)
	return total, today, week, nil
}

// ==================== Affiliate 批量导入 ====================

func BatchAddAffiliates(affiliates []types.Affiliate) (int, error) {
	tx, err := DB.Begin()
	if err != nil {
		return 0, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`INSERT INTO nav_affiliate (tool_id, tool_name, original_url, affiliate_url, program, commission, platform, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		return 0, fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	count := 0
	for _, a := range affiliates {
		_, err = stmt.Exec(a.ToolId, a.ToolName, a.OriginalUrl, a.AffiliateUrl, a.Program, a.Commission, a.Platform, a.Status, a.Notes)
		if err != nil {
			continue
		}
		count++
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit: %w", err)
	}
	return count, nil
}

// ==================== 工具提交相关操作 ====================

func AddToolSubmission(s types.ToolSubmission) (int64, error) {
	sql := `INSERT INTO nav_tool_submission (name, url, desc, catelog, email) VALUES (?, ?, ?, ?, ?)`
	stmt, err := DB.Prepare(sql)
	if err != nil {
		return 0, fmt.Errorf("failed to prepare submission: %w", err)
	}
	defer stmt.Close()
	result, err := stmt.Exec(s.Name, s.Url, s.Desc, s.Catelog, s.Email)
	if err != nil {
		return 0, fmt.Errorf("failed to insert submission: %w", err)
	}
	return result.LastInsertId()
}

func GetToolSubmissions() ([]types.ToolSubmission, error) {
	sql := `SELECT id, name, url, desc, catelog, email, status, created_at FROM nav_tool_submission ORDER BY id DESC`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, fmt.Errorf("failed to query submissions: %w", err)
	}
	defer rows.Close()

	var submissions []types.ToolSubmission
	for rows.Next() {
		var s types.ToolSubmission
		err := rows.Scan(&s.Id, &s.Name, &s.Url, &s.Desc, &s.Catelog, &s.Email, &s.Status, &s.CreatedAt)
		if err != nil {
			return nil, err
		}
		submissions = append(submissions, s)
	}
	return submissions, nil
}

func UpdateToolSubmissionStatus(id int, status string) error {
	_, err := DB.Exec(`UPDATE nav_tool_submission SET status=? WHERE id=?`, status, id)
	return err
}

func DeleteToolSubmission(id int) error {
	_, err := DB.Exec(`DELETE FROM nav_tool_submission WHERE id=?`, id)
	return err
}

// ==================== 新工具查询 ====================

func GetNewToolIds() (map[int]bool, error) {
	sql := `SELECT id FROM nav_table WHERE created_at >= datetime('now', '-7 days')`
	rows, err := DB.Query(sql)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make(map[int]bool)
	for rows.Next() {
		var id int
		rows.Scan(&id)
		ids[id] = true
	}
	return ids, nil
}

// 更新搜索引擎排序
func UpdateSearchEngineSort(sortData []struct {
	Id   int `json:"id"`
	Sort int `json:"sort"`
}) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	stmt, err := tx.Prepare(`UPDATE nav_search_engine SET sort = ? WHERE id = ?`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	
	for _, item := range sortData {
		_, err = stmt.Exec(item.Sort, item.Id)
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}
