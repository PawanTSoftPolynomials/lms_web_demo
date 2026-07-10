"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getCourses } from "@/services/course.service";
import { getInstructors } from "@/services/instructor.service";
import { createCalendarEvent, deleteCalendarEvent } from "@/services/calendar.service";
import { FaTrash, FaVideo, FaClipboardList, FaBookOpen, FaClock, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { useNotification } from "@/context/NotificationContext";

export default function EventModal({
  open,
  onClose,
  event,
  selectedDate,
  onSave,
  role,
}) {
  const { addNotification, markEventAsSeen } = useNotification();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type: "class",
    courseId: "",
    date: selectedDate || new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:30",
    description: "",
    link: "",
    maxMarks: "",
    instructorId: "",
  });

  useEffect(() => {
    if (open) {
      setError("");
      setFormData({
        title: "",
        type: "class",
        courseId: "",
        date: selectedDate || new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:30",
        description: "",
        link: "",
        maxMarks: "",
        instructorId: "",
      });

      // Fetch courses and instructors list for dropdowns
      const fetchData = async () => {
        try {
          const coursesList = await getCourses();
          setCourses(coursesList || []);

          if (role === "ADMIN") {
            const teachersList = await getInstructors();
            setInstructors(teachersList || []);
          }
        } catch (err) {
          console.error("Failed to load options", err);
        }
      };

      fetchData();
    }
  }, [open, selectedDate, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.title || !formData.courseId || !formData.date || !formData.startTime) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const selectedCourse = courses.find(c => c.id === formData.courseId || c._id === formData.courseId);
    const courseName = selectedCourse ? selectedCourse.title : "General";

    let instructorName = "";
    let instructorId = formData.instructorId;

    if (role === "ADMIN" && formData.instructorId) {
      const selectedTeacher = instructors.find(t => t.id === formData.instructorId || t._id === formData.instructorId);
      instructorName = selectedTeacher ? selectedTeacher.name : "";
    } else if (role === "INSTRUCTOR") {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          instructorName = user.name;
          instructorId = user.id || user._id || "inst-current";
        }
      }
    }

    const newEvent = {
      title: formData.title,
      type: formData.type,
      courseId: formData.courseId,
      courseName,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime || formData.startTime,
      description: formData.description,
      link: formData.link,
      maxMarks: formData.maxMarks ? Number(formData.maxMarks) : undefined,
      instructorId,
      instructorName,
    };

    try {
      const created = await createCalendarEvent(newEvent);
      const eventId = created?.id || created?._id || "event-" + Date.now();
      
      // Mark as seen locally to prevent the observer from triggering a duplicate toast
      markEventAsSeen(eventId);

      let actionType = "Activity Scheduled";
      let displayType = "system";
      if (newEvent.type === "class") {
        actionType = "New Live Class";
        displayType = "course";
      } else if (newEvent.type === "quiz") {
        actionType = "New Quiz Uploaded";
        displayType = "quiz";
      } else if (newEvent.type === "assignment") {
        actionType = "New Assignment Added";
        displayType = "course";
      }

      addNotification(
        `${actionType}: ${newEvent.title}`,
        `Course: ${newEvent.courseName} • Date: ${newEvent.date} at ${newEvent.startTime}`,
        displayType,
        newEvent.type === "class" ? "/student/calendar" : newEvent.type === "quiz" ? "/student/quizzes" : "/student/my-courses"
      );

      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create scheduled event.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete/cancel this scheduled event?")) {
      return;
    }
    setLoading(true);
    try {
      await deleteCalendarEvent(event.id || event._id);
      onSave();
      onClose();
    } catch (err) {
      setError("Failed to delete event.");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "class":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "quiz":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "assignment":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const formatType = (type) => {
    if (type === "class") return "Live Lecture";
    if (type === "quiz") return "Quiz Session";
    if (type === "assignment") return "Assignment Deadline";
    return type;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? "Event Details" : "Schedule New Activity"}
      size="md"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {event ? (
        /* Event Details View Mode */
        <div className="space-y-6 text-slate-300">
          <div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getBadgeColor(event.type)}`}>
                {formatType(event.type)}
              </span>
              {event.maxMarks && (
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 text-xs rounded border border-slate-700">
                  {event.maxMarks} Marks
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mt-3 leading-snug">{event.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{event.courseName}</p>
          </div>

          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <FaClock className="text-orange-500 w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Date & Time:</strong> {event.date} | {event.startTime} - {event.endTime}
              </span>
            </div>

            {event.instructorName && (
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <FaUsers className="text-pink-500 w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Instructor:</strong> {event.instructorName}
                </span>
              </div>
            )}

            {event.link && event.type === "class" && (
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <FaVideo className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                <a
                  href={event.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 underline hover:text-emerald-300 transition break-all"
                >
                  {event.link}
                </a>
              </div>
            )}
          </div>

          {event.description && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-slate-300 text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-5 mt-8 gap-4">
            <div>
              {(role === "ADMIN" || role === "INSTRUCTOR") && (
                <Button
                  onClick={handleDelete}
                  className="!bg-red-950/40 !text-red-400 hover:!bg-red-900/40 border border-red-500/20 flex items-center gap-2"
                  disabled={loading}
                >
                  <FaTrash className="w-3.5 h-3.5" />
                  Cancel Event
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={onClose} className="!bg-slate-800 hover:!bg-slate-700 !text-slate-300">
                Close
              </Button>

              {event.type === "class" && event.link && (
                <a href={event.link} target="_blank" rel="noreferrer">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white flex items-center gap-2">
                    <FaVideo className="w-3.5 h-3.5" />
                    Join Lecture
                  </Button>
                </a>
              )}

              {event.type === "quiz" && (
                <a href="/student/quizzes">
                  <Button className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white flex items-center gap-2">
                    <FaClipboardList className="w-3.5 h-3.5" />
                    Go to Quizzes
                  </Button>
                </a>
              )}

              {event.type === "assignment" && (
                <a href="/student/my-courses">
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center gap-2">
                    <FaBookOpen className="w-3.5 h-3.5" />
                    Go to Courses
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Event Creation Form Mode (Admin/Instructor Only) */
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Activity Title *"
            placeholder="e.g. Next.js Routing Workshop"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full text-white"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Activity Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-800 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="class">Online Class (Live Lecture)</option>
                <option value="quiz">Quiz Session</option>
                <option value="assignment">Assignment Deadline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Select Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-800 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">-- Choose Course --</option>
                {courses.map((course) => (
                  <option key={course.id || course._id} value={course.id || course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full text-white"
            />
            <Input
              label="Start Time *"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
              className="w-full text-white"
            />
            <Input
              label="End Time *"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
              className="w-full text-white"
            />
          </div>

          {role === "ADMIN" && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Assign Instructor</label>
              <select
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-800 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Select Instructor --</option>
                {instructors.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === "class" && (
            <Input
              label="Meeting URL (Zoom / Meet) *"
              type="url"
              placeholder="https://meet.google.com/..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              required
              className="w-full text-white"
            />
          )}

          {(formData.type === "quiz" || formData.type === "assignment") && (
            <Input
              label="Max Marks"
              type="number"
              placeholder="e.g. 100"
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
              className="w-full text-white"
            />
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
            <textarea
              rows={3}
              placeholder="Enter activity description, syllabus details, or special instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-800 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
            <Button onClick={onClose} className="!bg-slate-800 hover:!bg-slate-700 !text-slate-300">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Scheduling..." : "Schedule Event"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
