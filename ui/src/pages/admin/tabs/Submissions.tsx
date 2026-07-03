import { Button, Card, Popconfirm, Space, Spin, Statistic, Table, Tag, message } from "antd";
import { useCallback, useState, useEffect, useMemo } from "react";
import { fetchGetSubmissions, fetchUpdateSubmissionStatus, fetchDeleteSubmission, fetchAddTool } from "../../../utils/api";

interface Submission {
  id: number;
  name: string;
  url: string;
  desc: string;
  catelog: string;
  email: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "default",
  approved: "success",
  rejected: "error",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

export const Submissions: React.FC = () => {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGetSubmissions();
      setData(res || []);
    } catch {
      message.error("加载提交数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    total: data.length,
    pending: data.filter((d) => d.status === "pending").length,
    approved: data.filter((d) => d.status === "approved").length,
    rejected: data.filter((d) => d.status === "rejected").length,
  }), [data]);

  const handleApprove = useCallback(async (record: Submission) => {
    try {
      await fetchAddTool({ name: record.name, url: record.url, desc: record.desc, catelog: record.catelog, logo: "" });
      await fetchUpdateSubmissionStatus(record.id, "approved");
      message.success(`${record.name} 已通过并添加为工具`);
      load();
    } catch {
      message.error("审批失败");
    }
  }, [load]);

  const handleReject = useCallback(async (id: number) => {
    try {
      await fetchUpdateSubmissionStatus(id, "rejected");
      message.success("已拒绝");
      load();
    } catch {
      message.error("操作失败");
    }
  }, [load]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await fetchDeleteSubmission(id);
      message.success("已删除");
      load();
    } catch {
      message.error("删除失败");
    }
  }, [load]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        <Card size="small"><Statistic title="总提交数" value={stats.total} /></Card>
        <Card size="small"><Statistic title="待审核" value={stats.pending} valueStyle={{ color: "#faad14" }} /></Card>
        <Card size="small"><Statistic title="已通过" value={stats.approved} valueStyle={{ color: "#52c41a" }} /></Card>
        <Card size="small"><Statistic title="已拒绝" value={stats.rejected} valueStyle={{ color: "#ff4d4f" }} /></Card>
      </div>
      <Card title="工具提交审核">
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            dataSource={data}
            scroll={{ x: 1200 }}
            pagination={{ showSizeChanger: true, defaultPageSize: 20, showTotal: (total) => `共 ${total} 条` }}
          >
            <Table.Column title="ID" dataIndex="id" width={50} />
            <Table.Column title="工具名称" dataIndex="name" width={120} render={(v: string) => <span style={{ fontWeight: 500 }}>{v}</span>} />
            <Table.Column title="URL" dataIndex="url" width={150} ellipsis render={(v: string) => <a href={v} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>{v}</a>} />
            <Table.Column title="描述" dataIndex="desc" width={160} ellipsis />
            <Table.Column title="分类" dataIndex="catelog" width={80} />
            <Table.Column title="邮箱" dataIndex="email" width={140} ellipsis />
            <Table.Column title="状态" dataIndex="status" width={80} render={(s: string) => <Tag color={STATUS_COLORS[s] || "default"}>{STATUS_LABELS[s] || s}</Tag>} />
            <Table.Column title="提交时间" dataIndex="createdAt" width={140} render={(v: string) => v?.replace("T", " ").slice(0, 16)} />
            <Table.Column
              title="操作"
              width={180}
              fixed="right"
              render={(_: any, record: Submission) => (
                <Space size="small">
                  {record.status === "pending" && (
                    <>
                      <Popconfirm title="通过审核并添加为工具？" onConfirm={() => handleApprove(record)}>
                        <Button type="link" size="small" style={{ color: "#52c41a" }}>通过</Button>
                      </Popconfirm>
                      <Popconfirm title="拒绝此提交？" onConfirm={() => handleReject(record.id)}>
                        <Button type="link" size="small" danger>拒绝</Button>
                      </Popconfirm>
                    </>
                  )}
                  <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
                    <Button type="link" size="small" danger>删除</Button>
                  </Popconfirm>
                </Space>
              )}
            />
          </Table>
        </Spin>
      </Card>
    </div>
  );
};

export default Submissions;
