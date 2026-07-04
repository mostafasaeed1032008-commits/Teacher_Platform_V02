import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit2, GripVertical, Save, X, Upload } from "lucide-react";
import { getPlatformLanguage } from "../locales";
import { RobustImage } from "./RobustImage";

interface Achiever {
  id: string;
  name: string;
  result_line: string;
  photo_url?: string;
  display_order: number;
}

interface AchieversManagerProps {
  onClose: () => void;
}

export const AchieversManager: React.FC<AchieversManagerProps> = ({ onClose }) => {
  const lang = getPlatformLanguage() as "en" | "ar";
  const isRtl = lang === "ar";

  const [achievers, setAchievers] = useState<Achiever[]>([]);
  const [homepageCount, setHomepageCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Achiever> & { photoFile?: File }>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load achievers and settings on mount
  useEffect(() => {
    loadAchievers();
    loadSettings();
  }, []);

  const loadAchievers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/achievers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAchievers(data);
      }
    } catch (err) {
      console.error("Failed to load achievers", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/achievers/settings/homepage-count", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHomepageCount(data.achievers_homepage_count || 6);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photoFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (achiever: Achiever) => {
    setEditing(achiever.id);
    setFormData(achiever);
    setPhotoPreview(achiever.photo_url || null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.result_line) {
      alert(lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("result_line", formData.result_line);
      if (formData.photoFile) {
        formDataToSend.append("photo", formData.photoFile);
      }

      const url = editing ? `/api/achievers/${editing}` : "/api/achievers";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      if (res.ok) {
        await loadAchievers();
        setEditing(null);
        setFormData({});
        setPhotoPreview(null);
      } else {
        alert("Failed to save achiever");
      }
    } catch (err) {
      console.error("Error saving achiever", err);
      alert("Error saving achiever");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "هل تريد حذف هذا الإنجاز؟" : "Are you sure?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/achievers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        await loadAchievers();
      }
    } catch (err) {
      console.error("Error deleting achiever", err);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = achievers.findIndex((a) => a.id === draggedId);
    const targetIndex = achievers.findIndex((a) => a.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder locally
    const newAchievers = [...achievers];
    [newAchievers[draggedIndex], newAchievers[targetIndex]] = [
      newAchievers[targetIndex],
      newAchievers[draggedIndex]
    ];

    // Update display_order
    newAchievers.forEach((a, idx) => {
      a.display_order = idx;
    });
    setAchievers(newAchievers);

    // Send to backend
    try {
      const token = localStorage.getItem("auth_token");
      const orders = newAchievers.map((a) => ({
        id: a.id,
        display_order: a.display_order
      }));

      await fetch("/api/achievers/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orders })
      });
    } catch (err) {
      console.error("Error reordering", err);
    }

    setDraggedId(null);
  };

  const handleHomepageCountChange = async (count: number) => {
    setHomepageCount(count);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch("/api/achievers/settings/homepage-count", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ achievers_homepage_count: count })
      });
    } catch (err) {
      console.error("Error updating settings", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">
            {lang === "ar" ? "إدارة الأبطال" : "Manage Achievers"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Homepage Count Control */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <label className="block text-sm font-bold text-slate-600 uppercase mb-3">
              {lang === "ar" ? "عدد الأبطال على الصفحة الرئيسية" : "Achievers on Homepage"}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max={Math.max(achievers.length, 12)}
                value={homepageCount}
                onChange={(e) => handleHomepageCountChange(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center bg-white border border-slate-200 rounded-lg px-4 py-2 min-w-[60px]">
                <span className="text-xl font-black text-indigo-600">{homepageCount}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {lang === "ar"
                ? `سيتم عرض أول ${homepageCount} من الأبطال (مرتبة حسب الترتيب أدناه) على الصفحة الرئيسية العامة`
                : `Only the top ${homepageCount} achievers (by order below) will appear on the public homepage`}
            </p>
          </div>

          {/* Add New Achiever Button */}
          {!editing && (
            <button
              onClick={() => {
                setEditing("new");
                setFormData({});
                setPhotoPreview(null);
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {lang === "ar" ? "إضافة إنجاز جديد" : "Add New Achiever"}
            </button>
          )}

          {/* Edit Form */}
          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4"
              >
                <h3 className="font-bold text-slate-900">
                  {editing === "new"
                    ? lang === "ar"
                      ? "إنجاز جديد"
                      : "New Achiever"
                    : lang === "ar"
                    ? "تعديل الإنجاز"
                    : "Edit Achiever"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">
                      {lang === "ar" ? "الاسم" : "Name"}
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={lang === "ar" ? "أدخل الاسم" : "Enter name"}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">
                      {lang === "ar" ? "الإنجاز/النتيجة" : "Result/Achievement"}
                    </label>
                    <textarea
                      value={formData.result_line || ""}
                      onChange={(e) => setFormData({ ...formData, result_line: e.target.value })}
                      placeholder={lang === "ar" ? "مثال: الأول على الجمهورية - فيزياء 2025" : "E.g. Rank #1 National - Physics 2025"}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">
                      {lang === "ar" ? "الصورة" : "Photo"}
                    </label>
                    <div className="flex gap-4 items-start">
                      <label className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:border-indigo-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <Upload size={20} />
                          <span className="text-sm font-semibold">
                            {lang === "ar" ? "اختر صورة" : "Choose image"}
                          </span>
                        </div>
                      </label>
                      {photoPreview && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      {saving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : lang === "ar" ? "حفظ" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setFormData({});
                        setPhotoPreview(null);
                      }}
                      className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievers List with Drag & Drop */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : achievers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>{lang === "ar" ? "لا توجد أبطال بعد" : "No achievers yet"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase">
                {lang === "ar" ? "اسحب وأفلت لإعادة الترتيب" : "Drag to reorder"}
              </p>
              {achievers.map((achiever, idx) => (
                <motion.div
                  key={achiever.id}
                  layout
                  draggable
                  onDragStart={(e) => handleDragStart(e as any, achiever.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e as any, achiever.id)}
                  className={`p-4 bg-white border-2 rounded-xl flex items-center gap-4 cursor-move transition-all ${
                    draggedId === achiever.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <GripVertical size={18} className="text-slate-400 flex-shrink-0" />

                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {achiever.photo_url ? (
                      <img src={achiever.photo_url} alt={achiever.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-xs font-bold text-slate-500">
                        No
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{achiever.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{achiever.result_line}</p>
                  </div>

                  <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg flex-shrink-0">
                    #{idx + 1}
                  </div>

                  <button
                    onClick={() => handleEdit(achiever)}
                    disabled={editing !== null}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(achiever.id)}
                    disabled={editing !== null}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
