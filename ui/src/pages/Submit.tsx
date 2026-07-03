import { useState } from "react";
import { Button, Form, Input, Select, message, Card, Result } from "antd";
import { fetchSubmitTool } from "../utils/api";
import { Link } from "react-router-dom";

const Submit: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await fetchSubmitTool(values);
      setSubmitted(true);
    } catch {
      message.error("提交失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5", padding: 20 }}>
        <Card style={{ maxWidth: 600, width: "100%" }}>
          <Result
            status="success"
            title="提交成功！"
            subTitle="您提交的工具将在审核后上线，感谢推荐！"
            extra={[
              <Link to="/" key="home"><Button type="primary">返回首页</Button></Link>,
              <Button key="again" onClick={() => { setSubmitted(false); form.resetFields(); }}>继续提交</Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5", padding: 20 }}>
      <Card
        title={<span style={{ fontSize: 20 }}>提交 AI 工具</span>}
        style={{ maxWidth: 600, width: "100%" }}
        extra={<Link to="/" style={{ fontSize: 13 }}>返回首页</Link>}
      >
        <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
          发现了好用的 AI 工具？推荐给大家吧！提交后将由管理员审核。
        </p>
        <Form form={form} labelCol={{ span: 5 }} onFinish={handleSubmit}>
          <Form.Item name="name" label="工具名称" rules={[{ required: true, message: "请填写工具名称" }]}>
            <Input placeholder="如: ChatGPT" />
          </Form.Item>
          <Form.Item name="url" label="工具网址" rules={[{ required: true, message: "请填写工具网址" }, { type: "url", message: "请输入有效的URL" }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="desc" label="工具简介" rules={[{ required: true, message: "请填写简介" }]}>
            <Input.TextArea rows={3} placeholder="简要描述这个工具的功能和特点" maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="catelog" label="分类">
            <Input placeholder="如: AI对话、AI写作、AI绘画" />
          </Form.Item>
          <Form.Item name="email" label="联系邮箱">
            <Input placeholder="可选，方便我们联系您" />
          </Form.Item>
          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ width: 200 }}>
              提交推荐
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Submit;
