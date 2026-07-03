package main

import (
	"embed"
	"flag"
	"fmt"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/mereith/nav/database"
	"github.com/mereith/nav/handler"
	"github.com/mereith/nav/logger"
	"github.com/mereith/nav/middleware"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

const INDEX = "index.html"

//go:embed public
var fs embed.FS

type binaryFileSystem struct {
	fs   http.FileSystem
	root string
}

func (b *binaryFileSystem) Open(name string) (http.File, error) {
	openPath := path.Join(b.root, name)
	return b.fs.Open(openPath)
}

func (b *binaryFileSystem) Exists(prefix string, filepath string) bool {
	if p := strings.TrimPrefix(filepath, prefix); len(p) < len(filepath) {
		var name string
		if p == "" {
			name = path.Join(b.root, p, INDEX)
		} else {
			name = path.Join(b.root, p)
		}
		// 判断
		if _, err := b.fs.Open(name); err != nil {
			return false
		}
		return true
	}
	return false
}
func BinaryFileSystem(data embed.FS, root string) *binaryFileSystem {
	fs := http.FS(data)
	return &binaryFileSystem{
		fs,
		root,
	}
}

var port = flag.String("port", "6412", "指定监听端口")
var addr = flag.String("addr", "0.0.0.0", "指定监听地址")

func main() {
	flag.Parse()
	database.InitDB()
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(gzip.Gzip(gzip.DefaultCompression, gzip.WithExcludedExtensions([]string{".png", ".jpg", ".jpeg", ".ico", ".svg"})))
	//router.Use(gzip.Gzip(gzip.DefaultCompression))
	// 嵌入文件夹
	router.GET("/manifest.json", handler.ManifastHanlder)
	router.GET("/sitemap.xml", handler.SitemapHandler)
	router.GET("/robots.txt", handler.RobotsTxtHandler)
	router.GET("/tool/:id", handler.ToolPageHandler)
	router.Use(Serve("/", BinaryFileSystem(fs, "public")))
	api := router.Group("/api")
	{
		// 获取数据的路由
		api.GET("/", handler.GetAllHandler)
		// 获取用户信息

		api.POST("/login", handler.LoginHandler)
		api.GET("/logout", handler.LogoutHandler)
		api.GET("/img", handler.GetLogoImgHandler)
		
		// 获取启用的搜索引擎（公开接口）
		api.GET("/searchEngines", handler.GetEnabledSearchEnginesHandler)

		// 点击追踪（公开接口，无需登录）
		api.POST("/click", handler.RecordClickHandler)

		// 搜索日志（公开接口）
		api.POST("/search", handler.RecordSearchHandler)

		// 工具提交（公开接口）
		api.POST("/submit", handler.AddToolSubmissionHandler)
		
		// 管理员用的
		admin := api.Group("/admin")
		admin.Use(middleware.JWTMiddleware())
		{
			admin.POST("/apiToken", handler.AddApiTokenHandler)
			admin.DELETE("/apiToken/:id", handler.DeleteApiTokenHandler)
			admin.GET("/all", handler.GetAdminAllDataHandler)

			admin.GET("/exportTools", handler.ExportToolsHandler)

			admin.POST("/importTools", handler.ImportToolsHandler)

			admin.PUT("/user", handler.UpdateUserHandler)

			admin.PUT("/setting", handler.UpdateSettingHandler)

			admin.PUT("/siteConfig", handler.UpdateSiteConfigHandler)

			admin.POST("/tool", handler.AddToolHandler)
			admin.DELETE("/tool/:id", handler.DeleteToolHandler)
			admin.PUT("/tool/:id", handler.UpdateToolHandler)
			admin.PUT("/tools/sort", handler.UpdateToolsSortHandler)

			admin.POST("/catelog", handler.AddCatelogHandler)
			admin.DELETE("/catelog/:id", handler.DeleteCatelogHandler)
			admin.PUT("/catelog/:id", handler.UpdateCatelogHandler)
			
			// 搜索引擎管理路由
			admin.GET("/searchEngine", handler.GetAllSearchEnginesHandler)
			admin.POST("/searchEngine", handler.AddSearchEngineHandler)
			admin.PUT("/searchEngine/:id", handler.UpdateSearchEngineHandler)
			admin.DELETE("/searchEngine/:id", handler.DeleteSearchEngineHandler)
			admin.PUT("/searchEngines/sort", handler.UpdateSearchEngineSortHandler)

			// 点击统计（管理员接口）
			admin.GET("/clicks", handler.GetClickStatsHandler)

			// 搜索统计（管理员接口）
			admin.GET("/searches", handler.GetSearchStatsHandler)

			// 工具提交管理
			admin.GET("/submissions", handler.GetToolSubmissionsHandler)
			admin.PUT("/submission/:id", handler.UpdateToolSubmissionStatusHandler)
			admin.DELETE("/submission/:id", handler.DeleteToolSubmissionHandler)

			// Affiliate 管理路由
			admin.GET("/affiliate", handler.GetAllAffiliatesHandler)
			admin.POST("/affiliate", handler.AddAffiliateHandler)
			admin.PUT("/affiliate/:id", handler.UpdateAffiliateHandler)
			admin.DELETE("/affiliate/:id", handler.DeleteAffiliateHandler)
			admin.POST("/affiliate/activate/:id", handler.ActivateAffiliateHandler)
			admin.POST("/affiliate/batch", handler.BatchAddAffiliatesHandler)
		}
	}
	logger.LogInfo("应用启动成功，网址: http://localhost:%s", *port)
	listen := fmt.Sprintf("%s:%s", *addr, *port)
	srv := &http.Server{
		Addr:         listen,
		Handler:      router,
		ReadTimeout:  3 * time.Second, // 可根据实际需要调整
		WriteTimeout: 3 * time.Second, // 可根据实际需要调整
		IdleTimeout:  3 * time.Second, // 建议设置为 10s 或更短
	}

	err := srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		logger.LogError("应用启动失败，错误: %s", err)
	}
}
