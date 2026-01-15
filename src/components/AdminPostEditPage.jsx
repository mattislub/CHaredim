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
  const [imageUrl, setImageUrl] = useState(resolvedPost?.imageUrl ?? "");
  const [imagePreview, setImagePreview] = useState(
    resolvedPost?.imageUrl ?? ""
  );
  const [imageFileName, setImageFileName] = useState("");
  const objectUrlRef = useRef(null);

  useEffect(() => {
    setImageUrl(resolvedPost?.imageUrl ?? "");
    setImagePreview(resolvedPost?.imageUrl ?? "");
    setImageFileName("");
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [resolvedPost]);

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
              <textarea
                name="content"
                rows={10}
                placeholder="הקלידו כאן את תוכן הפוסט המלא"
                defaultValue={resolvedPost.content}
              />
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
