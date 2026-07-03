import { Card, Spin, Statistic, Table, Tag, Tabs } from "antd";
import { useCallback, useState, useEffect, useMemo } from "react";
import { fetchClickStats, fetchSearchStats } from "../../../utils/api";

interface ClickStat {
  toolId: number;
  toolName: string;
  clicks: number;
  today: number;
  week: number;
}

interface SearchStat {
  query: string;
  count: number;
  today: number;
  week: number;
  avgResults: number;
}

const ClickPanel: React.FC = () => {
  const [stats, setStats] = useState<ClickStat[]>([]);
  const [totals, setTotals] = useState({ total: 0, today: 0, week: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClickStats();
      setStats(data.stats || []);
      setTotals({
        total: data.total || 0,
        today: data.today || 0,
        week: data.week || 0,
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toolCount = useMemo(() => new Set(stats.map((s) => s.toolId)).size, [stats]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <Card size="small"><Statistic title="总点击量" value={totals.total} /></Card>
        <Card size="small"><Statistic title="今日点击" value={totals.today} valueStyle={{ color: "#1677ff" }} /></Card>
        <Card size="small"><Statistic title="本周点击" value={totals.week} valueStyle={{ color: "#52c41a" }} /></Card>
        <Card size="small"><Statistic title="被点击工具数" value={toolCount} valueStyle={{ color: "#faad14" }} /></Card>
      </div>
      <Card title="工具点击排行">
        <Spin spinning={loading}>
          <Table rowKey="toolId" dataSource={stats} pagination={{ showSizeChanger: true, pageSizeOptions: ["20", "50", "100"], defaultPageSize: 20, showTotal: (total) => `共 ${total} 个工具` }}>
            <Table.Column title="排名" width={70} render={(_: any, __: any, index: number) => (
              <span style={{ fontWeight: index < 3 ? 700 : 400, color: index < 3 ? "#faad14" : undefined, fontSize: index < 3 ? 16 : 14 }}>{index + 1}</span>
            )} />
            <Table.Column title="工具名称" dataIndex="toolName" width={200} />
            <Table.Column title="总点击" dataIndex="clicks" width={120} sorter={(a: ClickStat, b: ClickStat) => a.clicks - b.clicks} defaultSortOrder="descend" render={(v: number) => <span style={{ fontWeight: 500 }}>{v}</span>} />
            <Table.Column title="今日" dataIndex="today" width={100} sorter={(a: ClickStat, b: ClickStat) => a.today - b.today} render={(v: number) => v > 0 ? <Tag color="blue">{v}</Tag> : <span style={{ color: "#ccc" }}>0</span>} />
            <Table.Column title="本周" dataIndex="week" width={100} sorter={(a: ClickStat, b: ClickStat) => a.week - b.week} render={(v: number) => v > 0 ? <Tag color="green">{v}</Tag> : <span style={{ color: "#ccc" }}>0</span>} />
          </Table>
        </Spin>
      </Card>
    </div>
  );
};

const SearchPanel: React.FC = () => {
  const [stats, setStats] = useState<SearchStat[]>([]);
  const [totals, setTotals] = useState({ total: 0, today: 0, week: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSearchStats();
      setStats(data.stats || []);
      setTotals({ total: data.total || 0, today: data.today || 0, week: data.week || 0 });
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <Card size="small"><Statistic title="总搜索次数" value={totals.total} /></Card>
        <Card size="small"><Statistic title="今日搜索" value={totals.today} valueStyle={{ color: "#1677ff" }} /></Card>
        <Card size="small"><Statistic title="本周搜索" value={totals.week} valueStyle={{ color: "#52c41a" }} /></Card>
        <Card size="small"><Statistic title="独立关键词数" value={stats.length} valueStyle={{ color: "#faad14" }} /></Card>
      </div>
      <Card title="搜索关键词排行">
        <Spin spinning={loading}>
          <Table rowKey="query" dataSource={stats} pagination={{ showSizeChanger: true, pageSizeOptions: ["20", "50", "100"], defaultPageSize: 20, showTotal: (total) => `共 ${total} 个关键词` }}>
            <Table.Column title="排名" width={70} render={(_: any, __: any, index: number) => (
              <span style={{ fontWeight: index < 3 ? 700 : 400, color: index < 3 ? "#faad14" : undefined, fontSize: index < 3 ? 16 : 14 }}>{index + 1}</span>
            )} />
            <Table.Column title="搜索关键词" dataIndex="query" width={200} render={(v: string) => <span style={{ fontWeight: 500 }}>{v}</span>} />
            <Table.Column title="搜索次数" dataIndex="count" width={120} sorter={(a: SearchStat, b: SearchStat) => a.count - b.count} defaultSortOrder="descend" />
            <Table.Column title="平均结果数" dataIndex="avgResults" width={120} render={(v: number) => <span style={{ color: v === 0 ? "#ff4d4f" : undefined }}>{v?.toFixed(1) || "0"}</span>} />
            <Table.Column title="今日" dataIndex="today" width={100} sorter={(a: SearchStat, b: SearchStat) => a.today - b.today} render={(v: number) => v > 0 ? <Tag color="blue">{v}</Tag> : <span style={{ color: "#ccc" }}>0</span>} />
            <Table.Column title="本周" dataIndex="week" width={100} sorter={(a: SearchStat, b: SearchStat) => a.week - b.week} render={(v: number) => v > 0 ? <Tag color="green">{v}</Tag> : <span style={{ color: "#ccc" }}>0</span>} />
          </Table>
        </Spin>
      </Card>
    </div>
  );
};

export const Analytics: React.FC = () => {
  return (
    <Tabs
      defaultActiveKey="clicks"
      items={[
        { key: "clicks", label: "点击分析", children: <ClickPanel /> },
        { key: "searches", label: "搜索分析", children: <SearchPanel /> },
      ]}
    />
  );
};

export default Analytics;
