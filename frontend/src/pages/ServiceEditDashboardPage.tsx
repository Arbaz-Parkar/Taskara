import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMyServices, updateMyService } from "../utils/api";

type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  images?: {
    id: number;
    fileUrl: string;
    sortOrder: number;
  }[];
};

const MAX_SERVICE_IMAGES = 5;

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      if (!base64) {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const ServiceEditDashboardPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const allServices = await fetchMyServices();
        const found = allServices.find((item: Service) => String(item.id) === serviceId);

        if (!found) {
          setError("Service not found");
          return;
        }

        setService(found);
        setTitle(found.title);
        setCategory(found.category);
        setPrice(String(found.price));
        setDescription(found.description);
        setExistingImageUrls(
          (found.images ?? []).map((image: { fileUrl: string }) => image.fileUrl)
        );
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load service");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [serviceId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!service) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateMyService(service.id, {
        title,
        category,
        description,
        price: Number(price),
        images: [
          ...existingImageUrls.map((fileUrl) => ({ fileUrl })),
          ...(await Promise.all(
            newImageFiles.map(async (file) => ({
              fileName: file.name,
              mimeType: file.type,
              dataBase64: await fileToBase64(file),
            }))
          )),
        ],
      });

      navigate(`/dashboard/services/${service.id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update service");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const totalCurrent = existingImageUrls.length + newImageFiles.length;
    const availableSlots = MAX_SERVICE_IMAGES - totalCurrent;
    if (availableSlots <= 0) {
      setError(`You can upload up to ${MAX_SERVICE_IMAGES} images.`);
      return;
    }

    const nextFiles = files.slice(0, availableSlots).filter((file) => file.type.startsWith("image/"));
    if (!nextFiles.length) {
      setError("Please select image files only.");
      return;
    }

    const nextPreviews = nextFiles.map((file) => URL.createObjectURL(file));
    setNewImageFiles((current) => [...current, ...nextFiles]);
    setNewImagePreviews((current) => [...current, ...nextPreviews]);
    setError("");
    event.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setNewImagePreviews((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target);
      }
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  return (
    <>
      {loading ? (
        <div className="dashboard-placeholder">Loading service...</div>
      ) : error && !service ? (
        <div className="dashboard-placeholder">
          <h2>Could not load service</h2>
          <p>{error}</p>
          <button className="btn-outline" onClick={() => navigate("/dashboard/services")}>Back to Listings</button>
        </div>
      ) : service ? (
        <section className="overview-market-section">
          <div className="manage-head-row">
            <div className="overview-market-head">
              <h3>Edit Service</h3>
              <p>Update listing details for {service.title}</p>
            </div>

            <button className="btn-outline" onClick={() => navigate(`/dashboard/services/${service.id}`)}>
              Back to Service
            </button>
          </div>

          <form className="create-service-form" onSubmit={handleSubmit}>
            <label className="create-field">
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>

            <label className="create-field">
              <span>Category</span>
              <input value={category} onChange={(event) => setCategory(event.target.value)} required />
            </label>

            <label className="create-field create-price-field">
              <span>Price</span>
              <input
                type="number"
                min="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>

            <label className="create-field">
              <span>Description</span>
              <textarea
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>

            <label className="create-field">
              <span>Service Images (up to 5)</span>
              <input type="file" accept="image/*" multiple onChange={handleSelectImages} />
              <small>
                You can remove current images and upload replacements before saving.
              </small>
            </label>

            {(existingImageUrls.length > 0 || newImagePreviews.length > 0) && (
              <div className="service-image-picker-grid">
                {existingImageUrls.map((url, index) => (
                  <div key={url} className="service-image-picker-item">
                    <img src={url} alt={`Current service image ${index + 1}`} />
                    <button type="button" onClick={() => removeExistingImage(index)}>
                      Remove
                    </button>
                  </div>
                ))}
                {newImagePreviews.map((url, index) => (
                  <div key={url} className="service-image-picker-item">
                    <img src={url} alt={`New service image ${index + 1}`} />
                    <button type="button" onClick={() => removeNewImage(index)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="form-status form-status-error">{error}</p>}

            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
};

export default ServiceEditDashboardPage;
