import { useState, useEffect } from "react";
import { Plus, Filter, X, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import ArticleModal from "../../components/admin/articles/ArticleModal.jsx";
import ArticlesTable from "../../components/admin/articles/ArticlesTable.jsx";
import ArticlesStats from "../../components/admin/articles/ArticlesStats.jsx";
import DeleteConfirmModal from "../../components/admin/articles/DeleteConfirmModal.jsx";
import ArticlePreviewModal from "../../components/admin/articles/ArticlePreviewModal.jsx";

const API_URL = "http://localhost:5000/api/articles";

const CATEGORY_OPTIONS = [
	{ value: "all", label: "Tất cả" },
	{ value: "promotion", label: "Khuyến mãi" },
	{ value: "gift", label: "Quà tặng" },
	{ value: "news", label: "Tin mới" },
	{ value: "event", label: "Sự kiện" },
];

const STATUS_OPTIONS = [
	{ value: "all", label: "Tất cả" },
	{ value: "published", label: "Đã đăng" },
	{ value: "draft", label: "Bản nháp" },
	{ value: "scheduled", label: "Hẹn giờ" },
];

const toDateKey = (value) => {
	if (!value) return "";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";
	return parsed.toISOString().split("T")[0];
};

export default function AdminArticlesPage() {
	const { user } = useAuth();
	const defaultAuthor =
		user?.displayName || user?.email?.split("@")[0] || "Admin";

	const [articles, setArticles] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [viewItem, setViewItem] = useState(null);
	const [deleteItem, setDeleteItem] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	const loadArticles = async () => {
		setLoading(true);
		try {
			const token =
				sessionStorage.getItem("token") || localStorage.getItem("token");

			const response = await fetch(`${API_URL}?scope=all`, {
				headers: {
					Authorization: token ? `Bearer ${token}` : "",
				},
			});

			const result = await response.json();
			if (result.success) {
				setArticles(result.data || []);
			} else {
				toast.error(result.message || "Lỗi tải dữ liệu");
			}
		} catch (error) {
			console.error("Error loading articles:", error);
			toast.error("Không thể kết nối đến server");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadArticles();
	}, []);

	useEffect(() => {
		let filteredData = [...articles];

		if (searchTerm) {
			const query = searchTerm.toLowerCase();
			filteredData = filteredData.filter(
				(item) =>
					item.title?.toLowerCase().includes(query)
			);
		}

		if (categoryFilter !== "all") {
			filteredData = filteredData.filter(
				(item) => (item.category || "promotion") === categoryFilter
			);
		}

		if (statusFilter !== "all") {
			const today = toDateKey(new Date());

			if (statusFilter === "published") {
				filteredData = filteredData.filter((item) => {
					const publishDate = toDateKey(item.publish_date);
					return (
						item.status === "published" && (!publishDate || publishDate <= today)
					);
				});
			} else if (statusFilter === "draft") {
				filteredData = filteredData.filter((item) => item.status === "draft");
			} else if (statusFilter === "scheduled") {
				filteredData = filteredData.filter((item) => {
					const publishDate = toDateKey(item.publish_date);
					return item.status === "published" && publishDate && publishDate > today;
				});
			}
		}

		setFiltered(filteredData);
	}, [articles, searchTerm, statusFilter, categoryFilter]);

	const handleAdd = () => {
		setEditingItem(null);
		setShowModal(true);
	};

	const handleEdit = (item) => {
		setEditingItem(item);
		setShowModal(true);
	};

	const handleView = (item) => {
		setViewItem(item);
	};

	const handleSave = async (data) => {
		try {
			const token =
				sessionStorage.getItem("token") || localStorage.getItem("token");

			if (!token) {
				toast.error("Vui lòng đăng nhập lại!");
				return;
			}

			let url = API_URL;
			let method = "POST";
			if (editingItem) {
				url = `${API_URL}/${editingItem.article_id}`;
				method = "PUT";
			}

			const payload = {
				...data,
				publish_date:
					data.status === "published" && !data.publish_date
						? new Date().toISOString().split("T")[0]
						: data.publish_date,
			};

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			const result = await response.json();
			if (response.ok && result.success) {
				toast.success(editingItem ? "Đã cập nhật bài viết" : "Đã thêm bài viết");
				loadArticles();
				setShowModal(false);
				setEditingItem(null);
			} else {
				toast.error(result.message || result.error || "Có lỗi xảy ra");
			}
		} catch (error) {
			console.error("Error saving article:", error);
			toast.error("Không thể kết nối đến server");
		}
	};

	const handleDelete = async () => {
		if (!deleteItem) return;

		try {
			const token =
				sessionStorage.getItem("token") || localStorage.getItem("token");

			if (!token) {
				toast.error("Vui lòng đăng nhập lại!");
				return;
			}

			const response = await fetch(`${API_URL}/${deleteItem.article_id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			const result = await response.json();
			if (response.ok && result.success) {
				toast.success("Đã xóa bài viết");
				loadArticles();
				setDeleteItem(null);
			} else {
				toast.error(result.message || result.error || "Xóa thất bại");
			}
		} catch (error) {
			console.error("Error deleting article:", error);
			toast.error("Không thể kết nối đến server");
		}
	};

	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
		setCategoryFilter("all");
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-white flex items-center gap-2">
						<FileText className="text-red-500" size={24} />
						Quản lý bài viết
					</h1>
					<p className="text-sm text-gray-400">
						Đăng bài viết về khuyến mãi và quà tặng sắp tới
					</p>
				</div>

				<div className="flex gap-3">
					<input
						type="text"
						placeholder="Tìm kiếm..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-64 h-10 px-4 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
					/>

					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
							showFilters || statusFilter !== "all" || categoryFilter !== "all"
								? "bg-red-600 hover:bg-red-700"
								: "bg-zinc-900 hover:bg-zinc-800"
						}`}
					>
						<Filter size={16} />
						<span className="hidden sm:inline">Lọc</span>
					</button>

					<button
						onClick={handleAdd}
						className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
					>
						<Plus size={16} />
						Thêm bài viết
					</button>
				</div>
			</div>

			<ArticlesStats articles={filtered} />

			{showFilters && (
				<div className="bg-cinema-surface rounded-xl border border-white/10 p-4">
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-sm font-medium text-white">Bộ lọc nâng cao</h3>
						<button
							onClick={clearFilters}
							className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
						>
							<X size={14} />
							Xóa bộ lọc
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="text-sm text-gray-400">Trạng thái</label>
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="mt-1 w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
							>
								{STATUS_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="text-sm text-gray-400">Danh mục</label>
							<select
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
								className="mt-1 w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
							>
								{CATEGORY_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			)}

			<ArticlesTable
				articles={filtered}
				onEdit={handleEdit}
				onDelete={(item) => setDeleteItem(item)}
				onView={handleView}
			/>

			<ArticleModal
				show={showModal}
				onClose={() => {
					setShowModal(false);
					setEditingItem(null);
				}}
				onSave={handleSave}
				editingItem={editingItem}
				defaultAuthor={defaultAuthor}
			/>

			<ArticlePreviewModal
				show={!!viewItem}
				item={viewItem}
				onClose={() => setViewItem(null)}
			/>

			<DeleteConfirmModal
				show={!!deleteItem}
				item={deleteItem}
				onClose={() => setDeleteItem(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
}
