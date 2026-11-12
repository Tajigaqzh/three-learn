import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import mammoth from 'mammoth';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.css';
import './preview.css';

type ConvertResult = {
  fileName: string;
  html: string;
  messages: string[];
};

const MammothDemo = () => {
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Esc 关闭手机预览弹窗
  useEffect(() => {
    if (!mobilePreview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobilePreview(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobilePreview]);

  const convertFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('请选择 .docx 格式的 Word 文档（旧的 .doc 格式不支持，请先在 Word 中另存为 .docx）');
      return;
    }

    setLoading(true);
    try {
      // 浏览器端解析：把 File 读成 ArrayBuffer 交给 mammoth
      const arrayBuffer = await file.arrayBuffer();
      const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer });

      setResult({
        fileName: file.name,
        html,
        // messages 里是转换过程中的警告，比如不支持的样式被忽略了
        messages: messages.map((m) => `${m.type}: ${m.message}`),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败，请确认文件是有效的 .docx 文档');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void convertFile(file);
    },
    [convertFile],
  );

  return (
    <div
      style={{ maxWidth: 860, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Mammoth 演示：docx 转 HTML 富文本</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>
        mammoth 在浏览器端把 .docx 的语义结构（标题、列表、加粗、图片等）转换为干净的 HTML，
        而不是照搬 Word 的视觉样式。
      </p>

      {/* 文件选择区域：点击选择 + 拖拽 */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#1677ff' : '#ccc'}`,
          borderRadius: 8,
          padding: '32px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(22,119,255,0.06)' : '#fafafa',
          transition: 'all .15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void convertFile(file);
            // 允许重复选择同一个文件
            e.target.value = '';
          }}
        />
        <div style={{ fontSize: 32 }}>📄</div>
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            style={{ padding: '6px 20px', cursor: 'pointer' }}
          >
            {loading ? '正在解析…' : '选择 .docx 文件'}
          </button>
          <span style={{ marginLeft: 10, color: '#888' }}>或拖拽文件到此处</span>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: 6,
            color: '#cf1322',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <>
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <strong>{result.fileName}</strong>
            <button
              onClick={() => setShowRaw((v) => !v)}
              style={{ padding: '4px 12px', cursor: 'pointer' }}
            >
              {showRaw ? '查看渲染效果' : '查看原始 HTML'}
            </button>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(result.html);
              }}
              style={{ padding: '4px 12px', cursor: 'pointer' }}
            >
              复制 HTML
            </button>
            <button
              onClick={() => setMobilePreview(true)}
              style={{ padding: '4px 12px', cursor: 'pointer' }}
            >
              移动端预览
            </button>
          </div>

          {result.messages.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', color: '#d46b08' }}>
                {result.messages.length} 条转换警告（可选样式被忽略等）
              </summary>
              <ul style={{ color: '#874d00', fontSize: 13 }}>
                {result.messages.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </details>
          )}

          {showRaw ? (
            <pre
              style={{
                marginTop: 12,
                padding: 16,
                background: '#0d1117',
                color: '#c9d1d9',
                borderRadius: 8,
                overflow: 'auto',
                maxHeight: 600,
                fontSize: 13,
              }}
            >
              {result.html}
            </pre>
          ) : (
            // 渲染 mammoth 生成的富文本。
            // mammoth 输出的标签都是白名单内的语义标签（p/h1-h6/ul/table/img...），
            // 图片以 base64 data URI 内联，这里可以安全地注入。
            <div
              className="mammoth-preview"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: mammoth 输出语义化标签，风险可控
              dangerouslySetInnerHTML={{ __html: result.html }}
              style={{
                marginTop: 12,
                padding: '16px 24px',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                background: '#fff',
                lineHeight: 1.8,
              }}
            />
          )}
        </>
      )}

      {/* 手机仿真机预览弹窗 */}
      {mobilePreview && result && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          {/* 点击空白处关闭：用透明按钮承载，保证键盘可达 */}
          <button
            type="button"
            aria-label="关闭预览"
            onClick={() => setMobilePreview(false)}
            style={{
              position: 'absolute',
              inset: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'default',
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* iPhone X 外壳，缩放到 80% 放进弹窗 */}
            <DeviceFrameset device="iPhone X" zoom={0.8} width={375} height={812}>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                }}
              >
                {/* 模拟 App 内协议页导航栏 */}
                <div
                  style={{
                    paddingTop: 44, // 让出状态栏/刘海
                    paddingBottom: 10,
                    textAlign: 'center',
                    fontWeight: 600,
                    borderBottom: '1px solid #f0f0f0',
                    background: '#fff',
                  }}
                >
                  {result.fileName.replace(/\.docx$/i, '')}
                </div>
                {/* 协议正文：富文本编辑器里的全部内容 */}
                <div
                  className="mammoth-preview mammoth-preview--mobile"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: mammoth 输出语义化标签，风险可控
                  dangerouslySetInnerHTML={{ __html: result.html }}
                  style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', lineHeight: 1.7 }}
                />
              </div>
            </DeviceFrameset>
            <button
              onClick={() => setMobilePreview(false)}
              style={{
                padding: '6px 24px',
                cursor: 'pointer',
                color: '#fff',
                borderColor: '#888',
                background: 'rgba(255,255,255,0.15)',
              }}
            >
              关闭（Esc）
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MammothDemo;
