import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../utils/LanguageContext";
import { formatMacAddress } from "../utils/formatMacAddress";

export default function EditEmployee({ employee, onBack, onSuccess }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    employee_code: employee.employee_code || "",
    full_name: employee.full_name || "",
    date_of_birth: employee.date_of_birth || "",
    email: employee.email || "",
    phone_number: employee.phone_number || "",
    image: employee.image || null,
    salary: employee.salary || "",
    position: employee.position || "",
    hire_date: employee.hire_date || "",
    status: employee.status || "active",
    mac_address: "",
    device_id: null,
  });

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const { data, error } = await supabase
          .from("devices")
          .select("id, mac_address")
          .eq("employee_id", employee.id);

        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            mac_address: data[0].mac_address || "",
            device_id: data[0].id,
          }));
        }
      } catch (err) {
        console.error("Error fetching device info:", err);
      }
    };
    if (employee?.id) {
      fetchDevice();
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formattedMac = formatMacAddress(formData.mac_address);
      let publicImageUrl = employee.image; // preserve old image unless overridden

      // Upload new image if a new File was selected
      if (formData.image && typeof formData.image !== "string") {
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${Date.now()}_${formData.employee_code}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("image_storage")
          .upload(fileName, formData.image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: uploadData } = supabase.storage
          .from("image_storage")
          .getPublicUrl(fileName);

        publicImageUrl = uploadData.publicUrl;
      }

      const { error } = await supabase
        .from("employees")
        .update({
          employee_code: formData.employee_code,
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          email: formData.email,
          phone_number: formData.phone_number,
          image: publicImageUrl,
          salary: parseFloat(formData.salary),
          position: formData.position,
          hire_date: formData.hire_date,
          status: formData.status,
        })
        .eq("id", employee.id);

      if (error) throw error;

      if (formData.device_id) {
        const { error: devError } = await supabase
          .from("devices")
          .update({ mac_address: formattedMac })
          .eq("id", formData.device_id);
        if (devError) throw devError;
      } else if (formData.mac_address) {
        const { error: devError } = await supabase.from("devices").insert([
          {
            employee_id: employee.id,
            device_name: "Web Device",
            mac_address: formattedMac,
            is_active: formData.status === "active",
          },
        ]);
        if (devError) throw devError;
      }

      setMessage({
        type: "success",
        text: t("updateSuccess"),
      });

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage({
        type: "error",
        text: error.message || t("updateError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="details-view">
      <button className="btn-back" onClick={onBack}>
        {t("backToEmployees")}
      </button>

      <div className="card max-w-2xl mt-4">
        <div className="card-header">
          <h2 className="card-title">
            {t("editEmployee")}: {employee.full_name}
          </h2>
        </div>
        <div className="card-body">
          {message.text && (
            <div
              className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
            >
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid-2col">
              <div className="form-group full-width">
                <label>{t("code")}</label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("name")}</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("dob")}</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("email")}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <label>{t("phoneNumber")}</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <label>{t("profileImageUpload")}</label>
                {typeof formData.image === "string" && formData.image && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <img
                      src={formData.image}
                      alt="Current profile"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <label>{t("salary")}</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("position")}</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("hireDate")}</label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>{t("status")}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>{t("macAddress")}</label>
                <input
                  type="text"
                  name="mac_address"
                  value={formData.mac_address}
                  onChange={handleChange}
                  placeholder="00:00:00:00:00:00"
                />
              </div>
            </div>

            <div className="full-width mt-4">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t("saving") : t("updateButton")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
