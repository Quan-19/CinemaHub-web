import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";
import { sanitizeArticleHtml } from "../../../utils/articleContent";

const CATEGORY_OPTIONS = [
  { value: "promotion", label: "Khuyến mãi" },
  { value: "gift", label: "Quà tặng" },
  { value: "news", label: "Tin mới" },
  { value: "event", label: "Sự kiện" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Đã đăng" },
  { value: "draft", label: "Bản nháp" },
];

const toDateInputValue = (value) => {
  if (!value) return "";
  const raw = String(value);
  return raw.includes("T") ? raw.split("T")[0] : raw;
};

const buildInitialForm = (editingItem, defaultAuthor) => {
  if (editingItem) {
    return {
      title: editingItem.title || "",
      content: editingItem.content || "",
      image: editingItem.image || "",
      category: editingItem.category || "promotion",
      author: editingItem.author || defaultAuthor || "",
      status: editingItem.status || "draft",
      publish_date: toDateInputValue(editingItem.publish_date),
    };
  }

  return {
    title: "",
    content: "",
    image: "",
    category: "promotion",
    author: defaultAuthor || "",
    status: "draft",
    publish_date: "",
  };
};

export default function ArticleModal({
  show,
  onClose,
  onSave,
  editingItem,
  defaultAuthor,
}) {
  const [form, setForm] = useState(() =>
    buildInitialForm(editingItem, defaultAuthor)
  );
  const [errors, setErrors] = useState({});
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [linkDraft, setLinkDraft] = useState({ text: "", url: "" });
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    orderedList: false,
    unorderedList: false,
    block: "p",
  });
  const modalBodyRef = useRef(null);
  const contentRef = useRef(null);
  const selectionRef = useRef(null);
  const imageInputRef = useRef(null);
  const [imageName, setImageName] = useState("");

  useEffect(() => {
    if (show) {
      setForm(buildInitialForm(editingItem, defaultAuthor));
      setErrors({});
      setImageName("");
      setShowLinkEditor(false);
      setLinkDraft({ text: "", url: "" });
    }
  }, [show, editingItem, defaultAuthor]);

  useEffect(() => {
    if (!show) return;
    if (!contentRef.current) return;
    const nextHtml = form.content || "";
    if (contentRef.current.innerHTML !== nextHtml) {
      contentRef.current.innerHTML = nextHtml;
    }
  }, [show, form.content]);

  const updateFormatState = useCallback(() => {
    if (!contentRef.current) return;
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;
    if (!contentRef.current.contains(selection.anchorNode)) return;

    const blockValue = document.queryCommandValue("formatBlock") || "p";
    const normalizedBlock = String(blockValue)
      .replace(/[<>]/g, "")
      .toLowerCase();
    const block =
      normalizedBlock === "normal" || normalizedBlock === "body"
        ? "p"
        : normalizedBlock;

    setFormatState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      orderedList: document.queryCommandState("insertOrderedList"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      block: block || "p",
    });
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      updateFormatState();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateFormatState]);

  useEffect(() => {
    if (!show) return;
    setTimeout(() => updateFormatState(), 0);
  }, [show, updateFormatState]);

  const isParagraph =
    formatState.block === "p" || formatState.block === "div" || !formatState.block;

  const toolbarButtonClass = (active) =>
    `p-2 rounded-md transition-colors ${
      active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/10"
    }`;

  const toolbarTextButtonClass = (active) =>
    `px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
      active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/10"
    }`;

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề";
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const rawHtml = contentRef.current?.innerHTML ?? form.content;
    const cleanedHtml = sanitizeArticleHtml(rawHtml, { withClasses: false });

    onSave({
      ...form,
      title: form.title.trim(),
      content: cleanedHtml.trim(),
      image: form.image,
      author: form.author.trim(),
    });
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0).cloneRange();
    if (
      contentRef.current &&
      !contentRef.current.contains(range.commonAncestorContainer)
    ) {
      return;
    }
    selectionRef.current = range;
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selectionRef.current) return;
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const syncContentState = () => {
    if (!contentRef.current) return;
    const nextHtml = contentRef.current.innerHTML;
    setForm((prev) => ({ ...prev, content: nextHtml }));
  };

  const applyCommand = (command, value = null) => {
    if (!contentRef.current) return;
    contentRef.current.focus();
    saveSelection();
    restoreSelection();
    document.execCommand(command, false, value);
    syncContentState();
    saveSelection();
    updateFormatState();
  };

  const insertHtmlAtSelection = (html) => {
    if (!contentRef.current) return;
    const scrollTop = modalBodyRef.current?.scrollTop ?? null;

    let range = selectionRef.current;
    if (!range) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }
    }

    if (!range || !contentRef.current.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
    }

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const inserted = document.execCommand("insertHTML", false, html);

    if (!inserted) {
      const template = document.createElement("template");
      template.innerHTML = html;
      const fragment = template.content;
      const lastNode = fragment.lastChild;

      range.deleteContents();
      range.insertNode(fragment);

      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
    }

    syncContentState();
    updateFormatState();

    if (modalBodyRef.current && scrollTop !== null) {
      requestAnimationFrame(() => {
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTop = scrollTop;
        }
      });
    }
  };

  const ensureDefaultFormatting = () => {
    if (!contentRef.current) return;
    const text = (contentRef.current.textContent || "").trim();
    if (text.length > 0) return;

    const blockValue = String(
      document.queryCommandValue("formatBlock") || "p"
    )
      .replace(/[<>]/g, "")
      .toLowerCase();
    const normalizedBlock =
      blockValue === "normal" || blockValue === "body" ? "p" : blockValue;

    if (normalizedBlock !== "p") {
      document.execCommand("formatBlock", false, "<p>");
    }
    if (document.queryCommandState("bold")) {
      document.execCommand("bold", false);
    }
    if (document.queryCommandState("italic")) {
      document.execCommand("italic", false);
    }
    if (document.queryCommandState("underline")) {
      document.execCommand("underline", false);
    }
    updateFormatState();
  };

  const toggleInlineStyle = (command) => {
    if (!contentRef.current) return;
    contentRef.current.focus();
    saveSelection();
    restoreSelection();
    const shouldClearAll =
      formatState.bold && formatState.italic && formatState.underline;
    if (shouldClearAll) {
      document.execCommand("bold", false);
      document.execCommand("italic", false);
      document.execCommand("underline", false);
    } else {
      document.execCommand(command, false);
    }
    syncContentState();
    saveSelection();
    updateFormatState();
  };

  const handleHeading = (level) => {
    if (formatState.block === `h${level}`) {
      applyCommand("formatBlock", "<p>");
      return;
    }
    applyCommand("formatBlock", `<h${level}>`);
  };

  const handleParagraph = () => {
    applyCommand("formatBlock", "<p>");
  };

  const findClosestBlockquote = (node) => {
    if (!node) return null;
    let current = node.nodeType === 1 ? node : node.parentElement;
    while (current && current !== contentRef.current) {
      if (current.tagName?.toLowerCase() === "blockquote") return current;
      current = current.parentElement;
    }
    return null;
  };

  const unwrapBlockquote = (blockquote) => {
    const parent = blockquote.parentNode;
    if (!parent) return null;
    const firstChild = blockquote.firstChild;
    const lastChild = blockquote.lastChild;
    const fragment = document.createDocumentFragment();
    while (blockquote.firstChild) {
      fragment.appendChild(blockquote.firstChild);
    }
    parent.insertBefore(fragment, blockquote);
    parent.removeChild(blockquote);
    return { firstChild, lastChild };
  };

  const handleBlockquote = () => {
    if (!contentRef.current) return;
    contentRef.current.focus();
    saveSelection();

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode || selectionRef.current?.startContainer;
    const blockquote = findClosestBlockquote(anchorNode);

    if (blockquote) {
      const moved = unwrapBlockquote(blockquote);
      if (selection && moved?.lastChild) {
        const range = document.createRange();
        if (moved.lastChild.nodeType === Node.TEXT_NODE) {
          const offset = moved.lastChild.textContent?.length || 0;
          range.setStart(moved.lastChild, offset);
          range.setEnd(moved.lastChild, offset);
        } else {
          range.selectNodeContents(moved.lastChild);
          range.collapse(false);
        }
        selection.removeAllRanges();
        selection.addRange(range);
      }
      syncContentState();
      saveSelection();
      updateFormatState();
      return;
    }

    applyCommand("formatBlock", "<blockquote>");
  };

  const openLinkEditor = () => {
    if (!contentRef.current) return;
    const selection = window.getSelection();
    const inEditor =
      selection &&
      selection.rangeCount > 0 &&
      contentRef.current.contains(selection.anchorNode);

    if (inEditor) {
      saveSelection();
    } else {
      contentRef.current.focus();
      saveSelection();
    }

    const selectedText = inEditor && selection ? selection.toString() : "";
    setLinkDraft({ text: selectedText, url: "" });
    setShowLinkEditor(true);
  };

  const closeLinkEditor = () => {
    setShowLinkEditor(false);
    setLinkDraft({ text: "", url: "" });
    setTimeout(() => contentRef.current?.focus(), 0);
  };

  const handleInsertLink = () => {
    const rawUrl = linkDraft.url.trim();
    if (!rawUrl) {
      toast.error("Vui lòng nhập liên kết");
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${rawUrl}`;
    const text = (linkDraft.text || normalizedUrl).trim();
    const snippet = `<a href="${normalizedUrl}" target="_blank" rel="noreferrer">${text}</a>`;
    insertHtmlAtSelection(snippet);
    setShowLinkEditor(false);
    setLinkDraft({ text: "", url: "" });
  };

  const handleContentKeyDown = (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      toggleInlineStyle("bold");
      return;
    }
    if (key === "i") {
      event.preventDefault();
      toggleInlineStyle("italic");
      return;
    }
    if (key === "u") {
      event.preventDefault();
      toggleInlineStyle("underline");
      return;
    }
    if (key === "k") {
      event.preventDefault();
      openLinkEditor();
    }
  };

  const handleEditorInput = () => {
    syncContentState();
    saveSelection();
    updateFormatState();
  };

  const plainText = useMemo(() => {
    const html = form.content || "";
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [form.content]);

  const wordCount = plainText ? plainText.split(" ").length : 0;
  const charCount = plainText.length;

  if (!show) return null;

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File ảnh quá lớn! Tối đa 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, image: reader.result }));
        setImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePickImage = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
      imageInputRef.current.click();
    }
  };

  const handleClearImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    setImageName("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-cinema-surface rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-red-500" />
            {editingItem ? "Cập nhật bài viết" : "Thêm bài viết"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div
          ref={modalBodyRef}
          className="px-6 py-5 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Tiêu đề bài viết
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className={`mt-2 w-full rounded-lg bg-zinc-900 border px-3 py-2 text-white focus:outline-none focus:border-red-500 ${
                    errors.title ? "border-red-500" : "border-white/10"
                  }`}
                  placeholder="Nhập tiêu đề"
                />
                {errors.title ? (
                  <p className="text-xs text-red-400 mt-1">{errors.title}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Nội dung chi tiết
                </label>
                <div className="mt-2 rounded-lg border border-white/10 bg-zinc-900/50">
                  <div className="sticky top-0 z-10 border-b border-white/10 bg-zinc-900/90 backdrop-blur">
                    <div className="flex flex-wrap items-center gap-2 px-2 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => toggleInlineStyle("bold")}
                        className={toolbarButtonClass(formatState.bold)}
                        title="Đậm (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => toggleInlineStyle("italic")}
                        className={toolbarButtonClass(formatState.italic)}
                        title="Nghiêng (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => toggleInlineStyle("underline")}
                        className={toolbarButtonClass(formatState.underline)}
                        title="Gạch chân (Ctrl+U)"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleHeading(2)}
                        className={toolbarTextButtonClass(formatState.block === "h2")}
                        title="Tiêu đề lớn"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleHeading(3)}
                        className={toolbarTextButtonClass(formatState.block === "h3")}
                        title="Tiêu đề vừa"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleParagraph}
                        className={toolbarTextButtonClass(isParagraph)}
                        title="Đoạn văn"
                      >
                        P
                      </button>
                      <div className="h-5 w-px bg-white/10" />
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleBlockquote}
                        className={toolbarButtonClass(formatState.block === "blockquote")}
                        title="Trích dẫn"
                      >
                        <Quote className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyCommand("insertUnorderedList")}
                        className={toolbarButtonClass(formatState.unorderedList)}
                        title="Danh sách"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyCommand("insertOrderedList")}
                        className={toolbarButtonClass(formatState.orderedList)}
                        title="Danh sách số"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <div className="h-5 w-px bg-white/10" />
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={openLinkEditor}
                        className={toolbarButtonClass(false)}
                        title="Chèn liên kết (Ctrl+K)"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>

                      <div className="ml-auto flex flex-wrap items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          {wordCount} từ • {charCount} ký tự
                        </span>
                      </div>
                    </div>

                    {showLinkEditor ? (
                      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-zinc-900/60 px-3 py-2">
                        <input
                          value={linkDraft.text}
                          onChange={(event) =>
                            setLinkDraft((prev) => ({
                              ...prev,
                              text: event.target.value,
                            }))
                          }
                          className="flex-1 min-w-[160px] rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                          placeholder="Nội dung hiển thị"
                        />
                        <input
                          value={linkDraft.url}
                          onChange={(event) =>
                            setLinkDraft((prev) => ({
                              ...prev,
                              url: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleInsertLink();
                            }
                          }}
                          className="flex-[1.2] min-w-[200px] rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={handleInsertLink}
                          className="px-3 py-1 rounded-md bg-red-600 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Chèn
                        </button>
                        <button
                          type="button"
                          onClick={closeLinkEditor}
                          className="px-3 py-1 rounded-md bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="relative min-h-[240px]">
                    {!plainText ? (
                      <p className="pointer-events-none absolute top-3 left-3 text-sm text-zinc-500">
                        Bắt đầu gõ nội dung... (bôi đen để định dạng)
                      </p>
                    ) : null}
                    <div
                      ref={contentRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      onKeyDown={handleContentKeyDown}
                      onKeyUp={saveSelection}
                      onMouseUp={saveSelection}
                      onFocus={() => {
                        saveSelection();
                        setTimeout(() => ensureDefaultFormatting(), 0);
                      }}
                      onClick={saveSelection}
                      onBlur={syncContentState}
                      className="article-richtext min-h-[240px] px-3 py-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-2 rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-400">
                  <p className="text-zinc-300 font-semibold mb-1">Hướng dẫn nhanh</p>
                  <p>1. Bôi đen đoạn cần định dạng, sau đó chọn nút trên thanh công cụ.</p>
                  <p>2. Bấm lại định dạng để tắt. Ctrl+B/I/U để định dạng nhanh.</p>
                  <p>3. Dùng H2/H3 cho tiêu đề, P để quay về đoạn văn thường.</p>
                  <p>4. Ctrl+K để chèn liên kết.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Danh mục
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  className="mt-2 w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Tác giả
                </label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    value={form.author}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, author: e.target.value }))
                    }
                    className="w-full rounded-lg bg-zinc-900 border border-white/10 pl-9 pr-3 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="Marketing"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Ảnh minh họa
                </label>
                <div className="mt-2 rounded-lg border border-white/10 bg-zinc-900/40 p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePickImage}
                      className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white"
                    >
                      Chọn ảnh
                    </button>
                    <span className="text-xs text-zinc-400 truncate">
                      {imageName || "Chưa chọn ảnh"}
                    </span>
                    {form.image ? (
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="ml-auto text-xs text-red-400 hover:text-red-300"
                      >
                        Xóa ảnh
                      </button>
                    ) : null}
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <div className="h-36 w-full rounded-lg border border-white/10 bg-zinc-900/60 flex items-center justify-center overflow-hidden">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Ảnh minh họa"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-500 text-xs">
                        <ImageIcon className="w-5 h-5" />
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Ngày đăng
                </label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="date"
                    value={form.publish_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, publish_date: e.target.value }))
                    }
                    className="w-full rounded-lg bg-zinc-900 border border-white/10 pl-9 pr-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                  className="mt-2 w-full rounded-lg bg-zinc-900 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 h-10 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-10 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            {editingItem ? "Lưu" : "Đăng"}
          </button>
        </div>
      </div>
    </div>
  );
}
