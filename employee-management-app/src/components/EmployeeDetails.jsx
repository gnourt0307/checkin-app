import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../utils/LanguageContext";

export default function EmployeeDetails({ employee, onBack }) {
  const { t } = useLanguage();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (employee?.id) {
      fetchAttendance();
    }
  }, [employee]);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employee.id)
      .order("work_date", { ascending: false });

    if (error) {
      console.error("Error fetching attendance:", error);
    } else {
      setAttendance(data || []);
    }
    setLoading(false);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "-";
    return new Date(isoStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const getDateString = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const generateCalendarDays = () => {
    const monthStr = selectedMonth || getDateString(new Date()).substring(0, 7);
    const [year, month] = monthStr.split("-").map(Number);
    const monthIndex = month - 1; // 0-based

    const firstDayDate = new Date(year, monthIndex, 1);
    const firstDay = firstDayDate.getDay(); // Sunday = 0

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    const days = [];

    // Previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      days.push({
        day: d,
        dateStr: getDateString(new Date(year, monthIndex - 1, d)),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        dateStr: getDateString(new Date(year, monthIndex, i)),
        isCurrentMonth: true,
      });
    }

    // Next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        dateStr: getDateString(new Date(year, monthIndex + 1, i)),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getDayStatusClass = (dateStr, isCurrentMonth) => {
    if (!isCurrentMonth) return "other-month";
    const todayStr = getDateString(new Date());
    if (dateStr > todayStr) return "status-future";

    const record = attendance.find((a) => a.work_date === dateStr);
    if (!record) return "status-absent-calendar"; // red

    if (!record.check_out_time) return "status-in-progress-calendar"; // blue
    if (record.status === "late") return "status-late-calendar"; // yellow

    return "status-on-time-calendar"; // green
  };

  const getDayTooltip = (dateStr, isCurrentMonth) => {
    if (!isCurrentMonth) return "";
    const todayStr = getDateString(new Date());
    if (dateStr > todayStr) return "";

    const record = attendance.find((a) => a.work_date === dateStr);
    if (!record) return `${dateStr} - ${t("absent")}`;

    const inTime = formatDate(record.check_in_time);
    const outTime = formatDate(record.check_out_time);
    return `${dateStr}\n${t("checkIn")}: ${inTime}\n${t("checkOut")}: ${outTime}`;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="details-view">
      <button className="btn-back" onClick={onBack}>
        {t("backToEmployees")}
      </button>

      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">
            {employee.full_name} -{" "}
            {showAttendance ? t("attendanceHistory") : t("profileInfo")}
          </h2>
          <p className="subtitle">
            {employee.employee_code} | {employee.position} | {t("hireDate")}:{" "}
            {employee.hire_date}
          </p>
        </div>

        <div className="card-body p-4">
          {!showAttendance ? (
            <div className="profile-section">
              <div
                className="profile-image-placeholder mb-4"
                style={{
                  width: "150px",
                  height: "150px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6c757d",
                  fontSize: "14px",
                  margin: "0 auto",
                }}
              >
                {t("profileImage")} (null)
              </div>
              <div className="table-container mb-4">
                <table className="data-table">
                  <tbody>
                    <tr>
                      <td style={{ width: "30%", fontWeight: "bold" }}>
                        {t("dob")}
                      </td>
                      <td>{employee.date_of_birth || "null"}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>{t("email")}</td>
                      <td>{employee.email || "null"}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>{t("phoneNumber")}</td>
                      <td>{employee.phone_number || "null"}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>{t("socialMedia")}</td>
                      <td>{employee.social_media || "null"}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>{t("salary")}</td>
                      <td>
                        {employee.salary
                          ? employee.salary.toLocaleString("vi-VN")
                          : "null"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAttendance(true)}
                >
                  {t("showAttendance")}
                </button>
              </div>
            </div>
          ) : (
            <div className="attendance-section">
              <div
                className="filter-bar"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <button
                  className="btn-back"
                  onClick={() => setShowAttendance(false)}
                >
                  ← {t("hideAttendance")}
                </button>
                <div
                  className="filter-group"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <label
                    htmlFor="monthFilter"
                    style={{ marginRight: "0.5rem" }}
                  >
                    {t("monthFilter")}:
                  </label>
                  <input
                    type="month"
                    id="monthFilter"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>

              <div className="calendar-container">
                {loading ? (
                  <p>{t("loading")}</p>
                ) : (
                  <div className="attendance-calendar">
                    <div className="calendar-header-row">
                      <div className="calendar-day-name">{t("sun")}</div>
                      <div className="calendar-day-name">{t("mon")}</div>
                      <div className="calendar-day-name">{t("tue")}</div>
                      <div className="calendar-day-name">{t("wed")}</div>
                      <div className="calendar-day-name">{t("thu")}</div>
                      <div className="calendar-day-name">{t("fri")}</div>
                      <div className="calendar-day-name">{t("sat")}</div>
                    </div>
                    <div className="calendar-grid">
                      {calendarDays.map((dayObj, idx) => {
                        const tooltipText = getDayTooltip(
                          dayObj.dateStr,
                          dayObj.isCurrentMonth,
                        );
                        return (
                          <div
                            key={idx}
                            className={`calendar-cell ${getDayStatusClass(
                              dayObj.dateStr,
                              dayObj.isCurrentMonth,
                            )}`}
                          >
                            <div className="calendar-day-circle">
                              {dayObj.day}
                            </div>
                            {tooltipText && (
                              <div className="calendar-tooltip">
                                {tooltipText}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
