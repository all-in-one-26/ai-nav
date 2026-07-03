package types

// 默认是 0
type Setting struct {
	Id                   int    `json:"id"`
	Favicon              string `json:"favicon"`
	Title                string `json:"title"`
	GovRecord            string `json:"govRecord"`
	Logo192              string `json:"logo192"`
	Logo512              string `json:"logo512"`
	HideAdmin            bool   `json:"hideAdmin"`
	HideGithub           bool   `json:"hideGithub"`
	HideToggleJumpTarget bool   `json:"hideToggleJumpTarget"`
	JumpTargetBlank      bool   `json:"jumpTargetBlank"`
}

type Token struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Value    string `json:"value"`
	Disabled int    `json:"disabled"`
}

type User struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Password string `json:"password"`
}
type Img struct {
	Id    int    `json:"id"`
	Url   string `json:"url"`
	Value string `json:"value"`
}

type Tool struct {
	Id      int    `json:"id"`
	Name    string `json:"name"`
	Url     string `json:"url"`
	Logo    string `json:"logo"`
	Catelog string `json:"catelog"`
	Desc    string `json:"desc"`
	Sort    int    `json:"sort"`
	Hide    bool   `json:"hide"`
}

type Catelog struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
	Sort int    `json:"sort"`
	Hide bool   `json:"hide"`
}

// 搜索引擎模型
type SearchEngine struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	BaseUrl     string `json:"baseUrl"`
	QueryParam  string `json:"queryParam"`
	Logo        string `json:"logo"`
	Sort        int    `json:"sort"`
	Enabled     bool   `json:"enabled"`
}

// 网站配置模型
type SiteConfig struct {
	Id          int  `json:"id"`
	NoImageMode bool `json:"noImageMode"`
	CompactMode bool `json:"compactMode"`
}

type ClickEvent struct {
	Id        int    `json:"id"`
	ToolId    int    `json:"toolId"`
	ToolName  string `json:"toolName"`
	Url       string `json:"url"`
	Referrer  string `json:"referrer"`
	UserAgent string `json:"userAgent"`
	Ip        string `json:"ip"`
	CreatedAt string `json:"createdAt"`
}

type ClickStats struct {
	ToolId    int    `json:"toolId"`
	ToolName  string `json:"toolName"`
	Clicks    int    `json:"clicks"`
	Today     int    `json:"today"`
	Week      int    `json:"week"`
}

type Affiliate struct {
	Id           int    `json:"id"`
	ToolId       int    `json:"toolId"`
	ToolName     string `json:"toolName"`
	OriginalUrl  string `json:"originalUrl"`
	AffiliateUrl string `json:"affiliateUrl"`
	Program      string `json:"program"`
	Commission   string `json:"commission"`
	Platform     string `json:"platform"`
	Status       string `json:"status"`
	Notes        string `json:"notes"`
}

type SearchLog struct {
	Id        int    `json:"id"`
	Query     string `json:"query"`
	Results   int    `json:"results"`
	Ip        string `json:"ip"`
	CreatedAt string `json:"createdAt"`
}

type SearchStats struct {
	Query   string `json:"query"`
	Count   int    `json:"count"`
	Today   int    `json:"today"`
	Week    int    `json:"week"`
	AvgResults float64 `json:"avgResults"`
}

type ToolSubmission struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	Url       string `json:"url"`
	Desc      string `json:"desc"`
	Catelog   string `json:"catelog"`
	Email     string `json:"email"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
}
