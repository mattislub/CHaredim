import { useEffect, useMemo, useRef, useState } from "react";

const buildDefaultPost = (post, mode) => {
  if (post) {
    return {
      title: post.title ?? "",
      excerpt: post.excerpt ?? "",
      category: post.category ?? "חדשות",
      imageUrl: post.featured_image_url ?? "",
      publishedAt: post.published_at ?? "",
      summary: post.summary ?? post.excerpt ?? "",
      content: Array.isArray(post.body) ? post.body.join("\n\n") : post.content,
    };
  }

  if (mode === "create") {
    return {
      title: "",
      excerpt: "",
      category: "חדשות",
      imageUrl: "",
      publishedAt: new Date().toISOString().slice(0, 10),
      summary: "",
      content: "",
    };
  }

  return null;
};

export default function AdminPostEditPage({
  post,
  isLoading,
  mode = "edit",
  onBack,
}) {
  const resolvedPost = useMemo(() => buildDefaultPost(post, mode), [post, mode]);
  const [currentStep, setCurrentStep] = useState(0);
  const [titleValue, setTitleValue] = useState(resolvedPost?.title ?? "");
  const [summaryValue, setSummaryValue] = useState(resolvedPost?.summary ?? "");
  const [excerptValue, setExcerptValue] = useState(resolvedPost?.excerpt ?? "");
  const [categoryValue, setCategoryValue] = useState(
    resolvedPost?.category ?? "חדשות"
  );
  const [publishedAtValue, setPublishedAtValue] = useState(
    resolvedPost?.publishedAt?.slice(0, 10) ?? ""
  );
  const [contentType, setContentType] = useState("text");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoFileName, setVideoFileName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState(resolvedPost?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(
    resolvedPost?.imageUrl ?? ""
  );
  const [imageFileName, setImageFileName] = useState("");
  const [content, setContent] = useState(resolvedPost?.content ?? "");
  const contentRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    setImageUrl(resolvedPost?.imageUrl ?? "");
    setImagePreview(resolvedPost?.imageUrl ?? "");
    setImageFileName("");
    setContent(resolvedPost?.content ?? "");
    setTitleValue(resolvedPost?.title ?? "");
    setSummaryValue(resolvedPost?.summary ?? "");
    setExcerptValue(resolvedPost?.excerpt ?? "");
    setCategoryValue(resolvedPost?.category ?? "חדשות");
    setPublishedAtValue(resolvedPost?.publishedAt?.slice(0, 10) ?? "");
    setContentType("text");
    setGalleryFiles([]);
    setVideoFileName("");
    setYoutubeUrl("");
    if (mode === "create") {
      setCurrentStep(0);
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [mode, resolvedPost]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    []
  );

  if (isLoading) {
    return (
      <section className="admin-post-edit">
        <div className="admin-post-edit__layout">
          <p className="admin-post-edit__status">טוען את פרטי הפוסט...</p>
        </div>
      </section>
    );
  }

  if (!resolvedPost) {
    return (
      <section className="admin-post-edit">
        <div className="admin-post-edit__layout">
          <header className="admin-post-edit__header">
            <div>
              <p className="admin-post-edit__badge">עריכת פוסט</p>
              <h1>לא מצאנו את הפוסט המבוקש</h1>
              <p className="admin-post-edit__subtitle">
                הפוסט אינו זמין כרגע. נסו לחזור לרשימת הפוסטים כדי לבחור פוסט
                אחר.
              </p>
            </div>
            <button
              className="admin-post-edit__back"
              type="button"
              onClick={onBack}
            >
              חזרה לרשימת הפוסטים
            </button>
          </header>
        </div>
      </section>
    );
  }

  const title = mode === "create" ? "יצירת פוסט חדש" : "עריכת פוסט";
  const subtitle =
    mode === "create"
      ? "השלימו את כל השדות והכינו פוסט חדש לפרסום באתר."
      : "כאן ניתן לעדכן תוכן, קטגוריה ותזמון של הפוסט הקיים.";
  const previewDescription = imagePreview
    ? "תצוגה מקדימה של התמונה שהוזנה."
    : "טרם הועלתה תמונה לפוסט.";
  const steps = [
    { id: "title", label: "כותרת הפוסט" },
    { id: "subtitle", label: "כותרת משנה" },
    { id: "image", label: "תמונה ראשית" },
    { id: "content-type", label: "עיקר הכתבה" },
    { id: "content", label: "תוכן" },
    { id: "details", label: "פרטים נוספים" },
  ];

  const getSelectionDetails = () => {
    const textarea = contentRef.current;
    if (!textarea) {
      return null;
    }
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selectedText = content.slice(start, end);
    return { textarea, start, end, selectedText };
  };

  const insertTextAtCursor = (insertion) => {
    const selection = getSelectionDetails();
    if (!selection) {
      return;
    }
    const { textarea, start, end } = selection;
    const nextValue = `${content.slice(0, start)}${insertion}${content.slice(end)}`;
    setContent(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + insertion.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const insertBlock = (text) => {
    const selection = getSelectionDetails();
    if (!selection) {
      return;
    }
    const { textarea, start, end } = selection;
    const needsPrefix = start > 0 && content[start - 1] !== "\n";
    const needsSuffix = content[end] && content[end] !== "\n";
    const prefix = needsPrefix ? "\n" : "";
    const suffix = needsSuffix ? "\n" : "";
    const insertion = `${prefix}${text}${suffix}`;
    const nextValue = `${content.slice(0, start)}${insertion}${content.slice(end)}`;
    setContent(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + prefix.length + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const insertSectionTitle = () => {
    const selection = getSelectionDetails();
    const title = selection?.selectedText?.trim() || "כותרת ביניים";
    insertBlock(`${title}\n`);
  };

  const insertQuote = () => {
    const selection = getSelectionDetails();
    const quote = selection?.selectedText?.trim() || "ציטוט חשוב";
    insertBlock(`״${quote}״`);
  };

  const insertBulletList = () => {
    const selection = getSelectionDetails();
    if (!selection) {
      return;
    }
    const lines = selection.selectedText
      ? selection.selectedText.split("\n")
      : ["פריט"];
    const formatted = lines
      .map((line) => `• ${line || "פריט"}`)
      .join("\n");
    insertBlock(formatted);
  };

  const insertNumberedList = () => {
    const selection = getSelectionDetails();
    if (!selection) {
      return;
    }
    const lines = selection.selectedText
      ? selection.selectedText.split("\n")
      : ["פריט"];
    const formatted = lines
      .map((line, index) => `${index + 1}. ${line || "פריט"}`)
      .join("\n");
    insertBlock(formatted);
  };

  const insertDivider = () => {
    insertBlock("⸻⸻⸻");
  };

  const handleInsertLink = () => {
    const url = window.prompt("הדביקו קישור");
    if (!url) {
      return;
    }
    const cleanedUrl = url.trim();
    if (!cleanedUrl) {
      return;
    }
    const label = window.prompt("כותרת לקישור (לא חובה)")?.trim();
    const insertion = label ? `${label}: ${cleanedUrl}` : cleanedUrl;
    insertBlock(insertion);
  };

  const handleInsertYoutube = () => {
    const url = window.prompt("הדביקו קישור ליוטיוב");
    if (!url) {
      return;
    }
    const cleanedUrl = url.trim();
    if (!cleanedUrl) {
      return;
    }
    insertBlock(`קישור יוטיוב: ${cleanedUrl}`);
  };

  const stepContent = () => {
    switch (steps[currentStep]?.id) {
      case "title":
        return (
          <label className="admin-post-edit__field">
            <span>כותרת הפוסט</span>
            <input
              name="title"
              type="text"
              placeholder="הקלידו כותרת קצרה ומשכנעת"
              value={titleValue}
              onChange={(event) => setTitleValue(event.target.value)}
              required
            />
          </label>
        );
      case "subtitle":
        return (
          <label className="admin-post-edit__field">
            <span>כותרת משנה</span>
            <input
              name="summary"
              type="text"
              placeholder="משפט פתיחה או כותרת משנה"
              value={summaryValue}
              onChange={(event) => setSummaryValue(event.target.value)}
            />
          </label>
        );
      case "image":
        return (
          <div className="admin-post-edit__panel">
            <label className="admin-post-edit__field">
              <span>קישור לתמונה ראשית</span>
              <input
                name="image"
                type="url"
                placeholder="https://"
                value={imageUrl}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setImageUrl(nextValue);
                  if (!objectUrlRef.current) {
                    setImagePreview(nextValue);
                  }
                }}
              />
            </label>

            <label className="admin-post-edit__field">
              <span>או העלאת תמונה</span>
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    if (objectUrlRef.current) {
                      URL.revokeObjectURL(objectUrlRef.current);
                      objectUrlRef.current = null;
                    }
                    setImageFileName("");
                    setImagePreview(imageUrl);
                    return;
                  }

                  if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                  }
                  const objectUrl = URL.createObjectURL(file);
                  objectUrlRef.current = objectUrl;
                  setImageFileName(file.name);
                  setImagePreview(objectUrl);
                }}
              />
              {imageFileName ? (
                <span className="admin-post-edit__hint">
                  נבחרה תמונה: {imageFileName}
                </span>
              ) : null}
            </label>

            <div className="admin-post-edit__preview-image admin-post-edit__preview-image--wizard">
              {imagePreview ? (
                <img src={imagePreview} alt={titleValue || "תמונה לפוסט"} />
              ) : (
                <div className="admin-post-edit__preview-placeholder">
                  אין תמונה להצגה
                </div>
              )}
            </div>
          </div>
        );
      case "content-type":
        return (
          <div className="admin-post-edit__choices">
            {[
              {
                id: "gallery",
                title: "גלריית תמונות",
                description: "העלו סדרת תמונות שתופיע בגוף הכתבה.",
              },
              {
                id: "video",
                title: "וידאו",
                description: "העלאת וידאו או הדבקת קישור יוטיוב.",
              },
              {
                id: "text",
                title: "טקסט",
                description: "כתיבת תוכן מלא עם עיצוב בסיסי.",
              },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={`admin-post-edit__choice${
                  contentType === option.id ? " is-active" : ""
                }`}
                onClick={() => setContentType(option.id)}
              >
                <span className="admin-post-edit__choice-title">
                  {option.title}
                </span>
                <span className="admin-post-edit__choice-description">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        );
      case "content":
        if (contentType === "gallery") {
          return (
            <label className="admin-post-edit__field">
              <span>העלאת תמונות לגלריה</span>
              <input
                name="gallery"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  setGalleryFiles(files.map((file) => file.name));
                }}
              />
              {galleryFiles.length ? (
                <span className="admin-post-edit__hint">
                  נבחרו {galleryFiles.length} תמונות: {galleryFiles.join(", ")}
                </span>
              ) : (
                <span className="admin-post-edit__hint">
                  ניתן לבחור מספר תמונות לגלריה.
                </span>
              )}
            </label>
          );
        }

        if (contentType === "video") {
          return (
            <div className="admin-post-edit__panel">
              <label className="admin-post-edit__field">
                <span>העלאת וידאו</span>
                <input
                  name="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setVideoFileName(file?.name ?? "");
                  }}
                />
                {videoFileName ? (
                  <span className="admin-post-edit__hint">
                    נבחר קובץ: {videoFileName}
                  </span>
                ) : (
                  <span className="admin-post-edit__hint">
                    אפשר גם להשאיר ריק ולהוסיף קישור יוטיוב.
                  </span>
                )}
              </label>

              <label className="admin-post-edit__field">
                <span>קישור יוטיוב</span>
                <input
                  name="youtube"
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                />
              </label>
            </div>
          );
        }

        return (
          <label className="admin-post-edit__field">
            <span>טקסט הכתבה</span>
            <div
              className="admin-post-edit__toolbar"
              role="toolbar"
              aria-label="כלי עיצוב תוכן"
            >
              <div className="admin-post-edit__toolbar-group">
                <span className="admin-post-edit__toolbar-label">מבנה</span>
                <button
                  className="admin-post-edit__tool"
                  type="button"
                  onClick={() => insertTextAtCursor("\n\n")}
                >
                  פסקה חדשה
                </button>
                <button
                  className="admin-post-edit__tool"
                  type="button"
                  onClick={insertSectionTitle}
                >
                  כותרת ביניים
                </button>
                <button
                  className="admin-post-edit__tool"
                  type="button"
                  onClick={insertQuote}
                >
                  ציטוט
                </button>
                <button
                  className="admin-post-edit__tool"
                  type="button"
                  onClick={insertDivider}
                >
                  הפרדה
                </button>
              </div>
              <div className="admin-post-edit__toolbar-group">
                <span className="admin-post-edit__toolbar-label">רשימות</span>
                <button
                  className="admin-post-edit__tool"
                  type="button"
                  onClick={insertBulletList}
                >
                  רשימת נקודות
                </button>
                <button
                  className="admin-post-edit__tool"
                  type="button"
                  onClick={insertNumberedList}
                >
                  רשימה ממוספרת
                </button>
              </div>
              <div className="admin-post-edit__toolbar-group">
                <span className="admin-post-edit__toolbar-label">
                  קישורים ומדיה
                </span>
                <button
                  className="admin-post-edit__tool"
                  type="button"
                  onClick={handleInsertLink}
                >
                  קישור
                </button>
                <button
                  className="admin-post-edit__tool admin-post-edit__tool--accent"
                  type="button"
                  onClick={handleInsertYoutube}
                >
                  יוטיוב
                </button>
              </div>
            </div>
            <textarea
              name="content"
              rows={14}
              placeholder="הקלידו כאן את תוכן הפוסט המלא"
              className="admin-post-edit__textarea"
              ref={contentRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            <span className="admin-post-edit__hint">
              הסרגל מוסיף פסקאות, כותרות, רשימות, ציטוטים וקישורים בצורה נקייה
              לקריאה - בלי קטעי קוד בטקסט העריכה.
            </span>
          </label>
        );
      case "details":
        return (
          <div className="admin-post-edit__panel">
            <label className="admin-post-edit__field">
              <span>תקציר קצר</span>
              <textarea
                name="excerpt"
                rows={3}
                placeholder="משפט או שניים שמסכמים את הפוסט"
                value={excerptValue}
                onChange={(event) => setExcerptValue(event.target.value)}
              />
            </label>
            <label className="admin-post-edit__field">
              <span>קטגוריה</span>
              <select
                name="category"
                value={categoryValue}
                onChange={(event) => setCategoryValue(event.target.value)}
              >
                <option value="חדשות">חדשות</option>
                <option value="קהילה">קהילה</option>
                <option value="חינוך">חינוך</option>
                <option value="תרבות">תרבות</option>
                <option value="דעות">דעות</option>
                <option value="היסטוריה">היסטוריה</option>
              </select>
            </label>
            <label className="admin-post-edit__field">
              <span>תאריך פרסום</span>
              <input
                name="publishedAt"
                type="date"
                value={publishedAtValue}
                onChange={(event) => setPublishedAtValue(event.target.value)}
              />
            </label>

            <div className="admin-post-edit__preview">
              <h2>תצוגה מקדימה</h2>
              <p className="admin-post-edit__preview-caption">
                {previewDescription}
              </p>
              <div className="admin-post-edit__preview-image">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={titleValue || "תמונה לפוסט"}
                  />
                ) : (
                  <div className="admin-post-edit__preview-placeholder">
                    אין תמונה להצגה
                  </div>
                )}
              </div>
              <p>{summaryValue || "טרם הוזן תקציר לפוסט."}</p>
              <div className="admin-post-edit__meta">
                <span>{categoryValue}</span>
                <span>{publishedAtValue ? "מוכן לפרסום" : "טיוטה"}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (mode === "create") {
    return (
      <section className="admin-post-edit">
        <div className="admin-post-edit__layout">
          <header className="admin-post-edit__header">
            <div>
              <p className="admin-post-edit__badge">ניהול פוסטים</p>
              <h1>{title}</h1>
              <p className="admin-post-edit__subtitle">{subtitle}</p>
            </div>
            <div className="admin-post-edit__actions">
              <button
                className="admin-post-edit__save"
                type="submit"
                form="post-edit-form"
              >
                שמירה
              </button>
              <button className="admin-post-edit__publish" type="button">
                פרסום עכשיו
              </button>
              <button
                className="admin-post-edit__back"
                type="button"
                onClick={onBack}
              >
                חזרה לרשימת הפוסטים
              </button>
            </div>
          </header>

          <form
            className="admin-post-edit__form admin-post-edit__form--wizard"
            id="post-edit-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="admin-post-edit__steps" role="list">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`admin-post-edit__step${
                      isActive ? " is-active" : ""
                    }${isComplete ? " is-complete" : ""}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <span className="admin-post-edit__step-index">
                      {index + 1}
                    </span>
                    <span className="admin-post-edit__step-label">
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="admin-post-edit__wizard">
              <div className="admin-post-edit__wizard-card">
                <h2>{steps[currentStep]?.label}</h2>
                {stepContent()}
              </div>

              <div className="admin-post-edit__wizard-actions">
                <button
                  type="button"
                  className="admin-post-edit__wizard-button"
                  onClick={() =>
                    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
                  }
                  disabled={currentStep === 0}
                >
                  חזרה
                </button>
                <button
                  type="button"
                  className="admin-post-edit__wizard-button admin-post-edit__wizard-button--primary"
                  onClick={() =>
                    setCurrentStep((prevStep) =>
                      Math.min(prevStep + 1, steps.length - 1)
                    )
                  }
                  disabled={currentStep === steps.length - 1}
                >
                  לשלב הבא
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-post-edit">
      <div className="admin-post-edit__layout">
        <header className="admin-post-edit__header">
          <div>
            <p className="admin-post-edit__badge">ניהול פוסטים</p>
            <h1>{title}</h1>
            <p className="admin-post-edit__subtitle">{subtitle}</p>
          </div>
          <div className="admin-post-edit__actions">
            <button className="admin-post-edit__save" type="submit" form="post-edit-form">
              שמירה
            </button>
            <button className="admin-post-edit__publish" type="button">
              פרסום עכשיו
            </button>
            <button className="admin-post-edit__back" type="button" onClick={onBack}>
              חזרה לרשימת הפוסטים
            </button>
          </div>
        </header>

        <form
          className="admin-post-edit__form"
          id="post-edit-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="admin-post-edit__panel">
            <label className="admin-post-edit__field">
              <span>כותרת הפוסט</span>
              <input
                name="title"
                type="text"
                placeholder="הקלידו כותרת קצרה ומשכנעת"
                defaultValue={resolvedPost.title}
                required
              />
            </label>

            <label className="admin-post-edit__field">
              <span>תקציר קצר</span>
              <textarea
                name="excerpt"
                rows={3}
                placeholder="משפט או שניים שמסכמים את הפוסט"
                defaultValue={resolvedPost.excerpt}
              />
            </label>

            <label className="admin-post-edit__field">
              <span>קטגוריה</span>
              <select name="category" defaultValue={resolvedPost.category}>
                <option value="חדשות">חדשות</option>
                <option value="קהילה">קהילה</option>
                <option value="חינוך">חינוך</option>
                <option value="תרבות">תרבות</option>
                <option value="דעות">דעות</option>
                <option value="היסטוריה">היסטוריה</option>
              </select>
            </label>
          </div>

          <div className="admin-post-edit__panel">
            <label className="admin-post-edit__field">
              <span>קישור לתמונה ראשית</span>
              <input
                name="image"
                type="url"
                placeholder="https://"
                value={imageUrl}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setImageUrl(nextValue);
                  if (!objectUrlRef.current) {
                    setImagePreview(nextValue);
                  }
                }}
              />
            </label>

            <label className="admin-post-edit__field">
              <span>או העלאת תמונה</span>
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    if (objectUrlRef.current) {
                      URL.revokeObjectURL(objectUrlRef.current);
                      objectUrlRef.current = null;
                    }
                    setImageFileName("");
                    setImagePreview(imageUrl);
                    return;
                  }

                  if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                  }
                  const objectUrl = URL.createObjectURL(file);
                  objectUrlRef.current = objectUrl;
                  setImageFileName(file.name);
                  setImagePreview(objectUrl);
                }}
              />
              {imageFileName ? (
                <span className="admin-post-edit__hint">
                  נבחרה תמונה: {imageFileName}
                </span>
              ) : null}
            </label>

            <label className="admin-post-edit__field">
              <span>תאריך פרסום</span>
              <input
                name="publishedAt"
                type="date"
                defaultValue={resolvedPost.publishedAt?.slice(0, 10)}
              />
            </label>

            <label className="admin-post-edit__field">
              <span>כותרת משנה</span>
              <input
                name="summary"
                type="text"
                placeholder="משפט פתיחה או כותרת משנה"
                defaultValue={resolvedPost.summary}
              />
            </label>
          </div>

          <div className="admin-post-edit__panel admin-post-edit__panel--wide">
            <label className="admin-post-edit__field">
              <span>תוכן מלא</span>
              <div className="admin-post-edit__toolbar" role="toolbar" aria-label="כלי עיצוב תוכן">
                <div className="admin-post-edit__toolbar-group">
                  <span className="admin-post-edit__toolbar-label">מבנה</span>
                  <button
                    className="admin-post-edit__tool"
                    type="button"
                    onClick={() => insertTextAtCursor("\n\n")}
                  >
                    פסקה חדשה
                  </button>
                  <button
                    className="admin-post-edit__tool"
                    type="button"
                    onClick={insertSectionTitle}
                  >
                    כותרת ביניים
                  </button>
                  <button
                    className="admin-post-edit__tool"
                    type="button"
                    onClick={insertQuote}
                  >
                    ציטוט
                  </button>
                  <button
                    className="admin-post-edit__tool"
                    type="button"
                    onClick={insertDivider}
                  >
                    הפרדה
                  </button>
                </div>
                <div className="admin-post-edit__toolbar-group">
                  <span className="admin-post-edit__toolbar-label">רשימות</span>
                  <button
                    className="admin-post-edit__tool"
                    type="button"
                    onClick={insertBulletList}
                  >
                    רשימת נקודות
                  </button>
                  <button
                    className="admin-post-edit__tool"
                    type="button"
                    onClick={insertNumberedList}
                  >
                    רשימה ממוספרת
                  </button>
                </div>
                <div className="admin-post-edit__toolbar-group">
                  <span className="admin-post-edit__toolbar-label">
                    קישורים ומדיה
                  </span>
                  <button
                    className="admin-post-edit__tool"
                    type="button"
                    onClick={handleInsertLink}
                  >
                    קישור
                  </button>
                  <button
                    className="admin-post-edit__tool admin-post-edit__tool--accent"
                    type="button"
                    onClick={handleInsertYoutube}
                  >
                    יוטיוב
                  </button>
                </div>
              </div>
              <textarea
                name="content"
                rows={14}
                placeholder="הקלידו כאן את תוכן הפוסט המלא"
                className="admin-post-edit__textarea"
                ref={contentRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <span className="admin-post-edit__hint">
                הסרגל מוסיף פסקאות, כותרות, רשימות, ציטוטים וקישורים בצורה נקייה
                לקריאה - בלי קטעי קוד בטקסט העריכה.
              </span>
            </label>
          </div>

          <aside className="admin-post-edit__preview">
            <h2>תצוגה מקדימה</h2>
            <p className="admin-post-edit__preview-caption">
              {previewDescription}
            </p>
            <div className="admin-post-edit__preview-image">
              {imagePreview ? (
                <img src={imagePreview} alt={resolvedPost.title || "תמונה לפוסט"} />
              ) : (
                <div className="admin-post-edit__preview-placeholder">
                  אין תמונה להצגה
                </div>
              )}
            </div>
            <p>{resolvedPost.summary || "טרם הוזן תקציר לפוסט."}</p>
            <div className="admin-post-edit__meta">
              <span>{resolvedPost.category}</span>
              <span>{resolvedPost.publishedAt ? "מוכן לפרסום" : "טיוטה"}</span>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}
