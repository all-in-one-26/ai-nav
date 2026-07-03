import {
  Button,
  Card,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Form,
  Input,
  Select,
  Tag,
  message,
  Statistic,
} from "antd";
import { useCallback, useState, useEffect, useMemo } from "react";
import {
  fetchGetAllAffiliates,
  fetchAddAffiliate,
  fetchUpdateAffiliate,
  fetchDeleteAffiliate,
  fetchActivateAffiliate,
  fetchBatchAddAffiliates,
} from "../../../utils/api";
import { useData } from "../hooks/useData";

interface AffiliateRecord {
  id: number;
  toolId: number;
  toolName: string;
  originalUrl: string;
  affiliateUrl: string;
  program: string;
  commission: string;
  platform: string;
  status: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { label: "待申请", value: "pending" },
  { label: "已申请", value: "applied" },
  { label: "已通过", value: "approved" },
  { label: "已激活", value: "active" },
  { label: "已拒绝", value: "rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "default",
  applied: "processing",
  approved: "success",
  active: "blue",
  rejected: "error",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待申请",
  applied: "已申请",
  approved: "已通过",
  active: "已激活",
  rejected: "已拒绝",
};

const PLATFORM_OPTIONS = [
  "impact.com",
  "PartnerStack",
  "ShareASale",
  "CJ Affiliate",
  "FirstPromoter",
  "Direct",
  "Other",
];

export const Affiliate: React.FC = () => {
  const { store } = useData();
  const [affiliates, setAffiliates] = useState<AffiliateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchStr, setSearchStr] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showBatch, setShowBatch] = useState(false);
  const [batchText, setBatchText] = useState("");

  const loadAffiliates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGetAllAffiliates();
      setAffiliates(data || []);
    } catch {
      message.error("加载 Affiliate 数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAffiliates();
  }, [loadAffiliates]);

  const toolOptions = useMemo(() => {
    if (!store?.tools) return [];
    return store.tools.map((t: any) => ({
      label: `${t.name} (ID: ${t.id})`,
      value: t.id,
      name: t.name,
      url: t.url,
    }));
  }, [store?.tools]);

  const handleToolSelect = useCallback(
    (toolId: number, form: any) => {
      const tool = store?.tools?.find((t: any) => t.id === toolId);
      if (tool) {
        form.setFieldsValue({
          toolName: tool.name,
          originalUrl: tool.url,
        });
      }
    },
    [store?.tools]
  );

  const handleAdd = useCallback(
    async (values: any) => {
      setReqLoading(true);
      try {
        await fetchAddAffiliate(values);
        message.success("添加成功");
        setShowAdd(false);
        addForm.resetFields();
        loadAffiliates();
      } catch {
        message.error("添加失败");
      } finally {
        setReqLoading(false);
      }
    },
    [addForm, loadAffiliates]
  );

  const handleUpdate = useCallback(
    async (values: any) => {
      setReqLoading(true);
      try {
        await fetchUpdateAffiliate(values);
        message.success("更新成功");
        setShowEdit(false);
        loadAffiliates();
      } catch {
        message.error("更新失败");
      } finally {
        setReqLoading(false);
      }
    },
    [loadAffiliates]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await fetchDeleteAffiliate(id);
        message.success("删除成功");
        loadAffiliates();
      } catch {
        message.error("删除失败");
      }
    },
    [loadAffiliates]
  );

  const handleActivate = useCallback(
    async (id: number) => {
      try {
        await fetchActivateAffiliate(id);
        message.success("已激活！工具 URL 已替换为 Affiliate 链接");
        loadAffiliates();
      } catch {
        message.error("激活失败");
      }
    },
    [loadAffiliates]
  );

  const filteredData = useMemo(() => {
    return affiliates.filter((a) => {
      const matchSearch =
        !searchStr ||
        a.toolName.toLowerCase().includes(searchStr.toLowerCase()) ||
        a.program.toLowerCase().includes(searchStr.toLowerCase()) ||
        a.platform.toLowerCase().includes(searchStr.toLowerCase());
      const matchStatus = !statusFilter || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [affiliates, searchStr, statusFilter]);

  const stats = useMemo(() => {
    const total = affiliates.length;
    const active = affiliates.filter((a) => a.status === "active").length;
    const approved = affiliates.filter((a) => a.status === "approved").length;
    const pending = affiliates.filter(
      (a) => a.status === "pending" || a.status === "applied"
    ).length;
    return { total, active, approved, pending };
  }, [affiliates]);

  const renderForm = (form: any, isEdit: boolean) => (
    <Form form={form} labelCol={{ span: 5 }}>
      {isEdit && (
        <Form.Item name="id" label="ID" hidden>
          <Input disabled />
        </Form.Item>
      )}
      <Form.Item
        name="toolId"
        label="关联工具"
        rules={[{ required: true, message: "请选择工具" }]}
      >
        <Select
          showSearch
          placeholder="搜索并选择工具"
          options={toolOptions}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(val) => handleToolSelect(val, form)}
        />
      </Form.Item>
      <Form.Item name="toolName" label="工具名称">
        <Input disabled placeholder="自动填充" />
      </Form.Item>
      <Form.Item name="originalUrl" label="原始 URL">
        <Input placeholder="工具原始链接" />
      </Form.Item>
      <Form.Item name="affiliateUrl" label="推广链接">
        <Input placeholder="Affiliate 推广链接" />
      </Form.Item>
      <Form.Item
        name="program"
        label="Affiliate 计划"
        rules={[{ required: true, message: "请填写计划名称" }]}
      >
        <Input placeholder="如: HubSpot Affiliate" />
      </Form.Item>
      <Form.Item name="commission" label="佣金比例">
        <Input placeholder="如: 30% recurring" />
      </Form.Item>
      <Form.Item name="platform" label="平台">
        <Select placeholder="选择平台" allowClear>
          {PLATFORM_OPTIONS.map((p) => (
            <Select.Option key={p} value={p}>
              {p}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="status" label="状态" initialValue="pending">
        <Select options={STATUS_OPTIONS} />
      </Form.Item>
      <Form.Item name="notes" label="备注">
        <Input.TextArea rows={2} placeholder="备注信息" />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      {/* Stats cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card size="small">
          <Statistic title="总计 Affiliate" value={stats.total} />
        </Card>
        <Card size="small">
          <Statistic
            title="已激活"
            value={stats.active}
            valueStyle={{ color: "#1677ff" }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="已通过(待激活)"
            value={stats.approved}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="待处理"
            value={stats.pending}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
      </div>

      {/* Main table */}
      <Card
        title={`Affiliate 管理 (${filteredData.length} 条)`}
        extra={
          <Space>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 120 }}
              options={STATUS_OPTIONS}
              onChange={(v) => setStatusFilter(v || "")}
            />
            <Input.Search
              allowClear
              placeholder="搜索工具/计划/平台"
              style={{ width: 200 }}
              onSearch={(s) => setSearchStr(s.trim())}
            />
            <Button onClick={() => setShowBatch(true)}>
              批量导入
            </Button>
            <Button type="primary" onClick={() => setShowAdd(true)}>
              添加
            </Button>
            <Button onClick={loadAffiliates}>刷新</Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            dataSource={filteredData}
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              defaultPageSize: 10,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1200 }}
          >
            <Table.Column title="ID" dataIndex="id" width={60} />
            <Table.Column
              title="工具"
              dataIndex="toolName"
              width={140}
              render={(name: string, record: AffiliateRecord) => (
                <div>
                  <div style={{ fontWeight: 500 }}>{name}</div>
                  <div
                    style={{ fontSize: 11, color: "#999", marginTop: 2 }}
                  >
                    ID: {record.toolId}
                  </div>
                </div>
              )}
            />
            <Table.Column
              title="Affiliate 计划"
              dataIndex="program"
              width={160}
            />
            <Table.Column
              title="佣金"
              dataIndex="commission"
              width={120}
              render={(v: string) => (
                <span style={{ color: "#52c41a", fontWeight: 500 }}>
                  {v || "-"}
                </span>
              )}
            />
            <Table.Column
              title="平台"
              dataIndex="platform"
              width={120}
              filters={PLATFORM_OPTIONS.map((p) => ({
                text: p,
                value: p,
              }))}
              onFilter={(value: any, record: AffiliateRecord) =>
                record.platform === value
              }
            />
            <Table.Column
              title="状态"
              dataIndex="status"
              width={90}
              render={(s: string) => (
                <Tag color={STATUS_COLORS[s] || "default"}>
                  {STATUS_LABELS[s] || s}
                </Tag>
              )}
            />
            <Table.Column
              title="推广链接"
              dataIndex="affiliateUrl"
              width={200}
              ellipsis
              render={(url: string) =>
                url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12 }}
                  >
                    {url}
                  </a>
                ) : (
                  <span style={{ color: "#ccc" }}>未填写</span>
                )
              }
            />
            <Table.Column
              title="操作"
              width={200}
              render={(_: any, record: AffiliateRecord) => (
                <Space size="small">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      editForm.setFieldsValue(record);
                      setShowEdit(true);
                    }}
                  >
                    编辑
                  </Button>
                  {record.status !== "active" && record.affiliateUrl && (
                    <Popconfirm
                      title="确定激活吗？"
                      description="将用 Affiliate 链接替换工具原始 URL"
                      onConfirm={() => handleActivate(record.id)}
                    >
                      <Button type="link" size="small" style={{ color: "#52c41a" }}>
                        激活
                      </Button>
                    </Popconfirm>
                  )}
                  <Popconfirm
                    title={`确定删除 ${record.toolName} 的 Affiliate 记录吗？`}
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button type="link" size="small" danger>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              )}
            />
          </Table>
        </Spin>
      </Card>

      {/* Add Modal */}
      <Modal
        open={showAdd}
        title="添加 Affiliate"
        onCancel={() => {
          setShowAdd(false);
          addForm.resetFields();
        }}
        destroyOnClose
        onOk={() => addForm.validateFields().then(handleAdd)}
        confirmLoading={reqLoading}
        width={640}
      >
        {renderForm(addForm, false)}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEdit}
        title="编辑 Affiliate"
        onCancel={() => setShowEdit(false)}
        destroyOnClose
        onOk={() => editForm.validateFields().then(handleUpdate)}
        confirmLoading={reqLoading}
        width={640}
      >
        {renderForm(editForm, true)}
      </Modal>

      {/* Batch Import Modal */}
      <Modal
        open={showBatch}
        title="批量导入 Affiliate"
        onCancel={() => { setShowBatch(false); setBatchText(""); }}
        destroyOnClose
        width={700}
        onOk={async () => {
          try {
            const lines = batchText.trim().split("\n").filter(Boolean);
            const items: any[] = [];
            for (const line of lines) {
              const parts = line.split("\t").length > 1 ? line.split("\t") : line.split(",");
              if (parts.length < 2) continue;
              const toolName = parts[0]?.trim();
              const program = parts[1]?.trim() || "";
              const affiliateUrl = parts[2]?.trim() || "";
              const commission = parts[3]?.trim() || "";
              const platform = parts[4]?.trim() || "";
              const tool = store?.tools?.find((t: any) => t.name === toolName);
              items.push({
                toolId: tool?.id || 0,
                toolName,
                originalUrl: tool?.url || "",
                affiliateUrl,
                program,
                commission,
                platform,
                status: "pending",
                notes: "",
              });
            }
            if (items.length === 0) {
              message.warning("没有有效数据");
              return;
            }
            const res = await fetchBatchAddAffiliates(items);
            message.success(res.message || `导入 ${items.length} 条`);
            setShowBatch(false);
            setBatchText("");
            loadAffiliates();
          } catch {
            message.error("批量导入失败");
          }
        }}
        confirmLoading={reqLoading}
      >
        <p style={{ marginBottom: 8, color: "#666", fontSize: 13 }}>
          每行一条记录，字段用 Tab 或逗号分隔：<br />
          <code>工具名称, Affiliate计划, 推广链接, 佣金比例, 平台</code>
        </p>
        <Input.TextArea
          rows={12}
          value={batchText}
          onChange={(e) => setBatchText(e.target.value)}
          placeholder={`ChatGPT\tOpenAI Affiliate\thttps://chat.openai.com/?ref=xxx\t20%\timpact.com\nCanva\tCanva Affiliate\thttps://canva.com/?ref=yyy\t30% recurring\timpact.com`}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
      </Modal>
    </div>
  );
};

export default Affiliate;
